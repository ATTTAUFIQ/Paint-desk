import React, { useEffect, useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import productService from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [serverError, setServerError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useHookForm({
    defaultValues: {
      productCode: '',
      barcode: '',
      qrCode: '',
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

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await productService.getProductById(id);
          if (response.success) {
            reset(response.data);
          }
        } catch (error) {
          setServerError('Failed to fetch product details.');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (isEdit) {
        await productService.updateProduct(id, data);
      } else {
        await productService.createProduct(data);
      }
      navigate('/products');
    } catch (error) {
      setServerError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800";
  const errorInputClasses = "w-full px-4 py-3 bg-red-50 border border-red-300 rounded-xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-800";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title={isEdit ? 'Edit Product' : 'Add New Product'} 
        backUrl="/products" 
      />

      {serverError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basic Details */}
          <div className="col-span-1 md:col-span-2 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
              Basic Details
            </h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('productCode', { required: 'Product Code is required' })}
              className={errors.productCode ? errorInputClasses : inputClasses}
              placeholder="e.g. AP-ROY-1L"
            />
            {errors.productCode && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.productCode.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Barcode</label>
            <input
              type="text"
              {...register('barcode')}
              className={inputClasses}
              placeholder="e.g. 890123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">QR Code / URL</label>
            <input
              type="text"
              {...register('qrCode')}
              className={inputClasses}
              placeholder="e.g. https://www.bergerpaints.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('name', { required: 'Product Name is required' })}
              className={errors.name ? errorInputClasses : inputClasses}
              placeholder="e.g. Royale Luxury Emulsion"
            />
            {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand <span className="text-red-500">*</span></label>
            <select
              {...register('brand', { required: 'Brand is required' })}
              className={errors.brand ? errorInputClasses : inputClasses}
            >
              <option value="">Select Brand</option>
              <option value="Asian Paints">Asian Paints</option>
              <option value="Nerolac">Nerolac</option>
              <option value="Berger">Berger</option>
              <option value="Dulux">Dulux</option>
              <option value="Other">Other</option>
            </select>
            {errors.brand && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.brand.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Type <span className="text-red-500">*</span></label>
            <select
              {...register('unitType', { required: 'Unit type is required' })}
              className={inputClasses}
            >
              <option value="Ltr">Ltr</option>
              <option value="Kg">Kg</option>
              <option value="Pcs">Pcs</option>
              <option value="Gal">Gal</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-100 my-4" />

          {/* Pricing Details */}
          <div className="col-span-1 md:col-span-2 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">2</span>
              Pricing & Tax
            </h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Price (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              {...register('purchasePrice', { required: 'Purchase Price is required', min: { value: 0, message: 'Must be >= 0' } })}
              className={errors.purchasePrice ? errorInputClasses : inputClasses}
              placeholder="0.00"
            />
            {errors.purchasePrice && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.purchasePrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Selling Price (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              {...register('sellingPrice', { required: 'Selling Price is required', min: { value: 0, message: 'Must be >= 0' } })}
              className={errors.sellingPrice ? errorInputClasses : inputClasses}
              placeholder="0.00"
            />
            {errors.sellingPrice && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.sellingPrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">GST Percentage (%) <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('gstPercentage', { required: 'GST is required', min: 0, max: 100 })}
              className={inputClasses}
              placeholder="18"
            />
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-100 my-4" />

          {/* Inventory Details */}
          <div className="col-span-1 md:col-span-2 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">3</span>
              Inventory Control
            </h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Stock <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('currentStock', { required: 'Stock is required', min: 0 })}
              className={inputClasses}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Low Stock Limit <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('lowStockLimit', { required: 'Low stock limit is required', min: 0 })}
              className={inputClasses}
              placeholder="10"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save size={20} />
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
