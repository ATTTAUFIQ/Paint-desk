import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, FileText, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import customerService from '../../services/customerService';
import PageHeader from '../../components/common/PageHeader';
import FinancialWidget from '../../components/common/FinancialWidget';
import PaymentModal from '../../components/common/PaymentModal';
import PaymentHistory from '../../components/common/PaymentHistory';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import InvoiceTemplate from '../../components/invoice/InvoiceTemplate';
import paymentService from '../../services/paymentService';
import saleService from '../../services/saleService';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // stores payment ID
  const [activeTab, setActiveTab] = useState('purchases');
  const [downloadingSaleId, setDownloadingSaleId] = useState(null);
  const [downloadSale, setDownloadSale] = useState(null);
  const componentRef = React.useRef();

  const fetchCustomer = async () => {
    try {
      const [customerRes, paymentsRes, salesRes] = await Promise.all([
        customerService.getCustomerById(id),
        paymentService.getPaymentsByParty('Customer', id),
        saleService.getSales({ customerId: id, limit: 100 })
      ]);

      if (customerRes.success) {
        setCustomer(customerRes.data);
      }
      if (paymentsRes && paymentsRes.success) {
        setPayments(paymentsRes.data);
      }
      if (salesRes && salesRes.success) {
        setSales(salesRes.data.sales);
      }
    } catch (error) {
      console.error('Failed to fetch customer details', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!deleteConfirmation) return;
    try {
      const res = await paymentService.deletePayment(deleteConfirmation);
      if (res.success) {
        fetchCustomer();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleDownload = async (saleId) => {
    setDownloadingSaleId(saleId);
    try {
      const response = await saleService.getSaleById(saleId);
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
        // Temporarily proxy getComputedStyle to hide 'oklch' and 'oklab' colors from html2canvas
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
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading customer profile...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500 font-medium">Customer not found.</div>;
  }

  const outstanding = parseFloat(customer.outstandingBalance || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Customer Profile" backUrl="/customers" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Finances */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0"></div>
            <div className="w-20 h-20 bg-white rounded-full p-1 z-10 mt-2 shadow-sm">
              <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <User size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-3">{customer.name}</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">ID: {customer._id.substring(customer._id.length - 6).toUpperCase()}</p>

            <div className="w-full border-t border-slate-100 mt-4 pt-4 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Phone className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</p>
                  <p className="text-slate-700 text-sm font-medium">{customer.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">GST Number</p>
                  <p className="text-slate-700 text-sm font-medium">{customer.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-slate-700 text-sm font-medium leading-snug">{customer.address || 'No address provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reusable Financial Widget - Kept below but Profile Card is now compacted */}
          <FinancialWidget
            amount={customer.outstandingBalance}
            title="Outstanding Balance"
            type="debt"
            actionText="Record Payment"
            onActionClick={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }}
          />
        </div>

        {/* Right Column: History Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
            <div className="flex space-x-6 border-b border-slate-100 mb-6">
              <button
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('purchases')}
              >
                Purchase History
              </button>
              <button
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('payments')}
              >
                Payment History
              </button>
            </div>

            {activeTab === 'purchases' ? (
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sales && sales.length > 0 ? (
                      sales.map(sale => (
                        <tr key={sale._id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/sales/${sale._id}`)}>
                          <td className="px-6 py-4 font-bold text-slate-900">{sale.invoiceNumber}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(sale.saleDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {sale.status === 'Completed' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">Completed</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">Cancelled</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(sale._id); }}
                              disabled={downloadingSaleId === sale._id}
                              className={`p-2 rounded-lg transition-all ${downloadingSaleId === sale._id ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              title="Download Invoice PDF"
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                              <FileText className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-500 font-medium mb-1">No purchase history yet.</p>
                            <p className="text-slate-400 text-sm">Once sales are recorded, they will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <PaymentHistory
                payments={payments}
                partyName={customer.name}
                onEditClick={(payment) => {
                  setEditingPayment(payment);
                  setIsPaymentModalOpen(true);
                }}
                onDeleteClick={(id) => setDeleteConfirmation(id)}
              />
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setEditingPayment(null); }}
        partyType="Customer"
        partyId={customer._id}
        partyName={customer.name}
        onPaymentSuccess={fetchCustomer}
        editingPayment={editingPayment}
        currentBalance={parseFloat(customer.outstandingBalance?.$numberDecimal || customer.outstandingBalance || 0)}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDeletePayment}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? The customer's outstanding balance will be mathematically reversed."
        confirmText="Yes, Delete"
      />

      {/* Hidden Invoice Template for PDF Generation */}
      <div className="fixed top-0 left-0 z-[-9999] opacity-0 pointer-events-none">
        {downloadSale && <InvoiceTemplate ref={componentRef} sale={downloadSale} />}
      </div>
    </div>
  );
};

export default CustomerDetails;
