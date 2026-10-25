/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLicense = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
      const response = await axios.get(`${baseUrl}/license`, { timeout: 10000 });
      if (response.data && response.data.success) {
        setLicense(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch license:', err);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      err.isOffline = isOffline;
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const runFetch = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
        const response = await axios.get(`${baseUrl}/license`, { timeout: 10000 });
        if (active && response.data && response.data.success) {
          setLicense(response.data.data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch license:', err);
          err.isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          setError(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    runFetch();

    // Auto-retry license verification when connection is restored
    const handleOnline = () => {
      runFetch();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      active = false;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const hasModuleAccess = (moduleName) => {
    if (!license) return false;
    return !!license.modules[moduleName];
  };

  const refreshLicense = () => {
    setLoading(true);
    fetchLicense();
  };

  return (
    <LicenseContext.Provider value={{ license, loading, error, hasModuleAccess, refreshLicense }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => useContext(LicenseContext);
