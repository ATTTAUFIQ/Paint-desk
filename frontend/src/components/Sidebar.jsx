import React from 'react';
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
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Dealers', path: '/dealers', icon: Truck },
    { name: 'Purchases', path: '/purchases', icon: ShoppingCart },
    { name: 'Sales', path: '/sales', icon: FileText },
    { name: 'Stock', path: '/stock', icon: Archive },
    { name: 'Expenses', path: '/expenses', icon: Wallet },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-white text-slate-600 flex flex-col h-screen sticky top-0 border-r border-slate-200 shadow-sm z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
          P
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">PaintDesk</h1>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 relative group ${
                  isActive 
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
      
      <div className="p-5 border-t border-slate-100">
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
