import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, backUrl, children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-start md:items-center gap-4">
        {backUrl && (
          <button
            onClick={() => navigate(backUrl)}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 font-medium text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
