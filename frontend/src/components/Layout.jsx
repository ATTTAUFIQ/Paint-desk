import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const getHeaderTitle = () => {
    const path = location.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Workspace';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-x-hidden">
        {/* Absolute subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent -z-10" />
        
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{getHeaderTitle()}</h2>
        </header>
        
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
