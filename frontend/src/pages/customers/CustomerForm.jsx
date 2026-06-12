import React, { useEffect, useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import customerService from '../../services/customerService';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [serverError, setServerError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useHookForm({
    defaultValues: {
      name: '',
      mobileNumber: '',
      address: '',
      gstNumber: '',
      outstandingBalance: 0,
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const response = await customerService.getCustomerById(id);
          if (response.success) {
            reset(response.data);
          }
        } catch (error) {
          setServerError('Failed to fetch customer details.');
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (isEdit) {
        await customerService.updateCustomer(id, data);
      } else {
        await customerService.createCustomer(data);
      }
      navigate('/customers');
    } catch (error) {
      setServerError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800";
  const errorInputClasses = "w-full px-4 py-3 bg-red-50 border border-red-300 rounded-xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-800";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/customers')}
          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={errors.name ? errorInputClasses : inputClasses}
              placeholder="e.g. Ramesh Hardware"
            />
            {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('mobileNumber', { 
                required: 'Mobile is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
              })}
              className={errors.mobileNumber ? errorInputClasses : inputClasses}
              placeholder="9876543210"
            />
            {errors.mobileNumber && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.mobileNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
            <input
              type="text"
              {...register('gstNumber')}
              className={inputClasses}
              placeholder="e.g. 22AAAAA0000A1Z5"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
            <textarea
              {...register('address')}
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Complete shop address..."
            />
          </div>

          {/* Only show opening balance edit if adding new, or strictly controlled. For simplicity, we allow edit here but typically it should be handled by transactions. */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Opening Outstanding Balance (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register('outstandingBalance')}
              className={inputClasses}
              placeholder="0.00"
            />
            <p className="text-xs text-slate-500 mt-1.5">Set this only for initial balance importing.</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/customers')}
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
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
