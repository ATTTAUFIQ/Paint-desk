import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Wallet, Search, Plus, Trash2, Edit, Home, Zap, Truck, LayoutList, X } from 'lucide-react';
import expenseService from '../../services/expenseService';

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ breakdown: {}, grandTotal: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getExpenses({ search, category: categoryFilter, page, limit: 10 });
      if (response.success) {
        setExpenses(response.data.expenses);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenseService.getExpenseStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch expense stats', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [search, categoryFilter, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        fetchExpenses();
        fetchStats();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Rent': return <Home size={20} className="text-purple-500" />;
      case 'Electricity': return <Zap size={20} className="text-yellow-500" />;
      case 'Transportation': return <Truck size={20} className="text-blue-500" />;
      default: return <LayoutList size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Global Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Expense Management</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Track and analyze operational costs for the current month.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} /> Record Expense
        </button>
      </div>

      {/* Mini Report / Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Grand Total Highlight */}
        <div className="md:col-span-1 bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total MTD</p>
          <p className="text-3xl font-black">₹{stats.grandTotal.toFixed(0)}</p>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
            <Home className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rent</p>
            <p className="text-xl font-black text-slate-800">₹{(stats.breakdown['Rent'] || 0).toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Zap className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Electricity</p>
            <p className="text-xl font-black text-slate-800">₹{(stats.breakdown['Electricity'] || 0).toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Truck className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transport</p>
            <p className="text-xl font-black text-slate-800">₹{(stats.breakdown['Transportation'] || 0).toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
            <LayoutList className="text-slate-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Misc.</p>
            <p className="text-xl font-black text-slate-800">₹{(stats.breakdown['Miscellaneous'] || 0).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold text-slate-600"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            <option value="Rent">Rent</option>
            <option value="Electricity">Electricity</option>
            <option value="Transportation">Transportation</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">Cat</th>
                <th className="px-6 py-4">Title & Details</th>
                <th className="px-6 py-4 text-right">Amount (₹)</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No expenses found.</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {getCategoryIcon(expense.category)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-base">{expense.title}</p>
                      {expense.description && <p className="text-xs text-slate-500 mt-1 max-w-md truncate">{expense.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800 text-lg">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(expense)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Expense">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(expense._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Expense">
                          <Trash2 size={18} />
                        </button>
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
            <span className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Expense Modal Form */}
      {isModalOpen && (
        <ExpenseFormModal 
          expense={editingExpense} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchExpenses();
            fetchStats();
          }}
        />
      )}

    </div>
  );
};

// Internal Modal Form Component
const ExpenseFormModal = ({ expense, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: expense ? {
      ...expense,
      amount: parseFloat(expense.amount),
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0]
    } : {
      title: '',
      category: 'Miscellaneous',
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0]
    }
  });

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (expense) {
        await expenseService.updateExpense(expense._id, data);
      } else {
        await expenseService.createExpense(data);
      }
      onSuccess();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm";
  const errorInputClasses = "w-full px-4 py-2.5 bg-red-50 border border-red-300 rounded-xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-800 text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Wallet size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{expense ? 'Edit Expense' : 'Record New Expense'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {serverError && <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title <span className="text-red-500">*</span></label>
            <input type="text" {...register('title', { required: 'Title is required' })} className={errors.title ? errorInputClasses : inputClasses} placeholder="e.g. Shop Rent for March" />
            {errors.title && <p className="text-red-500 text-xs font-medium mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
              <select {...register('category', { required: true })} className={inputClasses}>
                <option value="Rent">Rent</option>
                <option value="Electricity">Electricity</option>
                <option value="Transportation">Transportation</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₹) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0.01" {...register('amount', { required: 'Amount required', min: 0.01 })} className={errors.amount ? errorInputClasses : inputClasses} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
            <input type="date" {...register('expenseDate', { required: true })} className={inputClasses} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Notes</label>
            <textarea {...register('description')} className={inputClasses} rows="3" placeholder="Optional details..."></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ExpenseDashboard;
