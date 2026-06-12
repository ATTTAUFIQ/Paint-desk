import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, CheckCircle, XCircle, Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import saleService from '../../services/saleService';
import PageHeader from '../../components/common/PageHeader';
import InvoiceTemplate from '../../components/invoice/InvoiceTemplate';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await saleService.getSaleById(id);
        if (response.success) {
          setSale(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch sale details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${sale?.invoiceNumber || 'Unknown'}`,
  });

  const handleDownloadPdf = async () => {
    const element = componentRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${sale.invoiceNumber}.pdf`);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading invoice details...</div>;
  }

  if (!sale) {
    return <div className="p-8 text-center text-red-500 font-medium">Sale Invoice not found.</div>;
  }

  const getPaymentBadge = (status) => {
    switch(status) {
      case 'Paid': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">Paid</span>;
      case 'Partial': return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-600 border-yellow-100">Partial</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">Pending</span>;
    }
  };

  const balanceDue = parseFloat(sale.totalAmount) - parseFloat(sale.amountPaid);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader title={`Invoice: ${sale.invoiceNumber}`} backUrl="/sales" />
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> Print
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Hidden Invoice Template for Printing/PDF */}
      <div className="hidden">
        <InvoiceTemplate ref={componentRef} sale={sale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Invoice Info & Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Order Status</h3>
              {getPaymentBadge(sale.paymentStatus)}
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              {sale.status === 'Completed' ? (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle size={24} />
                </div>
              )}
              <div>
                <p className={`text-xl font-bold ${sale.status === 'Completed' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {sale.status}
                </p>
                <p className="text-slate-500 text-sm font-medium">
                  {new Date(sale.saleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-6 mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Customer Details</h3>
              <div className="flex items-start gap-3">
                <User className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-lg font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/customers/${sale.customerId._id}`)}>
                    {sale.customerId?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-slate-500 font-medium text-sm mt-1">Mobile: {sale.customerId?.mobileNumber}</p>
                  {sale.customerId?.gstNumber && <p className="text-slate-500 font-medium text-sm">GST: {sale.customerId.gstNumber}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-300">
                <span>Sub Total</span>
                <span className="font-medium text-white">₹{parseFloat(sale.subTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Total GST</span>
                <span className="font-medium text-white">₹{parseFloat(sale.totalGst).toFixed(2)}</span>
              </div>
              {parseFloat(sale.totalDiscount) > 0 && (
                <div className="flex justify-between items-center text-red-300">
                  <span>Discount Applied</span>
                  <span className="font-medium">- ₹{parseFloat(sale.totalDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="text-2xl font-extrabold text-blue-400">₹{parseFloat(sale.totalAmount).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-sm font-medium">Amount Paid</span>
                <span className="font-bold">₹{parseFloat(sale.amountPaid).toFixed(2)}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between items-center text-amber-400">
                  <span className="text-sm font-medium">Balance Due</span>
                  <span className="font-bold text-lg">₹{balanceDue.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <FileText className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Invoice Items</h3>
            </div>
            
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="pb-4 px-2 w-12">#</th>
                    <th className="pb-4">Product Name</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Unit Price (₹)</th>
                    <th className="pb-4 text-right">GST (₹)</th>
                    <th className="pb-4 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items && sale.items.length > 0 ? (
                    sale.items.map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{item.productId?.name || 'Unknown Product'}</p>
                          <p className="text-xs font-medium text-slate-500">{item.productId?.productCode} &bull; {item.productId?.brand}</p>
                        </td>
                        <td className="py-4 text-center font-bold text-slate-700">
                          <span className="px-3 py-1 bg-slate-100 rounded-lg">{item.quantity} {item.productId?.unitType}</span>
                        </td>
                        <td className="py-4 text-right font-medium text-slate-600">{parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td className="py-4 text-right font-medium text-slate-600">{parseFloat(item.gstAmount).toFixed(2)}</td>
                        <td className="py-4 text-right font-bold text-slate-900">{parseFloat(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No items found in this invoice.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SaleDetails;
