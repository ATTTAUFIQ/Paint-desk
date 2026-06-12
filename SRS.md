# Software Requirements Specification (SRS)
## Paint Wholesaler ERP System

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the requirements, architecture, and overall design of the Paint Wholesaler ERP System. This web-based application is designed to streamline operations for a paint wholesale business, encompassing inventory control, sales, purchases, financial management, and reporting.

### 1.2 Scope
The system will manage the core business operations including Products, Customers, Dealers/Suppliers, Purchases, Sales, Invoicing, Stock, Expenses, and Profit tracking. It provides a centralized dashboard and detailed reporting to facilitate informed decision-making.

### 1.3 Technology Stack
* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT (JSON Web Tokens)

---

## 2. Module Breakdown

The system is divided into the following key modules:
1. **Dashboard:** High-level overview of business metrics (total sales, purchases, low stock alerts, pending balances).
2. **Product Management:** Complete lifecycle management of paint products.
3. **Customer Management:** Tracking of wholesale/retail customers and their outstanding balances.
4. **Dealer/Supplier Management:** Tracking of suppliers and pending payables.
5. **Purchase Management:** Recording inbound inventory, adjusting stock, and managing dealer balances.
6. **Sales Management & Invoice Generation:** Creating sales orders, deducting stock, and generating GST-compliant invoices.
7. **Stock Management:** Real-time inventory tracking, alerts for low stock and expirations.
8. **Expense Management:** Recording operational expenditures.
9. **Profit Management:** Calculating gross and net profits based on sales, purchases, and expenses.
10. **Reports:** Generating customizable data extracts for various modules.
11. **Settings:** Application-wide configurations (tax rates, business details, user management).

---

## 3. Functional Requirements

### 3.1 Product Management
* The system shall allow users to Add, Edit, View, and Delete products.
* Products must track the following fields: `Product Name`, `Product Code`, `Brand`, `Unit Type` (e.g., Ltr, Kg, Pcs), `Purchase Price`, `Selling Price`, `GST Percentage`, `Current Stock`, `Low Stock Limit`, `Expiry Date`.
* The system shall highlight products that fall below the `Low Stock Limit` or are nearing their `Expiry Date`.

### 3.2 Customer Management
* The system shall allow users to manage customer records.
* Customer fields must include: `Name`, `Mobile Number`, `Address`, `GST Number`, `Outstanding Balance`.
* The system shall update the `Outstanding Balance` dynamically based on sales and payments.

### 3.3 Dealer/Supplier Management
* The system shall allow users to manage dealer/supplier records.
* Dealer fields must include: `Name`, `Mobile Number`, `Address`, `GST Number`, `Pending Balance`.
* The system shall update the `Pending Balance` dynamically based on purchases and payments made to the dealer.

### 3.4 Purchase Management
* The system shall allow users to record purchases from Dealers.
* Purchase records must include: `Purchase Number`, `Dealer Selection`, `Products Selection`, `Quantity`, `Purchase Price`, `GST`, `Total Amount`.
* **Auto Stock Update:** Upon saving a purchase, the system shall automatically increment the `Current Stock` of the respective products.
* The system shall allow applying partial or full payments, updating the Dealer's `Pending Balance` accordingly.

### 3.5 Sales Management & Invoicing
* The system shall allow users to record sales to Customers.
* Sales features must include: `Customer Selection`, `Product Selection`, `Quantity`, `GST Calculation`, `Payment Collection`, `Total Amount`.
* **Auto Stock Deduction:** Upon saving a sale, the system shall automatically decrement the `Current Stock` of the respective products.
* The system shall prevent sales if the requested `Quantity` exceeds `Current Stock`.
* **Invoice Generation:** The system shall generate a printable/downloadable GST-compliant invoice for each sale.

### 3.6 Expense & Profit Management
* The system shall allow users to log daily/monthly expenses.
* The system shall calculate gross profit (Sales Revenue - Cost of Goods Sold) and net profit (Gross Profit - Expenses).

### 3.7 Reports
* The system shall generate reports for:
  * Sales (Daily/Monthly/Date-Range)
  * Purchases (Daily/Monthly/Date-Range)
  * Profit & Loss
  * Expenses
  * Customer Outstanding Balances
  * Dealer Outstanding Balances
  * Stock Status (Current Inventory, Low Stock, Expiring Soon)

---

## 4. Non-Functional Requirements

