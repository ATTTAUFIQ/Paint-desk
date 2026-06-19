import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getHeaderTitle = () => {
    const path = location.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Workspace';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans relative overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="flex-1 flex flex-col relative w-full h-full overflow-y-auto overflow-x-hidden">
        {/* Absolute subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent -z-10" />

        {/* Desktop Header */}
        <header className="hidden md:flex h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200/60 items-center px-8 sticky top-0 z-30 shrink-0 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-700 tracking-tight">{getHeaderTitle()}</h2>
        </header>

        {/* Mobile-only App Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 h-16 flex items-center shadow-sm shrink-0 gap-2">
          <button
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getHeaderTitle()}</h2>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
