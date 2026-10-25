import { useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
  const { isOnline, wasOffline, checkConnection } = useOnlineStatus();
  const [checking, setChecking] = useState(false);

  const handleManualCheck = async () => {
    setChecking(true);
    await checkConnection();
    setTimeout(() => setChecking(false), 600);
  };

  // Reconnected Toast
  if (isOnline && wasOffline) {
    return (
      <div 
        role="status" 
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300"
      >
        <Wifi size={16} className="animate-pulse" />
        <span>Connection restored. PaintDesk is back online!</span>
      </div>
    );
  }

  // Offline Warning Banner
  if (!isOnline) {
    return (
      <div 
        role="alert" 
        className="sticky top-0 z-40 bg-amber-500 text-slate-900 border-b border-amber-600/30 px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff size={18} className="text-slate-950 shrink-0" />
            <span>
              <strong>Offline Mode:</strong> Internet connection lost. View cached pages, but billing submissions and cloud sync are paused.
            </span>
          </div>

          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600/40 hover:bg-amber-600/60 active:scale-95 text-slate-950 font-bold rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Checking...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineBanner;
