import React from 'react';
import { CreditCard, Calendar, IndianRupee, Trash2 } from 'lucide-react';

const PaymentHistory = ({ payments, onEditClick, onDeleteClick }) => {
  return (
    <div className="overflow-hidden border border-slate-100 rounded-2xl">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Method</th>
            <th className="px-6 py-4">Reference</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  ₹{parseFloat(payment.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {payment.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {payment.referenceNumber || '-'}
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() => onEditClick(payment)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteClick(payment._id)}
                    className="text-slate-400 hover:text-red-600 transition-colors inline-flex items-center justify-center align-middle"
                    title="Delete Payment"
                  >
                    <Trash2 size={16} className="mt-[-2px]"/>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium mb-1">No payment history.</p>
                  <p className="text-slate-400 text-sm">Payments recorded will appear here.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
