const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const dealerRoutes = require('./routes/dealer.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const saleRoutes = require('./routes/sale.routes');
const stockRoutes = require('./routes/stock.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const settingRoutes = require('./routes/setting.routes');
const paymentRoutes = require('./routes/payment.routes');
const draftRoutes = require('./routes/draft.routes');
const licenseRoutes = require('./routes/license.routes'); // <-- NEW
const { checkLicense } = require('./middleware/license'); // <-- NEW
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));
app.use(express.json());
console.log('[App] Express middlewares initialized.');

// Serve static uploads
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
const uploadDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadDir));
console.log('[App] Static uploads configured at:', uploadDir);

// Health check APIs
app.get('/', (req, res) => {
  res.status(200).send('System is working fine');
});

app.get('/api', (req, res) => {
  res.status(200).send('System is working fine');
});

// Unprotected routes
app.use('/api/license', licenseRoutes); // License config must be accessible to check status

// Global License Check Middleware
// All routes below this will be protected by the license check
app.use('/api', checkLicense);

// Protected Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/drafts', draftRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/paintdesk';

// Forcefully disable retryable writes in the URI string
if (MONGODB_URI.includes('retryWrites=true')) {
  MONGODB_URI = MONGODB_URI.replace('retryWrites=true', 'retryWrites=false');
} else if (!MONGODB_URI.includes('retryWrites=false')) {
  MONGODB_URI += MONGODB_URI.includes('?') ? '&retryWrites=false' : '?retryWrites=false';
}

console.log('[App] Attempting MongoDB connection...');
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) return cachedDb;
  try {
    const db = await mongoose.connect(MONGODB_URI, { retryWrites: false });
    cachedDb = db;
    console.log('[App] Connected to MongoDB successfully.');
    return db;
  } catch (err) {
    console.error('[App] Failed to connect to MongoDB:', err.message);
    throw err;
  }
};

connectDB().then(() => {
  if (!isVercel) {
    app.listen(PORT, () => {
      console.log(`[App] Server is running locally on port ${PORT}`);
    });
  }
}).catch(console.error);

// Required for Vercel deployment
module.exports = app;
