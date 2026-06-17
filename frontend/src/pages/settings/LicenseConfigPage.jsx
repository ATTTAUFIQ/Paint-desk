import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLicense } from '../../context/LicenseContext';
import { ShieldAlert, ShieldCheck, Save, Calendar, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';

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
    return <div className="p-8 text-center text-slate-500">Loading Configuration...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <ShieldAlert className="text-indigo-600" /> License & Security Control
              </h1>
              <p className="text-slate-500 mt-2">Manage ERP activation, set expiry dates, and toggle module access.</p>
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* ERP Status */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${config.active ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {config.active ? <ShieldCheck className="text-green-600" /> : <ShieldAlert className="text-red-600" />}
                  ERP Status
                </h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${config.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {config.active ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-6">When deactivated, the entire ERP system will be locked for all users immediately.</p>
              
              <button 
                onClick={() => setConfig({ ...config, active: !config.active })}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  config.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {config.active ? 'DEACTIVATE ERP NOW' : 'ACTIVATE ERP'}
              </button>
            </div>

            {/* Expiry Date */}
            <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white">
               <div className="flex items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="text-blue-500" /> License Expiry Date
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">The system will automatically lock when the current date passes this expiry date.</p>
              
              <input 
                type="date" 
                value={config.expiryDate}
                onChange={(e) => setConfig({ ...config, expiryDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Module Access */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LayoutGrid className="text-slate-500" /> Module Access Control
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(config.modules).map(([moduleName, isEnabled]) => (
                <div 
                  key={moduleName} 
                  onClick={() => handleModuleToggle(moduleName)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isEnabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className={`font-semibold capitalize ${isEnabled ? 'text-indigo-900' : 'text-slate-500'}`}>
                    {moduleName}
                  </span>
                  {isEnabled ? <CheckCircle2 className="text-indigo-600" /> : <XCircle className="text-slate-400" />}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LicenseConfigPage;
