import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, XCircle } from 'lucide-react';
import saleService from '../../services/saleService';

const SaleList = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getSales({ search, page, limit: 10 });
      if (response.success) {
        setSales(response.data.sales);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch sales', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [search, page]);

  const handleCancel = async (id) => {
    try {
      await saleService.cancelSale(id);
      setCancelConfirm(null);
      fetchSales();
    } catch (error) {
      console.error('Failed to cancel sale', error);
      alert(error.response?.data?.message || 'Failed to cancel sale');
    }
  };

  const getPaymentBadge = (status) => {
    switch(status) {
      case 'Paid': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">Paid</span>;
      case 'Partial': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-600 border-yellow-100">Partial</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          New Sale Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by Invoice number..."
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
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Loading sales...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No sales found.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {sale.invoiceNumber}
                      {sale.status === 'Cancelled' && <span className="ml-2 text-xs text-red-500 font-bold">(Cancelled)</span>}
                    </td>
                    <td className="px-6 py-4">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{sale.customerId?.name || 'Unknown Customer'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(sale.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/sales/${sale._id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {sale.status === 'Completed' && (
                          <button
                            onClick={() => setCancelConfirm(sale._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel Sale"
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Sale Invoice</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to cancel this sale? This will automatically return the stock to inventory and update the customer's credit balance.
            </p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-8">
              <p className="text-sm text-yellow-800 font-medium">Note: This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Keep Invoice
              </button>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20"
              >
                Cancel Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleList;
