import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Calendar, IndianRupee, Trash2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PaymentReceiptTemplate from '../invoice/PaymentReceiptTemplate';

const PaymentHistory = ({ payments, onEditClick, onDeleteClick, partyName }) => {
  const [downloadingPaymentId, setDownloadingPaymentId] = useState(null);
  const [downloadPayment, setDownloadPayment] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    const generatePdf = async () => {
      if (downloadPayment && receiptRef.current) {
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
          const element = receiptRef.current;
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          pdf.save(`Receipt-${downloadPayment._id.slice(-6).toUpperCase()}.pdf`);
        } catch (error) {
          console.error('PDF generation failed:', error);
          alert('Failed to generate PDF. Error: ' + (error.message || error));
        } finally {
          window.getComputedStyle = originalGetComputedStyle;
          setDownloadingPaymentId(null);
          setDownloadPayment(null);
        }
      }
    };

    if (downloadPayment) {
      const timer = setTimeout(generatePdf, 300);
      return () => clearTimeout(timer);
    }
  }, [downloadPayment]);

  const handleDownload = (payment) => {
    setDownloadingPaymentId(payment._id);
    setDownloadPayment(payment);
  };

  return (
    <div className="overflow-hidden border border-slate-100 rounded-2xl">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Method</th>
            <th className="px-6 py-4">Reference</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  ₹{parseFloat(payment.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {payment.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {payment.referenceNumber || '-'}
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() => handleDownload(payment)}
                    disabled={downloadingPaymentId === payment._id}
                    className={`inline-flex items-center justify-center align-middle transition-colors mr-3 ${downloadingPaymentId === payment._id ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-emerald-600'}`}
                    title="Download Receipt PDF"
                  >
                    <Download size={16} className="mt-[-2px]" />
                  </button>
                  <button
                    onClick={() => onEditClick(payment)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteClick(payment._id)}
                    className="text-slate-400 hover:text-red-600 transition-colors inline-flex items-center justify-center align-middle"
                    title="Delete Payment"
                  >
                    <Trash2 size={16} className="mt-[-2px]" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium mb-1">No payment history.</p>
                  <p className="text-slate-400 text-sm">Payments recorded will appear here.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Hidden Receipt Template for PDF Generation */}
      <div className="fixed top-0 left-0 z-[-9999] opacity-0 pointer-events-none">
        {downloadPayment && <PaymentReceiptTemplate ref={receiptRef} payment={downloadPayment} partyName={partyName} />}
      </div>
    </div>
  );
};

export default PaymentHistory;
