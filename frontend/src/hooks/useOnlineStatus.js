import { useState, useEffect, useCallback } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }
    try {
      // Ping local or configured health check
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}`, { method: 'HEAD', cache: 'no-store' });
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      // If server ping fails, navigator might still be online but server is unreachable
      setIsOnline(false);
      return false;
    }
  }, []);

  return { isOnline, wasOffline, checkConnection };
};

export default useOnlineStatus;
