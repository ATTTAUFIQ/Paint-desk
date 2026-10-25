import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

const UpdatePrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('[PWA] Service Worker registered with scope:', r.scope);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <aside 
      aria-label="App update available"
      className="fixed bottom-4 left-4 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/60 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Sparkles size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">
            {needRefresh ? 'New Update Available' : 'Ready for Offline Use'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {needRefresh
              ? 'A newer version of PaintDesk is ready to install.'
              : 'App shell and cached data are saved for offline access.'}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/30"
              >
                <RefreshCw size={12} />
                Update Now
              </button>
            )}
            <button
              onClick={close}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={close}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
};

export default UpdatePrompt;
