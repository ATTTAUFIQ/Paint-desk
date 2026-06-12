# MongoDB Database Schema Architecture
## Paint Wholesaler ERP System

This document outlines the optimized production-ready MongoDB database architecture for the Paint Wholesaler ERP System.

---

### General Notes for Production:
*   **Decimals for Currency:** For all monetary fields (`purchasePrice`, `sellingPrice`, `totalAmount`, etc.), the `Decimal128` data type is strongly recommended to prevent floating-point precision errors in JavaScript/MongoDB.
*   **Timestamps:** All collections implicitly use Mongoose's `{ timestamps: true }` which adds `createdAt` and `updatedAt` as standard `Date` fields.
*   **Soft Deletes:** It is recommended to use `isActive` or `isDeleted` booleans instead of hard-deleting records to preserve audit trails.

---

## 1. Products Collection

**Collection Name:** `products`

**Fields, Types & Validations:**
*   `_id`: ObjectId (Auto-generated)
*   `productCode`: String (Required, Unique, Trimmed)
*   `name`: String (Required, Trimmed)
*   `brand`: String (Required, Index)
*   `unitType`: String (Required, Enum: `['Ltr', 'Kg', 'Pcs', 'Gal']`)
*   `purchasePrice`: Decimal128 (Required, Min: 0)
*   `sellingPrice`: Decimal128 (Required, Min: 0)
*   `gstPercentage`: Number (Required, Min: 0, Max: 100)
*   `currentStock`: Number (Required, Default: 0, Min: 0)
*   `lowStockLimit`: Number (Required, Default: 10, Min: 0)
*   `expiryDate`: Date (Optional)
*   `isActive`: Boolean (Default: true)

**Indexes:**
*   `{ productCode: 1 }` (Unique)
*   `{ brand: 1 }`
*   `{ currentStock: 1 }` (For low stock queries)

**Relationships:** Referenced by `purchaseItems`, `saleItems`, and `stockMovements`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5f9b4f8c2b74001c3e1a1" },
  "productCode": "AP-ROY-1L",
  "name": "Asian Paints Royale Luxury Emulsion",
  "brand": "Asian Paints",
  "unitType": "Ltr",
  "purchasePrice": { "$numberDecimal": "450.00" },
  "sellingPrice": { "$numberDecimal": "550.00" },
  "gstPercentage": 18,
  "currentStock": 120,
  "lowStockLimit": 20,
  "expiryDate": { "$date": "2028-12-31T00:00:00.000Z" },
  "isActive": true,
  "createdAt": { "$date": "2024-01-01T10:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T10:00:00.000Z" }
}
```

---

## 2. Customers Collection

**Collection Name:** `customers`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `name`: String (Required)
*   `mobileNumber`: String (Required, Unique, Match Regex for valid phone)
*   `address`: String (Optional)
*   `gstNumber`: String (Optional, Regex validation for GST format)
*   `outstandingBalance`: Decimal128 (Default: 0.00)
*   `isActive`: Boolean (Default: true)

**Indexes:**
*   `{ mobileNumber: 1 }` (Unique)
*   `{ name: 1 }`

**Relationships:** Referenced by `sales` and `payments`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5fc2af8c2b74001c3e1a2" },
  "name": "Ramesh Hardwares",
  "mobileNumber": "9876543210",
  "address": "123 Market Road, City Center",
  "gstNumber": "22AAAAA0000A1Z5",
  "outstandingBalance": { "$numberDecimal": "5200.50" },
  "isActive": true
}
```

---

## 3. Dealers (Suppliers) Collection

**Collection Name:** `dealers`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `name`: String (Required)
*   `mobileNumber`: String (Required, Unique)
*   `address`: String (Optional)
*   `gstNumber`: String (Optional)
*   `pendingBalance`: Decimal128 (Default: 0.00)
*   `isActive`: Boolean (Default: true)

**Indexes:**
*   `{ mobileNumber: 1 }` (Unique)
*   `{ name: 1 }`

**Relationships:** Referenced by `purchases` and `payments`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5fcd5f8c2b74001c3e1a3" },
  "name": "Nerolac Distributors HQ",
  "mobileNumber": "9988776655",
  "address": "Industrial Estate, Phase 2",
  "gstNumber": "27BBBBB1111B1Z2",
  "pendingBalance": { "$numberDecimal": "150000.00" },
  "isActive": true
}
```

---

## 4. Purchases Collection

**Collection Name:** `purchases`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `purchaseNumber`: String (Required, Unique)
*   `dealerId`: ObjectId (Required, Ref: 'dealers')
*   `subTotal`: Decimal128 (Required, Min: 0)
*   `totalGst`: Decimal128 (Required, Min: 0)
*   `totalAmount`: Decimal128 (Required, Min: 0)
*   `amountPaid`: Decimal128 (Required, Default: 0)
*   `paymentStatus`: String (Required, Enum: `['Pending', 'Partial', 'Paid']`)
*   `purchaseDate`: Date (Required, Default: Date.now)

**Indexes:**
*   `{ purchaseNumber: 1 }` (Unique)
*   `{ dealerId: 1 }`
*   `{ purchaseDate: -1 }` (Optimized for recent queries)

**Relationships:** Belongs to `dealers`. Has many `purchaseItems`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5fda3f8c2b74001c3e1b0" },
  "purchaseNumber": "PUR-2024-001",
  "dealerId": { "$oid": "60d5fcd5f8c2b74001c3e1a3" },
  "subTotal": { "$numberDecimal": "10000.00" },
  "totalGst": { "$numberDecimal": "1800.00" },
  "totalAmount": { "$numberDecimal": "11800.00" },
  "amountPaid": { "$numberDecimal": "5000.00" },
  "paymentStatus": "Partial",
  "purchaseDate": { "$date": "2024-03-15T09:30:00.000Z" }
}
```

