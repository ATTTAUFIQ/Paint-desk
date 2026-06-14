import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Calculator } from 'lucide-react';
import purchaseService from '../../services/purchaseService';
import dealerService from '../../services/dealerService';
import productService from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';
import ProductModal from '../../components/common/ProductModal';

const PurchaseForm = () => {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [productMap, setProductMap] = useState({});

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      dealerId: '',
      subTotal: 0,
      totalGst: 0,
      totalAmount: 0,
      items: [
        { productId: '', quantity: 1, unitPrice: 0, gstPercentage: 18, gstAmount: 0, totalPrice: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');

  useEffect(() => {
    // Fetch dealers and products for dropdowns
    const fetchData = async () => {
      try {
        const [dealersRes, productsRes] = await Promise.all([
          dealerService.getDealers({ limit: 1000 }),
          productService.getProducts({ limit: 1000 })
        ]);
        if (dealersRes.success) setDealers(dealersRes.data.dealers);
        if (productsRes.success) {
          const prods = productsRes.data.products;
          setProducts(prods);
          const map = {};
          prods.forEach(p => { map[p._id] = p; });
          setProductMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch form dependencies', error);
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (index, productId, forceProduct = null) => {
    const product = forceProduct || productMap[productId];
    if (product) {
      setValue(`items.${index}.unitPrice`, parseFloat(product.purchasePrice?.$numberDecimal || product.purchasePrice || 0));
      setValue(`items.${index}.gstPercentage`, parseFloat(product.gstPercentage || 18));
    }
  };

  // Auto-calculate totals whenever items change
  useEffect(() => {
    let subTotal = 0;
    let totalGst = 0;
    
    const calculatedItems = watchItems.map(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const gstP = parseFloat(item.gstPercentage) || 0;
      
      const itemSubTotal = qty * price;
      const itemGst = itemSubTotal * (gstP / 100);
      const itemTotal = itemSubTotal + itemGst;

      subTotal += itemSubTotal;
      totalGst += itemGst;

      return { ...item, gstAmount: itemGst, totalPrice: itemTotal };
    });

    setValue('subTotal', subTotal.toFixed(2));
    setValue('totalGst', totalGst.toFixed(2));
    setValue('totalAmount', (subTotal + totalGst).toFixed(2));

  }, [JSON.stringify(watchItems), setValue]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      // Clean up calculation fields for submission just to be safe
      const payload = {
        ...data,
        items: data.items.map(item => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unitPrice) || 0;
          const gstP = parseFloat(item.gstPercentage) || 0;
          const itemSubTotal = qty * price;
          return {
            productId: item.productId,
            quantity: qty,
            unitPrice: price,
            gstPercentage: gstP,
            gstAmount: itemSubTotal * (gstP / 100),
            totalPrice: itemSubTotal + (itemSubTotal * (gstP / 100))
          };
        })
      };
      
      await purchaseService.createPurchase(payload);
      navigate('/purchases');
    } catch (error) {
      setServerError(error.response?.data?.message || 'An error occurred during transaction processing. Please try again.');
    }
  };

  const handleProductCreated = (newProduct) => {
    setProducts(prev => [...prev, newProduct]);
    setProductMap(prev => ({ ...prev, [newProduct._id]: newProduct }));
    if (activeRowIndex !== null) {
      setValue(`items.${activeRowIndex}.productId`, newProduct._id, { shouldValidate: true });
      handleProductChange(activeRowIndex, newProduct._id, newProduct);
    }
    setIsProductModalOpen(false);
    setActiveRowIndex(null);
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";
  const errorInputClasses = "w-full px-4 py-2.5 bg-red-50 border border-red-300 rounded-xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-800 text-sm";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="New Purchase Order" backUrl="/purchases" />

      {serverError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Top Details Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">PO Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('purchaseNumber', { required: 'PO Number is required' })}
              className={errors.purchaseNumber ? errorInputClasses : inputClasses}
            />
            {errors.purchaseNumber && <p className="text-red-500 text-xs font-medium mt-1">{errors.purchaseNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              {...register('purchaseDate', { required: 'Date is required' })}
              className={errors.purchaseDate ? errorInputClasses : inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dealer / Supplier <span className="text-red-500">*</span></label>
            <select
              {...register('dealerId', { required: 'Dealer is required' })}
              className={errors.dealerId ? errorInputClasses : inputClasses}
            >
              <option value="">Select Dealer</option>
              {dealers.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.mobileNumber})</option>
              ))}
            </select>
            {errors.dealerId && <p className="text-red-500 text-xs font-medium mt-1">{errors.dealerId.message}</p>}
          </div>
        </div>

        {/* Dynamic Items Table Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Order Items</h2>
            <button
              type="button"
              onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, gstPercentage: 18, gstAmount: 0, totalPrice: 0 })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors text-sm"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="pb-3 w-1/3">Product</th>
                  <th className="pb-3 w-32">Qty</th>
                  <th className="pb-3 w-40">Unit Price (₹)</th>
                  <th className="pb-3 w-32">GST (%)</th>
                  <th className="pb-3 w-40 text-right">Total (₹)</th>
                  <th className="pb-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((item, index) => {
                  const qty = parseFloat(watchItems[index]?.quantity) || 0;
                  const price = parseFloat(watchItems[index]?.unitPrice) || 0;
                  const gstP = parseFloat(watchItems[index]?.gstPercentage) || 0;
                  const itemTotal = (qty * price) * (1 + (gstP / 100));

                  return (
                    <tr key={item.id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <select
                            {...register(`items.${index}.productId`, { required: true })}
                            onChange={(e) => {
                              register(`items.${index}.productId`).onChange(e);
                              handleProductChange(index, e.target.value);
                            }}
                            className={inputClasses}
                          >
                            <option value="">Select Product</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.name} ({p.productCode})</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => { setActiveRowIndex(index); setIsProductModalOpen(true); }}
                            className="p-2.5 bg-slate-100 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors shrink-0"
                            title="Add New Product"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                          className={inputClasses}
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`, { required: true, min: 0 })}
                          className={inputClasses}
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          {...register(`items.${index}.gstPercentage`, { required: true, min: 0 })}
                          className={inputClasses}
                        />
                      </td>
                      <td className="py-4 text-right font-semibold text-slate-800">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Summary & Submit */}
        <div className="flex justify-end">
          <div className="w-full md:w-96 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-6 space-y-4 border-b border-slate-100">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Sub Total</span>
                <span>₹{watch('subTotal')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Total GST</span>
                <span>₹{watch('totalGst')}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">
                <span>Grand Total</span>
                <span>₹{watch('totalAmount')}</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50/50">
              <button
                type="submit"
                disabled={isSubmitting || fields.length === 0}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save size={20} />
                {isSubmitting ? 'Processing Transaction...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>

      </form>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setActiveRowIndex(null); }}
        onSuccess={handleProductCreated}
      />
    </div>
  );
};

export default PurchaseForm;
