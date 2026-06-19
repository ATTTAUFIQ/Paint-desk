import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, XCircle, Download, Edit } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import saleService from '../../services/saleService';
import InvoiceTemplate from '../../components/invoice/InvoiceTemplate';
import PageHeader from '../../components/common/PageHeader';

const SaleList = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [downloadingSaleId, setDownloadingSaleId] = useState(null);
  const [downloadSale, setDownloadSale] = useState(null);
  const componentRef = React.useRef();

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getSales({ search, page, limit: 10 });
      if (response.success) {
        setSales(response.data.sales);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch sales', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [search, page]);

  const handleCancel = async (id) => {
    try {
      await saleService.cancelSale(id);
      setCancelConfirm(null);
      fetchSales();
    } catch (error) {
      console.error('Failed to cancel sale', error);
      alert(error.response?.data?.message || 'Failed to cancel sale');
    }
  };

  const handleDownload = async (id) => {
    setDownloadingSaleId(id);
    try {
      const response = await saleService.getSaleById(id);
      if (response.success) {
        setDownloadSale(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch invoice for download', error);
      alert('Failed to fetch invoice data. Please try again.');
      setDownloadingSaleId(null);
    }
  };

  useEffect(() => {
    const generatePdf = async () => {
      if (downloadSale && componentRef.current) {
        // Temporarily proxy getComputedStyle to hide 'oklch' colors from html2canvas
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (element, pseudoElt) {
          const style = originalGetComputedStyle(element, pseudoElt);
          return new Proxy(style, {
            get(target, prop) {
              const val = target[prop];
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                return prop === 'color' ? 'rgb(15, 23, 42)' : 'rgba(0, 0, 0, 0)';
              }
              if (typeof val === 'function') {
                return function (...args) {
                  const result = val.apply(target, args);
                  if (typeof result === 'string' && (result.includes('oklch') || result.includes('oklab'))) {
                    return args[0] === 'color' ? 'rgb(15, 23, 42)' : 'rgba(0, 0, 0, 0)';
                  }
                  return result;
                };
              }
              return val;
            }
          });
        };

        try {
          const element = componentRef.current;
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with 80% quality to reduce size
          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST'); // Use FAST compression
          pdf.save(`Invoice-${downloadSale.invoiceNumber}.pdf`);
        } catch (error) {
          console.error('PDF generation failed:', error);
          alert('Failed to generate PDF. Error: ' + (error.message || error));
        } finally {
          window.getComputedStyle = originalGetComputedStyle;
          setDownloadingSaleId(null);
          setDownloadSale(null);
        }
      }
    };

    if (downloadSale) {
      const timer = setTimeout(generatePdf, 300);
      return () => clearTimeout(timer);
    }
  }, [downloadSale]);

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">Paid</span>;
      case 'Partial': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-600 border-yellow-100">Partial</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Sales Register" 
        subtitle="Manage and track your invoices and sales history."
        backUrl="/"
      >
        <button
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} /> New Invoice
        </button>
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by Invoice number or customer name..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Loading sales...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No sales found.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {sale.invoiceNumber}
                      {sale.status === 'Cancelled' && <span className="ml-2 text-xs text-red-500 font-bold">(Cancelled)</span>}
                    </td>
                    <td className="px-6 py-4">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {sale.customerId ? sale.customerId.name : (sale.customerName || 'Miscellaneous Customer')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(sale.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button
                          onClick={() => {
                            const mobile = sale.customerId?.mobileNumber || '';
                            // Use the VITE_PUBLIC_URL from .env, fallback to localhost/origin if not found
                            const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
                                
                            const invoiceUrl = `${baseUrl}/public/invoice/${sale._id}`;

                            const customerName = sale.customerId?.name || sale.customerName || 'Customer';
                            let message = `Hi ${customerName}, thank you for your business! \n\nView and download your official invoice here: \n${invoiceUrl}`;

                            const encoded = encodeURIComponent(message);
                            let url;
                            if (mobile) {
                              let formattedMobile = mobile.replace(/\D/g, '');
                              if (formattedMobile.length === 10) formattedMobile = `91${formattedMobile}`;
                              url = `https://wa.me/${formattedMobile}?text=${encoded}`;
                            } else {
                              url = `https://wa.me/?text=${encoded}`;
                            }
                            window.open(url, '_blank');
                          }}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Send E-Invoice Link via WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                        </button>
                        <button
                          onClick={() => handleDownload(sale._id)}
                          disabled={downloadingSaleId === sale._id}
                          className={`p-2 rounded-lg transition-all ${downloadingSaleId === sale._id ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title="Download Invoice PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/sales/${sale._id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {sale.status !== 'Cancelled' && (
                          <button
                            onClick={() => navigate(`/sales/edit/${sale._id}`)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Sale"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {sale.status === 'Completed' && (
                          <button
                            onClick={() => setCancelConfirm(sale._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel Sale"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for PDF Generation */}
      <div className="fixed top-0 left-0 z-[-9999] opacity-0 pointer-events-none">
        {downloadSale && <InvoiceTemplate ref={componentRef} sale={downloadSale} />}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Sale Invoice</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to cancel this sale? This will automatically return the stock to inventory and update the customer's credit balance.
            </p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-8">
              <p className="text-sm text-yellow-800 font-medium">Note: This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Keep Invoice
              </button>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20"
              >
                Cancel Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleList;
