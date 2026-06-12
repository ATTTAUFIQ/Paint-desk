import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, backUrl }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      {backUrl && (
        <button
          onClick={() => navigate(backUrl)}
          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
    </div>
  );
};

export default PageHeader;
