import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Save, Upload, Image as ImageIcon, Building2, Phone, Receipt, FileText } from 'lucide-react';
import settingService from '../../services/settingService';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingText, setSavingText] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  
  const { register, handleSubmit, reset } = useForm();
  
  // File refs
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingService.getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
          reset({
            shopName: response.data.shopName,
            shopAddress: response.data.shopAddress,
            phoneNumber: response.data.phoneNumber,
            gstNumber: response.data.gstNumber,
            invoiceFooter: response.data.invoiceFooter,
          });
          
          // Construct base URL from Vite env or fallback to localhost
          const baseUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api', '') 
            : 'http://localhost:5000';

          if (response.data.logoUrl) setLogoPreview(`${baseUrl}${response.data.logoUrl}`);
          if (response.data.signatureUrl) setSignaturePreview(`${baseUrl}${response.data.signatureUrl}`);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onTextSubmit = async (data) => {
    setSavingText(true);
    try {
      await settingService.updateSettings(data);
      alert('Shop details updated successfully!');
    } catch (error) {
      alert('Failed to update details');
    } finally {
      setSavingText(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      setSignaturePreview(URL.createObjectURL(file));
    }
  };

  const uploadImages = async () => {
    if (!logoFile && !signatureFile) {
      alert("Please select an image to upload first.");
      return;
    }

    setSavingImages(true);
    try {
      const formData = new FormData();
      if (logoFile) formData.append('logo', logoFile);
      if (signatureFile) formData.append('signature', signatureFile);

      const response = await settingService.uploadImages(formData);
      if (response.success) {
        alert('Branding images updated successfully!');
        setLogoFile(null);
        setSignatureFile(null);
      }
    } catch (error) {
      alert('Failed to upload images');
    } finally {
      setSavingImages(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const inputClasses = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-blue-600" /> Platform Settings
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Configure your shop details, branding, and invoice templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Shop Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-slate-400" /> General Information
            </h2>
            
            <form onSubmit={handleSubmit(onTextSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shop Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" {...register('shopName', { required: true })} className={inputClasses} placeholder="Enter your business name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
                <textarea {...register('shopAddress')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm" rows="3" placeholder="Shop Address, City, State, Pincode"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" {...register('phoneNumber')} className={inputClasses} placeholder="+91..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
                  <div className="relative">
                    <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" {...register('gstNumber')} className={inputClasses} placeholder="GSTIN" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Footer Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-4 text-slate-400" size={18} />
                  <textarea {...register('invoiceFooter')} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm" rows="2" placeholder="Thank you for your business!"></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={savingText} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20">
                  <Save size={18} /> {savingText ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Branding & Images */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ImageIcon size={20} className="text-slate-400" /> Branding Assets
            </h2>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Shop Logo</label>
              <div className="relative group border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-2xl p-6 text-center transition-all cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="h-20 mx-auto object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-sm"><Upload size={18} /></div>
                    <p className="text-xs font-bold text-slate-500">Click or drag logo here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Digital Signature</label>
              <div className="relative group border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-2xl p-6 text-center transition-all cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" onChange={handleSignatureChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {signaturePreview ? (
                  <img src={signaturePreview} alt="Signature Preview" className="h-16 mx-auto object-contain mix-blend-multiply" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-sm"><Upload size={18} /></div>
                    <p className="text-xs font-bold text-slate-500">Upload signature scan</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={uploadImages}
                disabled={savingImages || (!logoFile && !signatureFile)} 
                className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md"
              >
                <Upload size={18} /> {savingImages ? 'Uploading...' : 'Upload Assets'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
