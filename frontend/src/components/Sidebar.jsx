import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  FileText,
  Archive,
  Wallet,
  BarChart2,
  Settings,
  Zap,
  X,
  Download,
  QrCode
} from 'lucide-react';
import { useLicense } from '../context/LicenseContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { hasModuleAccess } = useLicense();
  const { canInstall, promptInstall } = usePWAInstall();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { name: 'Quick Scan', path: '/quick', icon: Zap, module: 'quick' },
    { name: 'Products', path: '/products', icon: Package, module: 'products' },
    { name: 'Customers', path: '/customers', icon: Users, module: 'customers' },
    { name: 'Dealers', path: '/dealers', icon: Truck, module: 'dealers' },
    { name: 'Purchases', path: '/purchases', icon: ShoppingCart, module: 'purchases' },
    { name: 'Sales', path: '/sales', icon: FileText, module: 'sales' },
    { name: 'Stock', path: '/stock', icon: Archive, module: 'stock' },
    { name: 'Expenses', path: '/expenses', icon: Wallet, module: 'expenses' },
    { name: 'Reports', path: '/reports', icon: BarChart2, module: 'reports' },
    { name: 'Settings', path: '/settings', icon: Settings, module: 'settings' },
    { name: 'Install App / QR', path: '/install-app', icon: QrCode },
  ].filter(item => !item.module || hasModuleAccess(item.module));

  return (
    <aside className={`w-[260px] bg-white text-slate-600 flex flex-col h-screen md:h-[100dvh] fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 border-r border-slate-200 shadow-xl md:shadow-sm ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-6 flex items-center justify-between border-b border-slate-200/60 h-[72px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
            P
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">PaintDesk</h1>
        </div>
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 relative group ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Persistent Install App CTA in Sidebar */}
      {canInstall && (
        <div className="px-4 pb-3 shrink-0">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              promptInstall();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-all border border-blue-200/60 shadow-xs cursor-pointer active:scale-98"
          >
            <Download size={15} />
            <span>Install PaintDesk</span>
          </button>
        </div>
      )}

      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner">
            A
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-800">Admin User</p>
            <p className="text-slate-500 text-xs font-medium">admin@paintdesk.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
