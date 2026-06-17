import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertTriangle, PackageX, Package, Search, SlidersHorizontal, History, X } from 'lucide-react';
import stockService from '../../services/stockService';
import productService from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';

const StockDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalProducts: 0, lowStock: 0, outOfStock: 0 });
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [stockFilter, setStockFilter] = useState(searchParams.get('filter') || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await stockService.getStockMetrics();
      if (res.success) setMetrics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({ 
        search, 
        page, 
        limit: 10,
        stockStatus: stockFilter !== 'all' ? stockFilter : undefined
      });
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchProducts();
  }, [search, page, stockFilter]);

  // Sync URL when filter changes
  useEffect(() => {
    if (stockFilter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', stockFilter);
    }
    setSearchParams(searchParams, { replace: true });
    setPage(1);
  }, [stockFilter]);

  const openAdjustmentModal = (product) => {
    setSelectedProduct(product);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Global Actions */}
      <PageHeader 
        title="Inventory Health" 
        subtitle="Monitor real-time stock levels and low-stock alerts."
        backUrl="/"
      >
        <button
          onClick={() => navigate('/stock/history')}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <History size={18} /> View Audit Trail
        </button>
      </PageHeader>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setStockFilter('all')}
          className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex items-center gap-4 cursor-pointer transition-all ${stockFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-blue-200'}`}>
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tracked Items</p>
            <p className="text-3xl font-black text-slate-800">{metrics.totalProducts}</p>
          </div>
        </div>

        <div 
          onClick={() => setStockFilter('low')}
          className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex items-center gap-4 cursor-pointer transition-all ${stockFilter === 'low' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-100 hover:border-amber-200'}`}>
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-3xl font-black text-slate-800">{metrics.lowStock}</p>
          </div>
        </div>

        <div 
          onClick={() => setStockFilter('out')}
          className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${stockFilter === 'out' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-100 hover:border-red-200'}`}>
          <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <PackageX size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <p className="text-3xl font-black text-red-600">{metrics.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Threshold</th>
                <th className="px-6 py-4 text-center">Current Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No products found.</td></tr>
              ) : (
                products.map((product) => {
                  const isOutOfStock = product.currentStock <= 0;
                  const isLowStock = product.currentStock > 0 && product.currentStock <= product.lowStockLimit;
                  
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.productCode} &bull; {product.brand}</p>
                      </td>
                      <td className="px-6 py-4 font-medium">{product.categoryId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-center text-slate-400 font-bold">{product.lowStockLimit}</td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black text-sm border ${
                          isOutOfStock ? 'bg-red-50 text-red-600 border-red-200' :
                          isLowStock ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {product.currentStock} {product.unitType}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustmentModal(product)}
                          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Manual Adjustment"
                        >
                          <SlidersHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <StockAdjustmentModal 
          product={selectedProduct} 
          onClose={() => setIsAdjustModalOpen(false)}
          onSuccess={() => {
            setIsAdjustModalOpen(false);
            fetchProducts();
            fetchMetrics();
          }}
        />
      )}

    </div>
  );
};

// Internal Modal Component
const StockAdjustmentModal = ({ product, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      type: 'IN',
      quantity: '',
      remarks: ''
    }
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await stockService.adjustStock({
        productId: product._id,
        type: data.type,
        quantity: parseInt(data.quantity),
        remarks: data.remarks
      });
      onSuccess();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Manual Adjustment</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Product</p>
          <p className="text-lg font-bold text-slate-800">{product?.name}</p>
          <p className="text-sm font-medium text-slate-500">Current Stock: <span className="font-bold text-slate-800">{product?.currentStock}</span></p>
        </div>

        {serverError && <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
              <select {...register('type')} className={inputClasses}>
                <option value="IN">Increase (+)</option>
                <option value="OUT">Decrease (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity</label>
              <input type="number" min="1" {...register('quantity', { required: true, min: 1 })} className={inputClasses} placeholder="Qty" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks / Reason</label>
            <input type="text" {...register('remarks', { required: true })} className={inputClasses} placeholder="e.g. Audit correction, Damaged goods" />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? 'Adjusting...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default StockDashboard;
