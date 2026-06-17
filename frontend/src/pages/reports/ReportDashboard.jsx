import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, FileText, TrendingUp, Users, Truck, Archive, Wallet } from 'lucide-react';
import reportService from '../../services/reportService';
import ReportViewer from '../../components/reports/ReportViewer';
import PageHeader from '../../components/common/PageHeader';

const ReportDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({ data: [], summary: null });
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'sales', name: 'Sales Report', icon: FileText, hasDates: true },
    { id: 'purchases', name: 'Purchase Report', icon: Truck, hasDates: true },
    { id: 'profit', name: 'Profit & Loss', icon: TrendingUp, hasDates: true },
    { id: 'expenses', name: 'Expense Report', icon: Wallet, hasDates: true },
    { id: 'customers', name: 'Customer Outstanding', icon: Users, hasDates: false },
    { id: 'dealers', name: 'Dealer Outstanding', icon: Truck, hasDates: false },
    { id: 'stock', name: 'Stock Value', icon: Archive, hasDates: false },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      const activeTabInfo = tabs.find(t => t.id === activeTab);

      if (activeTabInfo?.hasDates) {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await reportService.getReport(activeTab, params);
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch report', error);
      setReportData({ data: [], summary: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleApplyFilter = () => {
    fetchReport();
  };

  const getColumnsForTab = () => {
    switch (activeTab) {
      case 'sales':
        return [
          { header: 'Date', key: 'saleDate', render: (row) => new Date(row.saleDate).toLocaleDateString() },
          { header: 'Invoice No', key: 'invoiceNumber' },
          { header: 'Customer', key: 'customer', render: (row) => row.customerId?.name || 'Unknown' },
          { header: 'Status', key: 'paymentStatus' },
          { header: 'SubTotal', key: 'subTotal', render: (row) => `₹${parseFloat(row.subTotal).toFixed(2)}` },
          { header: 'GST', key: 'totalGst', render: (row) => `₹${parseFloat(row.totalGst).toFixed(2)}` },
          { header: 'Outstanding', key: 'outstanding', render: (row) => `₹${Math.max(0, (parseFloat(row.totalAmount) || 0) - (parseFloat(row.amountPaid) || 0)).toFixed(2)}` },
          { header: 'Total', key: 'totalAmount', render: (row) => `₹${parseFloat(row.totalAmount).toFixed(2)}` },
        ];
      case 'purchases':
        return [
          { header: 'Date', key: 'purchaseDate', render: (row) => new Date(row.purchaseDate).toLocaleDateString() },
          { header: 'PO Number', key: 'purchaseNumber' },
          { header: 'Dealer', key: 'dealer', render: (row) => row.dealerId?.name || 'Unknown' },
          { header: 'Status', key: 'status' },
          { header: 'SubTotal', key: 'subTotal', render: (row) => `₹${parseFloat(row.subTotal).toFixed(2)}` },
          { header: 'Total', key: 'totalAmount', render: (row) => `₹${parseFloat(row.totalAmount).toFixed(2)}` },
        ];
      case 'profit':
        return [
          { header: 'Category', key: 'category', render: (row) => <span className="font-bold">{row.category}</span> },
          {
            header: 'Amount', key: 'amount', render: (row) => (
              <span className={row.amount < 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                ₹{Math.abs(row.amount).toFixed(2)} {row.amount < 0 ? '(Deduct)' : ''}
              </span>
            )
          },
        ];
      case 'expenses':
        return [
          { header: 'Date', key: 'expenseDate', render: (row) => new Date(row.expenseDate).toLocaleDateString() },
          { header: 'Title', key: 'title' },
          { header: 'Category', key: 'category' },
          { header: 'Amount', key: 'amount', render: (row) => `₹${parseFloat(row.amount).toFixed(2)}` },
        ];
      case 'customers':
        return [
          { header: 'Customer Name', key: 'name' },
          { header: 'Mobile', key: 'mobileNumber' },
          { header: 'Outstanding Balance', key: 'outstandingBalance', render: (row) => `₹${parseFloat(row.outstandingBalance).toFixed(2)}` },
        ];
      case 'dealers':
        return [
          { header: 'Dealer Name', key: 'name' },
          { header: 'Mobile', key: 'mobileNumber' },
          { header: 'Pending Balance', key: 'pendingBalance', render: (row) => `₹${parseFloat(row.pendingBalance).toFixed(2)}` },
        ];
      case 'stock':
        return [
          { header: 'Product Code', key: 'productCode' },
          { header: 'Name', key: 'name' },
          { header: 'Category', key: 'category', render: (row) => row.categoryId?.name || '-' },
          { header: 'Current Stock', key: 'currentStock' },
          { header: 'Purchase Price', key: 'purchasePrice', render: (row) => `₹${parseFloat(row.purchasePrice).toFixed(2)}` },
          { header: 'Total Value', key: 'value', render: (row) => `₹${(row.currentStock * parseFloat(row.purchasePrice)).toFixed(2)}` },
        ];
      default:
        return [];
    }
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <BarChart2 className="text-blue-600" /> Reports Center
          </div>
        }
        subtitle="Generate, print, and export your business reports."
        backUrl="/"
      />

      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setStartDate(''); setEndDate(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-left ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                  }`}
              >
                <Icon size={18} /> {tab.name}
              </button>
            )
          })}
        </div>

        {/* Report Content */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* Filters Bar */}
          {activeTabInfo?.hasDates && (
            <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          )}

          {/* Report Viewer */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Generating report...</p>
            </div>
          ) : (
            <ReportViewer
              title={activeTabInfo?.name || 'Report'}
              columns={getColumnsForTab()}
              data={reportData.data}
              summary={reportData.summary}
            />
          )}

        </div>
      </div>

    </div>
  );
};

export default ReportDashboard;
