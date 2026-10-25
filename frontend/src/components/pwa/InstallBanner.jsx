import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import IOSInstallModal from './IOSInstallModal';

const InstallBanner = () => {
  const {
    showBanner,
    showIOSModal,
    setShowIOSModal,
    promptInstall,
    dismissInstall,
  } = usePWAInstall();

  if (!showBanner) {
    return (
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    );
  }

  return (
    <>
      <aside 
        aria-label="Install PaintDesk Application"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-40 md:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-blue-100/80 transition-all duration-300 animate-in slide-in-from-bottom-5"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/25 shrink-0">
            P
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-bold text-slate-800 text-sm tracking-tight">Install PaintDesk</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                <Sparkles size={10} /> PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              Install our high-performance desktop & mobile app for quick scan billing and faster access.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={promptInstall}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Download size={14} />
                Install App
              </button>
              <button
                onClick={() => dismissInstall(7)}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={() => dismissInstall(7)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors -mr-1 -mt-1 cursor-pointer"
            aria-label="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
};

export default InstallBanner;