* **Performance:** The system should load dashboard data in under 2 seconds. APIs should respond within 500ms.
* **Security:** Use HTTPS. Implement JWT-based authentication. Passwords must be hashed using bcrypt. Protect against SQL/NoSQL injection and XSS.
* **Scalability:** The application must be designed to handle a growing number of products and transactions without performance degradation.
* **Usability:** The interface must be responsive (desktop and tablet optimized), intuitive, and require minimal training for the staff.
* **Reliability/Availability:** The system should target 99.9% uptime with automated daily database backups.
* **Data Integrity:** Implement ACID properties for database transactions (especially during Sales and Purchases to ensure stock consistency).

---

## 5. User Flow

1. **Login:** Admin logs into the system using valid credentials.
2. **Dashboard Overview:** Admin views today's sales, purchases, low stock alerts, and outstanding balances.
3. **Inventory Setup (First Time/Ongoing):**
   * Admin navigates to **Dealers** -> Adds Suppliers.
   * Admin navigates to **Products** -> Adds Paint Products.
4. **Recording a Purchase:**
   * Admin navigates to **Purchases** -> Creates a New Purchase -> Selects Dealer -> Selects Products & Quantities.
   * *System updates product stock and dealer pending balance.*
5. **Recording a Sale:**
   * Admin navigates to **Customers** -> Adds Customer (if new).
   * Admin navigates to **Sales** -> Creates New Sale -> Selects Customer -> Selects Products.
   * *System calculates GST, deducts stock, updates customer outstanding balance.*
   * Admin clicks "Generate Invoice" -> Prints/Downloads PDF.
6. **End of Day/Month:**
   * Admin enters daily operational costs in **Expenses**.
   * Admin views **Reports** -> Checks Profit/Loss, Outstanding Balances, and Stock Reports.

---

## 6. Screen List

1. **Login Screen**
2. **Dashboard Overview Screen**
3. **Product List Screen** (with Search, Filter, Pagination)
4. **Add/Edit Product Modal/Screen**
5. **Customer List Screen**
6. **Add/Edit Customer Modal/Screen**
7. **Dealer List Screen**
8. **Add/Edit Dealer Modal/Screen**
9. **Purchase List Screen**
10. **Create/View Purchase Screen**
11. **Sales List Screen**
12. **Create Sale (POS View) Screen**
13. **Invoice View/Print Screen**
14. **Expense List & Add Expense Screen**
15. **Reports Dashboard Screen**
16. **Settings Screen** (Profile, Tax Defaults, App Config)

---

## 7. Database Tables (MongoDB Collections)

### `users`
* `_id`, `name`, `email`, `password_hash`, `role`, `createdAt`

### `products`
* `_id`, `productCode`, `name`, `brand`, `unitType`, `purchasePrice`, `sellingPrice`, `gstPercentage`, `currentStock`, `lowStockLimit`, `expiryDate`, `createdAt`, `updatedAt`

### `customers`
* `_id`, `name`, `mobileNumber`, `address`, `gstNumber`, `outstandingBalance`, `createdAt`, `updatedAt`

### `dealers`
* `_id`, `name`, `mobileNumber`, `address`, `gstNumber`, `pendingBalance`, `createdAt`, `updatedAt`

### `purchases`
* `_id`, `purchaseNumber`, `dealerId` (Ref: dealers), `subTotal`, `totalGst`, `totalAmount`, `amountPaid`, `paymentStatus`, `purchaseDate`, `createdAt`

### `purchase_items`
* `_id`, `purchaseId` (Ref: purchases), `productId` (Ref: products), `quantity`, `unitPrice`, `gstAmount`, `totalPrice`

### `sales`
* `_id`, `invoiceNumber`, `customerId` (Ref: customers), `subTotal`, `totalGst`, `totalAmount`, `amountPaid`, `paymentStatus`, `saleDate`, `createdAt`

### `sale_items`
* `_id`, `saleId` (Ref: sales), `productId` (Ref: products), `quantity`, `unitPrice`, `gstAmount`, `totalPrice`

### `expenses`
* `_id`, `title`, `description`, `amount`, `expenseDate`, `createdAt`

---

## 8. Relationships

