import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Calculator } from 'lucide-react';
import saleService from '../../services/saleService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';

const SaleForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [serverError, setServerError] = useState('');
  
  // Track selected product details for auto-filling prices
  const [productMap, setProductMap] = useState({});

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      saleDate: new Date().toISOString().split('T')[0],
      customerId: '',
      customerName: 'Miscellaneous Customer',
      subTotal: 0,
      totalDiscount: 0,
      totalGst: 0,
      totalAmount: 0,
      amountPaid: 0,
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
  const watchDiscount = watch('totalDiscount');
  const watchAmountPaid = watch('amountPaid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          customerService.getCustomers({ limit: 1000 }),
          productService.getProducts({ limit: 1000 })
        ]);
        if (customersRes.success) setCustomers(customersRes.data.customers);
        
        if (productsRes.success) {
          const prods = productsRes.data.products;
          setProducts(prods);
          
          // Create a quick lookup map for autofilling prices and GST
          const map = {};
          prods.forEach(p => {
            map[p._id] = p;
          });
          setProductMap(map);
        }
        if (isEdit) {
          const saleRes = await saleService.getSaleById(id);
          if (saleRes.success) {
            const sale = saleRes.data;
            reset({
              invoiceNumber: sale.invoiceNumber,
              saleDate: sale.saleDate.split('T')[0],
              customerId: sale.customerId?._id || '',
              customerName: sale.customerName || '',
              subTotal: parseFloat(sale.subTotal).toFixed(2),
              totalDiscount: parseFloat(sale.totalDiscount).toFixed(2),
              totalGst: parseFloat(sale.totalGst).toFixed(2),
              totalAmount: parseFloat(sale.totalAmount).toFixed(2),
              amountPaid: parseFloat(sale.amountPaid).toFixed(2),
              items: sale.items.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice).toFixed(2),
                gstPercentage: item.gstPercentage,
                gstAmount: parseFloat(item.gstAmount).toFixed(2),
                totalPrice: parseFloat(item.totalPrice).toFixed(2)
              }))
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch form dependencies', error);
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  // Handle product selection change to autofill price & gst
  const handleProductChange = (index, productId) => {
    const product = productMap[productId];
    if (product) {
      setValue(`items.${index}.unitPrice`, parseFloat(product.sellingPrice?.$numberDecimal || product.sellingPrice || 0));
      setValue(`items.${index}.gstPercentage`, product.gstPercentage || 18);
    }
  };

  // Auto-calculate totals whenever items or discount changes
  useEffect(() => {
    let subTotal = 0;
    let totalGst = 0;
    
    watchItems.forEach((item, index) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const gstP = parseFloat(item.gstPercentage) || 0;
      
      const itemSubTotal = qty * price;
      const itemGst = itemSubTotal * (gstP / 100);
      const itemTotal = itemSubTotal + itemGst;

      subTotal += itemSubTotal;
      totalGst += itemGst;
      
      // We don't setValue on each item continuously here to avoid infinite loops,
      // but we need them right for submission.
    });

    const discount = parseFloat(watchDiscount) || 0;
    const preDiscountTotal = subTotal + totalGst;
    const finalTotal = Math.max(0, preDiscountTotal - discount);

    setValue('subTotal', subTotal.toFixed(2));
    setValue('totalGst', totalGst.toFixed(2));
    setValue('totalAmount', finalTotal.toFixed(2));
    
    // Auto-fill Amount Paid with the full grand total by default, but only if not editing
    // because if editing, we want to preserve the originally paid amount unless changed manually
    if (!isEdit) {
      setValue('amountPaid', finalTotal.toFixed(2));
    }

  }, [JSON.stringify(watchItems), watchDiscount, setValue]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = {
        ...data,
        customerId: data.customerId || null,
        customerName: data.customerId ? null : (data.customerName || 'Miscellaneous Customer'),
        totalDiscount: parseFloat(data.totalDiscount) || 0,
        amountPaid: parseFloat(data.amountPaid) || 0,
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
      
      if (isEdit) {
        await saleService.updateSale(id, payload);
      } else {
        await saleService.createSale(payload);
      }
      navigate('/sales');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Transaction failed. Check stock levels or try again.');
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";
  const errorInputClasses = "w-full px-4 py-2.5 bg-red-50 border border-red-300 rounded-xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-800 text-sm";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title={isEdit ? "Edit Sale Invoice" : "Point of Sale (New Invoice)"} backUrl="/sales" />

      {serverError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Top Details Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('invoiceNumber', { required: 'Invoice Number is required' })}
              className={errors.invoiceNumber ? errorInputClasses : inputClasses}
              disabled={isEdit}
            />
            {errors.invoiceNumber && <p className="text-red-500 text-xs font-medium mt-1">{errors.invoiceNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              {...register('saleDate', { required: 'Date is required' })}
              className={errors.saleDate ? errorInputClasses : inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Registered Customer</label>
            <select
              {...register('customerId')}
              className={inputClasses}
            >
              <option value="">-- Miscellaneous (Walk-in) --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.mobileNumber})</option>
              ))}
            </select>
          </div>

          {!watch('customerId') && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Walk-in Name</label>
              <input
                type="text"
                {...register('customerName')}
                className={inputClasses}
                placeholder="E.g. Walk-in Customer"
              />
            </div>
          )}
        </div>

        {/* Dynamic Items Table Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Cart Items</h2>
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
                  <th className="pb-3 w-1/3">Product (Stock)</th>
                  <th className="pb-3 w-24">Qty</th>
                  <th className="pb-3 w-32">Price (₹)</th>
                  <th className="pb-3 w-24">GST (%)</th>
                  <th className="pb-3 w-32 text-right">Total (₹)</th>
                  <th className="pb-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((item, index) => {
                  const qty = parseFloat(watchItems[index]?.quantity) || 0;
                  const price = parseFloat(watchItems[index]?.unitPrice) || 0;
                  const gstP = parseFloat(watchItems[index]?.gstPercentage) || 0;
                  const itemTotal = (qty * price) * (1 + (gstP / 100));

                  const selectedProductId = watchItems[index]?.productId;
                  const currentStock = selectedProductId && productMap[selectedProductId] ? productMap[selectedProductId].currentStock : null;
                  const isOutOfStock = currentStock !== null && qty > currentStock;

                  return (
                    <tr key={item.id}>
                      <td className="py-4 pr-4">
                        <select
                          {...register(`items.${index}.productId`, { required: true })}
                          onChange={(e) => {
                            // Let react-hook-form handle the change, then fire our autofill
                            register(`items.${index}.productId`).onChange(e);
                            handleProductChange(index, e.target.value);
                          }}
                          className={inputClasses}
                        >
                          <option value="">Select Product</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name} (Stock: {p.currentStock})
                            </option>
                          ))}
                        </select>
                        {isOutOfStock && <p className="text-red-500 text-xs mt-1 font-medium">Warning: Exceeds stock ({currentStock})</p>}
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                          className={`${inputClasses} ${isOutOfStock ? 'border-red-300 bg-red-50' : ''}`}
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
        <div className="flex flex-col md:flex-row justify-end gap-6">
          
          {/* Payment Card */}
          <div className="w-full md:w-80 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 self-start">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Payment Receipt</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid Now (₹)</label>
              <input
                type="number"
                step="0.01"
                {...register('amountPaid')}
                className={`${inputClasses} text-lg font-bold text-blue-600`}
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                If the amount paid is less than the Grand Total, the remainder will be added to the customer's outstanding credit balance.
              </p>
            </div>
          </div>

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
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Discount (₹)</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('totalDiscount')}
                  className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right outline-none text-sm font-semibold text-red-600"
                />
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">
                <span>Grand Total</span>
                <span>₹{watch('totalAmount')}</span>
              </div>
              
              {/* Credit Calculation Indicator */}
              {(() => {
                const total = parseFloat(watch('totalAmount')) || 0;
                const paid = parseFloat(watch('amountPaid')) || 0;
                const due = total - paid;
                if (due > 0) {
                  return (
                    <div className="pt-2 text-sm font-semibold text-amber-600 text-right">
                      Will add ₹{due.toFixed(2)} to Customer Credit
                    </div>
                  );
                } else if (due < 0) {
                  return (
                    <div className="pt-2 text-sm font-semibold text-emerald-600 text-right">
                      Change Due: ₹{Math.abs(due).toFixed(2)}
                    </div>
                  );
                }
                return null;
              })()}

            </div>
            <div className="p-6 bg-slate-50/50">
              <button
                type="submit"
                disabled={isSubmitting || fields.length === 0}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save size={20} />
                {isSubmitting ? 'Processing...' : (isEdit ? 'Update Sale' : 'Confirm Sale')}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SaleForm;
