import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import LicenseError from './components/common/LicenseError';
import LicenseConfigPage from './pages/settings/LicenseConfigPage';
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

const AppContent = () => {
  const { license, loading, hasModuleAccess } = useLicense();

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
    document.addEventListener('input', handleInput, true); 
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('input', handleInput, true);
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const isInactive = license && !license.active;
  const isExpired = license && license.expiryDate && new Date() > new Date(license.expiryDate);

  const ProtectedRoute = ({ moduleName, element }) => {
    return hasModuleAccess(moduleName) ? element : <Navigate to="/" replace />;
  };

  return (
    <Routes>
      <Route path="/license-config" element={<LicenseConfigPage />} />
      
      <Route path="/" element={isInactive ? <LicenseError type="deactivated" /> : isExpired ? <LicenseError type="expired" /> : <Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Module protected routes */}
        <Route path="dashboard" element={<ProtectedRoute moduleName="dashboard" element={<Dashboard />} />} />
        
        <Route path="products" element={<ProtectedRoute moduleName="products" element={<ProductList />} />} />
        <Route path="products/new" element={<ProtectedRoute moduleName="products" element={<ProductForm />} />} />
        <Route path="products/edit/:id" element={<ProtectedRoute moduleName="products" element={<ProductForm />} />} />
        
        <Route path="customers" element={<ProtectedRoute moduleName="customers" element={<CustomerList />} />} />
        <Route path="customers/new" element={<ProtectedRoute moduleName="customers" element={<CustomerForm />} />} />
        <Route path="customers/edit/:id" element={<ProtectedRoute moduleName="customers" element={<CustomerForm />} />} />
        <Route path="customers/:id" element={<ProtectedRoute moduleName="customers" element={<CustomerDetails />} />} />
        
        <Route path="dealers" element={<ProtectedRoute moduleName="dealers" element={<DealerList />} />} />
        <Route path="dealers/new" element={<ProtectedRoute moduleName="dealers" element={<DealerForm />} />} />
        <Route path="dealers/edit/:id" element={<ProtectedRoute moduleName="dealers" element={<DealerForm />} />} />
        <Route path="dealers/:id" element={<ProtectedRoute moduleName="dealers" element={<DealerDetails />} />} />
        
        <Route path="purchases" element={<ProtectedRoute moduleName="purchases" element={<PurchaseList />} />} />
        <Route path="purchases/new" element={<ProtectedRoute moduleName="purchases" element={<PurchaseForm />} />} />
        <Route path="purchases/edit/:id" element={<ProtectedRoute moduleName="purchases" element={<PurchaseForm />} />} />
        <Route path="purchases/:id" element={<ProtectedRoute moduleName="purchases" element={<PurchaseDetails />} />} />
        
        <Route path="sales" element={<ProtectedRoute moduleName="sales" element={<SaleList />} />} />
        <Route path="sales/new" element={<ProtectedRoute moduleName="sales" element={<SaleForm />} />} />
        <Route path="sales/edit/:id" element={<ProtectedRoute moduleName="sales" element={<SaleForm />} />} />
        <Route path="sales/:id" element={<ProtectedRoute moduleName="sales" element={<SaleDetails />} />} />
        
        {/* Stock is tied to products */}
        <Route path="stock" element={<ProtectedRoute moduleName="products" element={<StockDashboard />} />} />
        <Route path="stock/history" element={<ProtectedRoute moduleName="products" element={<StockMovementHistory />} />} />
        
        <Route path="expenses" element={<ProtectedRoute moduleName="expenses" element={<ExpenseDashboard />} />} />
        
        <Route path="reports" element={<ProtectedRoute moduleName="reports" element={<ReportDashboard />} />} />
        
        <Route path="settings" element={<ProtectedRoute moduleName="settings" element={<SettingsPage />} />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <LicenseProvider>
        <AppContent />
      </LicenseProvider>
    </Router>
  );
}

export default App;
