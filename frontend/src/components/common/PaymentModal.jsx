import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, FileText, CreditCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentModal = ({ isOpen, onClose, partyType, partyId, partyName, onPaymentSuccess, editingPayment, currentBalance }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'error' | 'success', text: '' }

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        amount: editingPayment.amount ? parseFloat(editingPayment.amount.$numberDecimal || editingPayment.amount) : '',
        paymentDate: editingPayment.paymentDate ? new Date(editingPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: editingPayment.paymentMethod || 'Cash',
        referenceNumber: editingPayment.referenceNumber || '',
        notes: editingPayment.notes || '',
      });
    } else {
      setFormData({
        amount: currentBalance > 0 ? currentBalance.toString() : '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        referenceNumber: '',
        notes: '',
      });
    }
    setNotification(null);
  }, [editingPayment, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    const paymentAmount = parseFloat(formData.amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setNotification({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const editingAmount = editingPayment ? parseFloat(editingPayment.amount?.$numberDecimal || editingPayment.amount || 0) : 0;
    const maxAllowed = (parseFloat(currentBalance) || 0) + editingAmount;
    
    // Add small epsilon for floating point inaccuracies
    if (paymentAmount > maxAllowed + 0.01) {
      setNotification({ type: 'error', text: `Amount cannot exceed the pending balance of ₹${maxAllowed.toFixed(2)}` });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        partyType,
        partyId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      };

      let res;
      if (editingPayment) {
        res = await paymentService.updatePayment(editingPayment._id, payload);
      } else {
        res = await paymentService.recordPayment(payload);
      }

      if (res.success) {
        setNotification({ type: 'success', text: editingPayment ? 'Payment updated successfully!' : `Payment of ₹${payload.amount} recorded successfully!` });
        
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
          // Reset form
          setFormData({
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            referenceNumber: '',
            notes: '',
          });
          setNotification(null);
        }, 1500);
      }
    } catch (error) {
      setNotification({ type: 'error', text: error.message || 'Failed to record payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      
      {/* Floating Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[60] p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300 min-w-[300px] bg-white border-l-4 ${notification.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          {notification.type === 'error' ? (
            <AlertCircle size={24} className="mt-0.5 shrink-0 text-red-500" />
          ) : (
            <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-green-500" />
          )}
          <div>
            <p className="text-sm font-bold text-slate-800">{notification.type === 'error' ? 'Error' : 'Success'}</p>
            <p className="text-sm text-slate-600 mt-0.5">{notification.text}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{editingPayment ? 'Edit Payment' : 'Record Payment'}</h3>
            <p className="text-sm text-slate-500 mt-1">For {partyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    name="paymentDate"
                    required
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Method *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard size={18} />
                  </div>
                  <select
                    name="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.paymentMethod !== 'Cash' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reference / Transaction No.</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. UPI Ref / Cheque No"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                  <FileText size={18} />
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Optional remarks..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                editingPayment ? 'Update Payment' : 'Save Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
