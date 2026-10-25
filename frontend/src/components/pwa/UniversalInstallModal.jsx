import { useState } from 'react';
import { X, Laptop, Smartphone, Share, PlusSquare, ArrowUpRight, RefreshCw, MoreVertical } from 'lucide-react';

const UniversalInstallModal = ({ isOpen, onClose, isIOS }) => {
  const [activeTab, setActiveTab] = useState(() => (isIOS ? 'ios' : 'desktop'));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              P
            </div>
            <div>
              <h3 id="install-modal-title" className="text-lg font-bold text-slate-800">Install PaintDesk ERP</h3>
              <p className="text-xs text-slate-500">Run as a fast, borderless application</p>
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

        {/* Device Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'desktop' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop size={15} />
            <span>Desktop (Chrome/Edge)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone size={15} />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ios' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share size={15} />
            <span>iOS (Safari)</span>
          </button>
        </div>

        {/* Desktop Tab */}
        {activeTab === 'desktop' && (
          <div className="space-y-3.5 mb-6">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                <Laptop size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">1. Look at your Address Bar</p>
                <p className="text-slate-600 mt-1">
                  At the top right of your browser's URL address bar (near the star icon), click the <strong>Install Computer Icon</strong> (💻⬇ or ➕).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                <MoreVertical size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">2. Or use the Browser Menu</p>
                <p className="text-slate-600 mt-1">
                  Click the three vertical dots (<strong>⋮</strong>) in the top-right corner of Chrome/Edge, then choose <strong>"Install PaintDesk ERP..."</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                <RefreshCw size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">3. If missed earlier</p>
                <p className="text-slate-600 mt-1">
                  Reloading the tab triggers the automatic installation prompt again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Android Tab */}
        {activeTab === 'android' && (
          <div className="space-y-3.5 mb-6">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <MoreVertical size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">1. Tap Menu in Chrome</p>
                <p className="text-slate-600 mt-0.5">Tap the three vertical dots (<strong>⋮</strong>) at the top-right corner of Chrome.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <ArrowUpRight size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">2. Select "Install App"</p>
                <p className="text-slate-600 mt-0.5">Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> and tap Confirm.</p>
              </div>
            </div>
          </div>
        )}

        {/* iOS Tab */}
        {activeTab === 'ios' && (
          <div className="space-y-3.5 mb-6">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Share size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">1. Tap Share in Safari</p>
                <p className="text-slate-600 mt-0.5">Tap the Share icon at the bottom of Safari (or top on iPad).</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <PlusSquare size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">2. "Add to Home Screen"</p>
                <p className="text-slate-600 mt-0.5">Scroll down the action list and select Add to Home Screen.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <ArrowUpRight size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 text-sm">3. Tap "Add"</p>
                <p className="text-slate-600 mt-0.5">Tap Add in the top-right corner to finish installing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reload Page</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalInstallModal;
