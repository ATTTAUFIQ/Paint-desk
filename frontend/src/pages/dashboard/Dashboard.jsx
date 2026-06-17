import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, Package, AlertTriangle, PackageX 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import PageHeader from '../../components/common/PageHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, chartsRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getCharts()
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <PageHeader 
        title="Business Overview" 
        subtitle="Here's what's happening in your business today."
      />

      {/* Primary Metrics (Today) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Today */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-semibold text-sm uppercase tracking-wider mb-1">Sales Today</p>
              <h3 className="text-4xl font-black tracking-tight">₹{(stats?.salesToday || 0).toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Purchases Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Purchases Today</p>
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">₹{(stats?.purchasesToday || 0).toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={24} className="text-slate-600" />
            </div>
          </div>
        </div>

        {/* Profit Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Net Profit Today</p>
              <h3 className={`text-4xl font-black tracking-tight ${stats?.profitToday >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ₹{(stats?.profitToday || 0).toLocaleString()}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats?.profitToday >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics (Global) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center"><Users size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Customers</p>
            <p className="text-xl font-black text-slate-800">{stats?.totalCustomers || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Package size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Products</p>
            <p className="text-xl font-black text-slate-800">{stats?.totalProducts || 0}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/stock?filter=low')}
          className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all hover:border-amber-200">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Low Stock</p>
            <p className="text-xl font-black text-slate-800">{stats?.lowStockProducts || 0}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/stock?filter=out')}
          className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all hover:border-red-200">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><PackageX size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Out of Stock</p>
            <p className="text-xl font-black text-red-500">{stats?.outOfStockProducts || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue (Area Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue (Last 6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products (All Time)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.topSellingProducts || []} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} name="Qty Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Sales Trend (Line Chart) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Trend (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.salesTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