---

## 5. Purchase Items Collection

**Collection Name:** `purchaseItems`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `purchaseId`: ObjectId (Required, Ref: 'purchases')
*   `productId`: ObjectId (Required, Ref: 'products')
*   `quantity`: Number (Required, Min: 1)
*   `unitPrice`: Decimal128 (Required, Min: 0)
*   `gstAmount`: Decimal128 (Required, Min: 0)
*   `totalPrice`: Decimal128 (Required, Min: 0)

**Indexes:**
*   `{ purchaseId: 1 }`
*   `{ productId: 1 }`

**Relationships:** Belongs to `purchases`. References `products`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5fdf1f8c2b74001c3e1b1" },
  "purchaseId": { "$oid": "60d5fda3f8c2b74001c3e1b0" },
  "productId": { "$oid": "60d5f9b4f8c2b74001c3e1a1" },
  "quantity": 50,
  "unitPrice": { "$numberDecimal": "200.00" },
  "gstAmount": { "$numberDecimal": "1800.00" },
  "totalPrice": { "$numberDecimal": "11800.00" }
}
```

---

## 6. Sales Collection

**Collection Name:** `sales`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `invoiceNumber`: String (Required, Unique)
*   `customerId`: ObjectId (Required, Ref: 'customers')
*   `subTotal`: Decimal128 (Required, Min: 0)
*   `totalGst`: Decimal128 (Required, Min: 0)
*   `totalAmount`: Decimal128 (Required, Min: 0)
*   `amountPaid`: Decimal128 (Required, Default: 0)
*   `paymentStatus`: String (Required, Enum: `['Pending', 'Partial', 'Paid']`)
*   `saleDate`: Date (Required, Default: Date.now)

**Indexes:**
*   `{ invoiceNumber: 1 }` (Unique)
*   `{ customerId: 1 }`
*   `{ saleDate: -1 }`

**Relationships:** Belongs to `customers`. Has many `saleItems`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5fea9f8c2b74001c3e1c0" },
  "invoiceNumber": "INV-2024-001",
  "customerId": { "$oid": "60d5fc2af8c2b74001c3e1a2" },
  "subTotal": { "$numberDecimal": "2000.00" },
  "totalGst": { "$numberDecimal": "360.00" },
  "totalAmount": { "$numberDecimal": "2360.00" },
  "amountPaid": { "$numberDecimal": "2360.00" },
  "paymentStatus": "Paid",
  "saleDate": { "$date": "2024-03-16T14:15:00.000Z" }
}
```

---

## 7. Sale Items Collection

**Collection Name:** `saleItems`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `saleId`: ObjectId (Required, Ref: 'sales')
*   `productId`: ObjectId (Required, Ref: 'products')
*   `quantity`: Number (Required, Min: 1)
*   `unitPrice`: Decimal128 (Required, Min: 0)
*   `gstAmount`: Decimal128 (Required, Min: 0)
*   `totalPrice`: Decimal128 (Required, Min: 0)

**Indexes:**
*   `{ saleId: 1 }`
*   `{ productId: 1 }`

