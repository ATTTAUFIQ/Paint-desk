import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Smartphone, 
  Laptop, 
  Share, 
  PlusSquare, 
  Check, 
  Copy, 
  Sparkles, 
  Wifi, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import UniversalInstallModal from '../../components/pwa/UniversalInstallModal';

const InstallAppPage = () => {
  const { isStandalone, isIOS, showGuideModal, setShowGuideModal, promptInstall } = usePWAInstall();
  const [appUrl] = useState(() => (typeof window !== 'undefined' ? window.location.origin : ''));
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!appUrl) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <QrCode size={24} />
            </div>
            <span>Install PaintDesk App</span>
          </div>
        }
        subtitle="Scan the QR code from your phone or install directly on this computer for instant billing and offline resilience."
        backUrl="/"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Code Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-5">
            <Sparkles size={14} /> Scan with Mobile Camera
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-sm mb-5 relative group">
            {appUrl ? (
              <QRCodeSVG
                value={appUrl}
                size={230}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.svg',
                  height: 42,
                  width: 42,
                  excavate: true,
                }}
              />
            ) : (
              <div className="w-[230px] h-[230px] bg-slate-100 animate-pulse rounded-xl" />
            )}
          </div>

          <p className="text-sm font-semibold text-slate-800 mb-1">
            Scan to Open & Install on Mobile
          </p>
          <p className="text-xs text-slate-500 max-w-xs mb-5">
            Point your smartphone's camera at this QR code to launch PaintDesk and add it to your home screen.
          </p>

          {/* URL Box with Copy Button */}
          <div className="w-full flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl mb-5">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-700 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Persistent Desktop / Device Install Trigger */}
          {!isStandalone ? (
            <button
              onClick={promptInstall}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download size={18} />
              <span>Install Directly on this Device</span>
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2">
              <ShieldCheck size={16} />
              <span>PaintDesk is currently running as an installed PWA</span>
            </div>
          )}

          {/* Localhost Wi-Fi Note */}
          {appUrl.includes('localhost') && (
            <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800">
              <span className="font-bold">Local Network Tip:</span> When testing from a mobile phone on the same Wi-Fi, replace <code className="bg-amber-100 px-1 py-0.5 rounded">localhost</code> with your computer's local IP (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded">http://192.168.x.x:5173</code>).
            </div>
          )}
        </div>

        {/* Right Column: Platform Installation Guides & Features */}
        <div className="lg:col-span-7 space-y-6">
          {/* Platform Guides */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Smartphone size={20} className="text-blue-600" />
              How to Install on Your Device
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Android Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
                  Android (Chrome)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scan the QR code or open in Chrome. Tap the <strong>"Install App"</strong> prompt at the bottom, or open Chrome's menu (⋮) and tap <strong>"Install app"</strong>.
                </p>
              </div>

              {/* iOS Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
                  iPhone & iPad (Safari)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scan QR code in Safari. Tap the <Share size={12} className="inline text-blue-600" /> <strong>Share</strong> button, scroll down and select <PlusSquare size={12} className="inline text-indigo-600" /> <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              {/* Windows Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                  Windows (Edge / Chrome)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the install icon (<Laptop size={12} className="inline text-blue-600" />) in your browser address bar or click the install button on this page.
                </p>
              </div>

              {/* macOS Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">4</span>
                  Mac (Chrome / Safari)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In Chrome, click the address bar install icon. In Safari (macOS Sonoma+), click <strong>File ➔ Add to Dock</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Key PWA Advantages */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Key Features of the PaintDesk PWA
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Instant Scanning</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Direct hardware camera access for lightning-fast barcode and QR scanning in Quick Sale.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Wifi size={18} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Offline Resilience</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Application shell and core templates are precached so the interface opens without delay even with weak Wi-Fi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Laptop size={18} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">App Experience</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Runs in its own borderless window without browser tabs, maximizing screen space for billing workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Guide Modal for Desktop, Android, and iOS */}
      <UniversalInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
      />
    </div>
  );
};

export default InstallAppPage;
