import React, { useState, useEffect } from 'react';
import { Search, ArrowDownRight, ArrowUpRight, FileEdit, RefreshCcw } from 'lucide-react';
import stockService from '../../services/stockService';
import PageHeader from '../../components/common/PageHeader';

const StockMovementHistory = () => {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await stockService.getMovements({ search, type: typeFilter, page, limit: 15 });
      if (response.success) {
        setMovements(response.data.movements);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch movements', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter, page]);

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN': return <ArrowDownRight className="text-emerald-500" size={20} />;
      case 'OUT': return <ArrowUpRight className="text-red-500" size={20} />;
      case 'ADJUSTMENT': return <FileEdit className="text-blue-500" size={20} />;
      case 'RETURN': return <RefreshCcw className="text-amber-500" size={20} />;
      default: return null;
    }
  };

  const getMovementBadge = (type, qty) => {
    switch (type) {
      case 'IN': return <span className="text-emerald-600 font-black">+{qty}</span>;
      case 'OUT': return <span className="text-red-600 font-black">{qty}</span>; // qty is already negative in DB
      case 'ADJUSTMENT': return <span className="text-blue-600 font-black">{qty > 0 ? `+${qty}` : qty}</span>;
      default: return <span className="font-black">{qty}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Stock Audit Ledger" backUrl="/stock" />

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by remarks (e.g. INV-123)..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold text-slate-600"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Movements</option>
            <option value="IN">IN (Purchases)</option>
            <option value="OUT">OUT (Sales)</option>
            <option value="ADJUSTMENT">Manual Adjustments</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">Type</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Qty Change</th>
                <th className="px-6 py-4 text-center">Previous Stock</th>
                <th className="px-6 py-4 text-center">New Stock</th>
                <th className="px-6 py-4">Remarks / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">Loading ledger...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">No movement history found.</td></tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {getMovementIcon(movement.movementType)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{new Date(movement.movementDate).toLocaleDateString()}</p>
                      <p className="text-xs font-medium text-slate-400">{new Date(movement.movementDate).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{movement.productId?.name}</p>
                      <p className="text-xs text-slate-500">{movement.productId?.productCode}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-lg bg-slate-50/50">
                      {getMovementBadge(movement.movementType, movement.quantity)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-500">{movement.previousStock}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{movement.newStock}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs">{movement.remarks || '-'}</span>
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
            <span className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default StockMovementHistory;
