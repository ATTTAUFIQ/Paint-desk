import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Package } from 'lucide-react';
import productService from '../../services/productService';

const ProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      productCode: `PRD-${Date.now().toString().slice(-5)}`,
      name: '',
      brand: '',
      unitType: 'Ltr',
      purchasePrice: '',
      sellingPrice: '',
      gstPercentage: 18,
      currentStock: 0,
      lowStockLimit: 10,
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await productService.createProduct(data);
      if (response.success) {
        reset();
        onSuccess(response.data);
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to create product. Please try again.');
    }
  };

  const inputClasses = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";
  const errorInputClasses = "w-full px-3 py-2 bg-red-50 border border-red-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-800 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <p className="text-xs font-medium text-slate-500">Quickly add a product to inventory</p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onClose(); }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
              {serverError}
            </div>
          )}

          <form id="product-modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('productCode', { required: 'Required' })}
                  className={errors.productCode ? errorInputClasses : inputClasses}
                />
                {errors.productCode && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.productCode.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('name', { required: 'Required' })}
                  className={errors.name ? errorInputClasses : inputClasses}
                  placeholder="e.g. Premium Emulsion"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Brand <span className="text-red-500">*</span></label>
                <select
                  {...register('brand', { required: 'Required' })}
                  className={errors.brand ? errorInputClasses : inputClasses}
                >
                  <option value="">Select Brand</option>
                  <option value="Asian Paints">Asian Paints</option>
                  <option value="Nerolac">Nerolac</option>
                  <option value="Berger">Berger</option>
                  <option value="Dulux">Dulux</option>
                  <option value="Other">Other</option>
                </select>
                {errors.brand && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.brand.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit Type <span className="text-red-500">*</span></label>
                <select
                  {...register('unitType', { required: 'Required' })}
                  className={inputClasses}
                >
                  <option value="Ltr">Ltr</option>
                  <option value="Kg">Kg</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Gal">Gal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Purchase Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  {...register('purchasePrice', { required: 'Required', min: 0 })}
                  className={errors.purchasePrice ? errorInputClasses : inputClasses}
                />
                {errors.purchasePrice && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.purchasePrice.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selling Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  {...register('sellingPrice', { required: 'Required', min: 0 })}
                  className={errors.sellingPrice ? errorInputClasses : inputClasses}
                />
                {errors.sellingPrice && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.sellingPrice.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">GST Percentage (%)</label>
                <input
                  type="number"
                  {...register('gstPercentage', { required: 'Required', min: 0, max: 100 })}
                  className={inputClasses}
                />
              </div>

              <div className="hidden">
                {/* Hidden fields for stock since they're purchasing right now */}
                <input type="number" {...register('currentStock')} />
                <input type="number" {...register('lowStockLimit')} />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold transition-all shadow-sm text-sm"
          >
            Cancel
          </button>
          <button
            form="product-modal-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-600/20 text-sm"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductModal;
