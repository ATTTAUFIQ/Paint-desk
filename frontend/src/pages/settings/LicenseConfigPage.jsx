import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLicense } from '../../context/LicenseContext';
import {
  ShieldAlert, ShieldCheck, Save, Calendar, LayoutGrid, Lock,
  LayoutDashboard, Package, Users, Truck, ShoppingCart, FileText, Archive, Wallet, BarChart2, Settings, AlertTriangle, ScanBarcode
} from 'lucide-react';

const moduleIcons = {
  dashboard: LayoutDashboard,
  products: Package,
  customers: Users,
  dealers: Truck,
  purchases: ShoppingCart,
  sales: FileText,
  stock: Archive,
  quick: ScanBarcode,
  expenses: Wallet,
  reports: BarChart2,
  settings: Settings
};

const LicenseConfigPage = () => {
  const { refreshLicense } = useLicense();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    active: true,
    expiryDate: '',
    modules: {
      dashboard: true,
      products: true,
      customers: true,
      dealers: true,
      purchases: true,
      sales: true,
      stock: true,
      quick: true,
      expenses: true,
      reports: true,
      settings: true
    }
  });

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${baseUrl}/license`);
        if (response.data && response.data.success) {
          const data = response.data.data;
          setConfig({
            active: data.active,
            expiryDate: data.expiryDate ? data.expiryDate.split('T')[0] : '',
            modules: data.modules || config.modules
          });
        }
      } catch (err) {
        console.error('Failed to load license config', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleModuleToggle = (moduleName) => {
    setConfig(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: !prev.modules[moduleName]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${baseUrl}/license`, config);
      alert('License configuration saved successfully!');
      refreshLicense();
    } catch (err) {
      alert('Failed to save license configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">License & Security Management</h1>
              <p className="text-slate-500 text-sm mt-1">Configure system availability, expiration dates, and granular module access control.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Core Settings */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-slate-400" /> System Status
                </h2>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${config.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {config.active ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>
              <div className="p-5">
                <div className={`p-4 rounded-lg border flex items-start gap-3 mb-5 ${config.active ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${config.active ? 'text-emerald-600' : 'text-red-600'}`} />
                  <p className={`text-sm leading-relaxed ${config.active ? 'text-emerald-800' : 'text-red-800'}`}>
                    {config.active
                      ? "System is fully operational. Deactivating will immediately lock all active sessions."
                      : "System is currently locked. Users cannot log in or perform any actions."}
                  </p>
                </div>

                <button
                  onClick={() => setConfig({ ...config, active: !config.active })}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2 border ${config.active
                      ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                      : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                    }`}
                >
                  {config.active ? 'Deactivate System' : 'Activate System'}
                </button>
              </div>
            </div>

            {/* License Expiry */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar size={20} className="text-slate-400" /> License Expiry
                </h2>
              </div>
              <div className="p-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">Automated Lock-out Date</label>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  The ERP system will automatically transition to a locked state after this date.
                </p>
                <div className="relative">
                  <input
                    type="date"
                    value={config.expiryDate}
                    onChange={(e) => setConfig({ ...config, expiryDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Module Access */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-slate-400" /> Module Access Control
                </h2>
                <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
                  {Object.values(config.modules).filter(Boolean).length} of {Object.keys(config.modules).length} Active
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(config.modules).map(([moduleName, isEnabled]) => {
                    const Icon = moduleIcons[moduleName] || LayoutGrid;
                    return (
                      <div
                        key={moduleName}
                        onClick={() => handleModuleToggle(moduleName)}
                        className={`group cursor-pointer rounded-lg border p-4 flex items-center justify-between transition-all duration-200 ${isEnabled
                            ? 'bg-white border-slate-300 hover:border-blue-400 hover:shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md transition-colors ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <h4 className={`text-sm font-semibold capitalize ${isEnabled ? 'text-slate-800' : 'text-slate-500'}`}>
                              {moduleName}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {isEnabled ? 'Access Granted' : 'Access Revoked'}
                            </p>
                          </div>
                        </div>

                        {/* Professional Toggle Switch */}
                        <div className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" style={{ backgroundColor: isEnabled ? '#2563eb' : '#cbd5e1' }}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${isEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LicenseConfigPage;
