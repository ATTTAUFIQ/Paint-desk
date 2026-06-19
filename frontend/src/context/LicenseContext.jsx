import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLicense = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
      // License route is at /api/license
      const response = await axios.get(`${baseUrl}/license`);
      if (response.data && response.data.success) {
        setLicense(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch license:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
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
