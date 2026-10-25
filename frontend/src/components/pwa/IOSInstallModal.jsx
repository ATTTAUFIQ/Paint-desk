import { X, Share, PlusSquare, ArrowUpRight } from 'lucide-react';

const IOSInstallModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              P
            </div>
            <div>
              <h3 id="ios-install-title" className="text-lg font-bold text-slate-800">Install PaintDesk on iOS</h3>
              <p className="text-xs text-slate-500">Run like a native app on iPhone or iPad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Share size={20} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">1. Tap the Share button</p>
              <p className="text-slate-500 text-xs mt-0.5">Located in Safari's bottom toolbar (or top right on iPad).</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <PlusSquare size={20} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">2. Tap "Add to Home Screen"</p>
              <p className="text-slate-500 text-xs mt-0.5">Scroll down the action sheet menu and select Add to Home Screen.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ArrowUpRight size={20} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">3. Tap "Add"</p>
              <p className="text-slate-500 text-xs mt-0.5">Tap Add in the top-right corner to launch PaintDesk from your home screen.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default IOSInstallModal;
