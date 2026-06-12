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
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check APIs
app.get('/', (req, res) => {
  res.status(200).send('System is working fine');
});

app.get('/api', (req, res) => {
  res.status(200).send('System is working fine');
});

// Routes
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

// Database connection
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/paintdesk';

// Forcefully disable retryable writes in the URI string
if (MONGODB_URI.includes('retryWrites=true')) {
  MONGODB_URI = MONGODB_URI.replace('retryWrites=true', 'retryWrites=false');
} else if (!MONGODB_URI.includes('retryWrites=false')) {
  MONGODB_URI += MONGODB_URI.includes('?') ? '&retryWrites=false' : '?retryWrites=false';
}

mongoose.connect(MONGODB_URI, { retryWrites: false })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
