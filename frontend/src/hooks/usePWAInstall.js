import { useState, useEffect, useCallback } from 'react';

const DISMISS_KEY = 'paint_desk_pwa_install_dismissed_until';

const checkIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
  );
};

const checkIsIOS = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
};

const checkIsDismissed = () => {
  if (typeof window === 'undefined') return false;
  const dismissedUntil = localStorage.getItem(DISMISS_KEY);
  return !!(dismissedUntil && Number(dismissedUntil) > Date.now());
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone] = useState(checkIsStandalone);
  const [isInstalled, setIsInstalled] = useState(checkIsStandalone);
  const [isIOS] = useState(checkIsIOS);
  const [isDismissed, setIsDismissed] = useState(checkIsDismissed);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Listen for native beforeinstallprompt (Chromium / Edge / Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 2. Listen for successful app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return { outcome: 'ios_guide' };
    }

    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return choiceResult;
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
      return { outcome: 'error', error: err };
    }
  }, [deferredPrompt, isIOS]);

  const dismissInstall = useCallback((days = 7) => {
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, expiry.toString());
    setIsDismissed(true);
  }, []);

  const canInstall = !isInstalled && !isStandalone && (!!deferredPrompt || (isIOS && !isDismissed));
  const showBanner = canInstall && !isDismissed;

  return {
    canInstall,
    showBanner,
    isInstalled,
    isStandalone,
    isIOS,
    showIOSModal,
    setShowIOSModal,
    promptInstall,
    dismissInstall,
  };
};

export default usePWAInstall;
