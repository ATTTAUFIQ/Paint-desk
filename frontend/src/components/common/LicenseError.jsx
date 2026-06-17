import React from 'react';

const LicenseError = ({ message, type }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700/50 text-center">
        
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {type === 'deactivated' ? 'ERP DEACTIVATED' : 'LICENSE EXPIRED'}
        </h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          {message || 'Your license is no longer active.'}
          <br/><br/>
          Please contact your software provider to resolve this issue and restore access to your system.
        </p>

        <div className="pt-6 border-t border-slate-700/50">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            System Locked
          </p>
        </div>

      </div>
    </div>
  );
};

export default LicenseError;
