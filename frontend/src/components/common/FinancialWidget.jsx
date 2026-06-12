import React from 'react';
import { IndianRupee } from 'lucide-react';

const FinancialWidget = ({ 
  amount, 
  title, 
  type = 'debt', // 'debt' (they owe us - red) or 'credit' (we owe them - red)
  actionText = 'Record Payment',
  onActionClick
}) => {
  const value = parseFloat(amount || 0);
  const isPositive = value > 0;
  
  // Determine color scheme based on whether the balance is active
  const colorScheme = isPositive 
    ? {
        bg: 'bg-red-50',
        border: 'border-red-100',
        icon: 'text-red-500',
        title: 'text-red-600',
        amount: 'text-red-700',
        button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
      }
    : {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        icon: 'text-emerald-500',
        title: 'text-emerald-600',
        amount: 'text-emerald-700',
        button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
      };

  return (
    <div className={`rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-8 relative overflow-hidden ${colorScheme.bg} ${colorScheme.border}`}>
      <IndianRupee className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-10 ${colorScheme.icon}`} />
      <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${colorScheme.title}`}>
        {title}
      </p>
      <h3 className={`text-4xl font-extrabold tracking-tight ${colorScheme.amount}`}>
        ₹{value.toFixed(2)}
      </h3>
      {isPositive && (
        <button 
          onClick={onActionClick}
          className={`mt-6 w-full py-3 text-white rounded-xl font-semibold transition-all shadow-lg ${colorScheme.button}`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default FinancialWidget;
