import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import DealerList from './pages/dealers/DealerList';
import DealerForm from './pages/dealers/DealerForm';
import DealerDetails from './pages/dealers/DealerDetails';
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseForm from './pages/purchases/PurchaseForm';
import PurchaseDetails from './pages/purchases/PurchaseDetails';
import SaleList from './pages/sales/SaleList';
import SaleForm from './pages/sales/SaleForm';
import SaleDetails from './pages/sales/SaleDetails';
import StockDashboard from './pages/stock/StockDashboard';
import StockMovementHistory from './pages/stock/StockMovementHistory';
import ExpenseDashboard from './pages/expenses/ExpenseDashboard';
import ReportDashboard from './pages/reports/ReportDashboard';
import SettingsPage from './pages/settings/SettingsPage';

// Placeholder for other routes
const Placeholder = ({ title }) => (
  <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <p className="text-slate-600 mt-4">Module under construction.</p>
  </div>
);

function App() {
  // Prevent mouse wheel from changing number input values globally
  // And restrict all number inputs to a maximum of 2 decimal places
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    
    let isHandlingInput = false;
    const handleInput = (e) => {
      if (isHandlingInput) return;
      if (e.target && e.target.type === 'number') {
        const val = e.target.value;
        if (val.includes('.')) {
          const parts = val.split('.');
          if (parts[1].length > 2) {
            isHandlingInput = true;
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(e.target, parts[0] + '.' + parts[1].slice(0, 2));
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
            isHandlingInput = false;
          }
        }
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('input', handleInput, true); // Capture phase to intercept early
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('input', handleInput, true);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="dealers" element={<DealerList />} />
          <Route path="dealers/new" element={<DealerForm />} />
          <Route path="dealers/edit/:id" element={<DealerForm />} />
          <Route path="dealers/:id" element={<DealerDetails />} />
          <Route path="purchases" element={<PurchaseList />} />
          <Route path="purchases/new" element={<PurchaseForm />} />
          <Route path="purchases/edit/:id" element={<PurchaseForm />} />
          <Route path="purchases/:id" element={<PurchaseDetails />} />
          <Route path="sales" element={<SaleList />} />
          <Route path="sales/new" element={<SaleForm />} />
          <Route path="sales/edit/:id" element={<SaleForm />} />
          <Route path="sales/:id" element={<SaleDetails />} />
          <Route path="stock" element={<StockDashboard />} />
          <Route path="stock/history" element={<StockMovementHistory />} />
          <Route path="expenses" element={<ExpenseDashboard />} />
          <Route path="reports" element={<ReportDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="license-config" element={<Placeholder title="License Configuration" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
