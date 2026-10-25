import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfflineFallback = ({ message, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 max-w-md w-full">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <WifiOff size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Internet Connection</h2>
        <p className="text-slate-600 text-sm mb-6">
          {message || 'This section requires an active connection to the PaintDesk server. Cached pages remain accessible, but cloud data cannot be fetched while offline.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