* **1-to-Many:** `Dealer` to `Purchases` (A dealer can have multiple purchases).
* **1-to-Many:** `Customer` to `Sales` (A customer can have multiple sales).
* **1-to-Many:** `Purchase` to `Purchase_Items` (A purchase contains multiple items).
* **1-to-Many:** `Sale` to `Sale_Items` (A sale contains multiple items).
* **Many-to-1:** `Purchase_Items` to `Product` (Items link back to the core product catalog).
* **Many-to-1:** `Sale_Items` to `Product` (Items link back to the core product catalog).

---

## 9. API List

**Base URL:** `/api/v1`

### Authentication
* `POST /auth/login` - Authenticate user & receive JWT

### Products
* `GET /products` - List all products (with filters)
* `POST /products` - Create new product
* `GET /products/:id` - Get product details
* `PUT /products/:id` - Update product
* `DELETE /products/:id` - Delete product

### Customers
* `GET /customers` - List all customers
* `POST /customers` - Create new customer
* `PUT /customers/:id` - Update customer & balance

### Dealers
* `GET /dealers` - List all dealers
* `POST /dealers` - Create new dealer
* `PUT /dealers/:id` - Update dealer & balance

### Purchases
* `GET /purchases` - List purchases
* `POST /purchases` - Create purchase (triggers stock increment & dealer balance update)
* `GET /purchases/:id` - Get purchase details with items

### Sales (Invoicing)
* `GET /sales` - List sales/invoices
* `POST /sales` - Create sale (triggers stock decrement & customer balance update)
* `GET /sales/:id` - Get sale details for invoice generation

### Expenses
* `GET /expenses` - List expenses
* `POST /expenses` - Add new expense

### Reports & Dashboard
* `GET /dashboard/metrics` - High-level metrics for dashboard
* `GET /reports/sales` - Sales data based on date range
* `GET /reports/purchases` - Purchase data based on date range
* `GET /reports/profit` - Calculated profit/loss
* `GET /reports/stock` - Current inventory and low stock alerts

---

## 10. Folder Structure

```text
paint-erp/
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── config/           # DB & environment config
│   │   ├── controllers/      # Route logic (productController, saleController...)
│   │   ├── middlewares/      # Auth & Error handling
│   │   ├── models/           # Mongoose schemas (Product, Customer...)
│   │   ├── routes/           # API definitions
│   │   ├── services/         # Business logic (e.g., PDF Invoice generation)
│   │   ├── utils/            # Helper functions
│   │   └── server.js         # Entry point
│   ├── .env
│   └── package.json
│
└── frontend/                 # React.js (Vite/Create React App)
    ├── src/
    │   ├── assets/           # Images, generic CSS
    │   ├── components/       # Reusable UI (Buttons, Modals, Tables)
    │   ├── contexts/         # State management (AuthContext)
    │   ├── hooks/            # Custom React hooks
    │   ├── layouts/          # Dashboard Layout, Sidebar, Navbar
    │   ├── pages/            # Main screens (Dashboard, Products, Sales, Reports)
    │   ├── services/         # Axios API calls
    │   ├── utils/            # Formatting (Currency, Dates)
    │   ├── App.jsx           # Routing setup
    │   └── main.jsx          # Entry point
    ├── index.html
    ├── package.json
    └── tailwind.config.js    # (If using TailwindCSS)
```

---

## 11. Development Roadmap

### Phase 1: Planning & Setup (Week 1)
* Requirement finalization (this SRS).
* Set up GitHub repositories.
* Initialize Node.js backend and React frontend.
* Configure MongoDB database and basic CI/CD.

### Phase 2: Core Foundation & Inventory (Week 2-3)
* Implement Authentication (Login, JWT).
* Build Dashboard layout (Sidebar, Header).
* Implement Product Management (CRUD operations, UI).
* Implement Customer and Dealer Management.

### Phase 3: Transaction Processing (Week 4-5)
* Implement Purchase Management & Auto-stock update logic.
* Implement Sales Management & Auto-stock deduction logic.
* Build the POS/Sale screen interface.

### Phase 4: Financials & Invoicing (Week 6)
* Implement Invoice generation (PDF generation).
* Implement Expense Management.
* Develop Outstanding Balance tracking logic for Customers and Dealers.

### Phase 5: Reporting & Dashboard Analytics (Week 7)
* Populate Dashboard with live metric charts.
* Implement Reports module (Sales, Purchases, Profit/Loss, Stock Alerts).

### Phase 6: Testing, Refinement & Deployment (Week 8)
* End-to-end testing of business flows.
* UI/UX polish and responsive design checks.
* Production deployment to AWS / Vercel / Render.
* User training and handover.