**Relationships:** Belongs to `sales`. References `products`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d5ff01f8c2b74001c3e1c1" },
  "saleId": { "$oid": "60d5fea9f8c2b74001c3e1c0" },
  "productId": { "$oid": "60d5f9b4f8c2b74001c3e1a1" },
  "quantity": 10,
  "unitPrice": { "$numberDecimal": "200.00" },
  "gstAmount": { "$numberDecimal": "360.00" },
  "totalPrice": { "$numberDecimal": "2360.00" }
}
```

---

## 8. Payments Collection

**Collection Name:** `payments`

*Note: Handles multi-payment tracking for both invoices and dealer bills.*

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `paymentReference`: String (Unique auto-generated Receipt No)
*   `referenceType`: String (Required, Enum: `['Sale', 'Purchase']`)
*   `referenceId`: ObjectId (Required, Ref: 'sales' or 'purchases')
*   `entityType`: String (Required, Enum: `['Customer', 'Dealer']`)
*   `entityId`: ObjectId (Required, Ref: 'customers' or 'dealers')
*   `amount`: Decimal128 (Required, Min: 0.01)
*   `paymentMode`: String (Required, Enum: `['Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque']`)
*   `transactionId`: String (Optional, e.g., UPI Ref or Cheque No)
*   `paymentDate`: Date (Required, Default: Date.now)
*   `remarks`: String (Optional)

**Indexes:**
*   `{ referenceId: 1 }`
*   `{ entityId: 1 }`
*   `{ paymentDate: -1 }`

**Relationships:** Links to `sales`/`purchases` and `customers`/`dealers`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d60012f8c2b74001c3e1d0" },
  "paymentReference": "REC-2024-001",
  "referenceType": "Sale",
  "referenceId": { "$oid": "60d5fea9f8c2b74001c3e1c0" },
  "entityType": "Customer",
  "entityId": { "$oid": "60d5fc2af8c2b74001c3e1a2" },
  "amount": { "$numberDecimal": "2360.00" },
  "paymentMode": "UPI",
  "transactionId": "UPI1234567890",
  "paymentDate": { "$date": "2024-03-16T14:20:00.000Z" }
}
```

---

## 9. Expenses Collection

**Collection Name:** `expenses`

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `title`: String (Required)
*   `category`: String (Required, e.g., 'Rent', 'Salaries', 'Utilities', 'Logistics')
*   `description`: String (Optional)
*   `amount`: Decimal128 (Required, Min: 0.01)
*   `expenseDate`: Date (Required, Default: Date.now)
*   `recordedBy`: ObjectId (Required, Ref: 'users')

**Indexes:**
*   `{ category: 1 }`
*   `{ expenseDate: -1 }`

**Relationships:** Belongs to `users`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d60100f8c2b74001c3e1e0" },
  "title": "Shop Rent March",
  "category": "Rent",
  "description": "Monthly shop rent paid to landlord",
  "amount": { "$numberDecimal": "15000.00" },
  "expenseDate": { "$date": "2024-03-01T00:00:00.000Z" },
  "recordedBy": { "$oid": "60d50000f8c2b74001c3e000" }
}
```

---

## 10. Stock Movements Collection

**Collection Name:** `stockMovements`

*Note: This is a critical audit trail for calculating inventory history and tracing discrepancies.*

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `productId`: ObjectId (Required, Ref: 'products')
*   `movementType`: String (Required, Enum: `['IN', 'OUT', 'ADJUSTMENT', 'RETURN']`)
*   `quantity`: Number (Required. Positive for IN, Negative for OUT)
*   `referenceType`: String (Required, Enum: `['Purchase', 'Sale', 'Manual', 'Return']`)
*   `referenceId`: ObjectId (Optional, Ref: 'sales' or 'purchases')
*   `previousStock`: Number (Required)
*   `newStock`: Number (Required)
*   `remarks`: String (Optional, mandatory if 'Manual' adjustment)
*   `movementDate`: Date (Required, Default: Date.now)

**Indexes:**
*   `{ productId: 1, movementDate: -1 }`
*   `{ referenceId: 1 }`

**Relationships:** Belongs to `products`.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d60200f8c2b74001c3e1f0" },
  "productId": { "$oid": "60d5f9b4f8c2b74001c3e1a1" },
  "movementType": "OUT",
  "quantity": -10,
  "referenceType": "Sale",
  "referenceId": { "$oid": "60d5fea9f8c2b74001c3e1c0" },
  "previousStock": 130,
  "newStock": 120,
  "remarks": "Sale deducted stock",
  "movementDate": { "$date": "2024-03-16T14:15:00.000Z" }
}
```

---

## 11. Settings Collection

**Collection Name:** `settings`

*Note: Typically contains a single document updated repeatedly.*

**Fields, Types & Validations:**
*   `_id`: ObjectId
*   `companyName`: String (Required)
*   `companyAddress`: String (Required)
*   `companyEmail`: String (Required, Match valid email)
*   `companyPhone`: String (Required)
*   `companyGst`: String (Optional)
*   `defaultGstPercentage`: Number (Default: 18)
*   `currencySymbol`: String (Default: '₹')
*   `invoicePrefix`: String (Default: 'INV-')
*   `purchasePrefix`: String (Default: 'PUR-')

**Indexes:** None needed as it's a single lookup document.

**Relationships:** None.

**Sample Document:**
```json
{
  "_id": { "$oid": "60d60300f8c2b74001c3e200" },
  "companyName": "ColorWorld Paint Distributors",
  "companyAddress": "45 Industrial Hub, Sector 5",
  "companyEmail": "billing@colorworld.com",
  "companyPhone": "+91-9876543210",
  "companyGst": "22AAAAA0000A1Z5",
  "defaultGstPercentage": 18,
  "currencySymbol": "₹",
  "invoicePrefix": "CW-INV-",
  "purchasePrefix": "CW-PUR-"
}
```
