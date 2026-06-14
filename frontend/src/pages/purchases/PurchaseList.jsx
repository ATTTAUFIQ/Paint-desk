import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, XCircle } from 'lucide-react';
import purchaseService from '../../services/purchaseService';

const PurchaseList = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getPurchases({ search, page, limit: 10 });
      if (response.success) {
        setPurchases(response.data.purchases);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch purchases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [search, page]);

  const handleCancel = async (id) => {
    try {
      await purchaseService.cancelPurchase(id);
      setCancelConfirm(null);
      fetchPurchases();
    } catch (error) {
      console.error('Failed to cancel purchase', error);
      alert(error.response?.data?.message || 'Failed to cancel purchase');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => navigate('/purchases/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by PO number..."
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
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Dealer</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Loading purchases...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No purchases found.</td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{purchase.purchaseNumber}</td>
                    <td className="px-6 py-4">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{purchase.dealerId?.name || 'Unknown Dealer'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{parseFloat(purchase.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        purchase.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button
                          onClick={() => navigate(`/purchases/${purchase._id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {purchase.status === 'Completed' && (
                          <button
                            onClick={() => setCancelConfirm(purchase._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel Purchase"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Purchase Order</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to cancel this purchase? This will automatically revert the stock quantities and update the dealer's pending balance.
            </p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-8">
              <p className="text-sm text-yellow-800 font-medium">Note: This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Keep PO
              </button>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20"
              >
                Cancel Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
