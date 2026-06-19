import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, AlertCircle, FileText } from 'lucide-react';
import InvoiceTemplate from '../../components/invoice/InvoiceTemplate';

const PublicInvoice = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const componentRef = useRef();
  const containerRef = useRef();

  const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // The invoice template is 794px wide. We use 820px to leave some padding.
        if (containerWidth < 820) {
          setScale(containerWidth / 820);
        } else {
          setScale(1);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Give it a tiny delay to ensure DOM layout is complete before first calculation
    setTimeout(handleResize, 50);

    return () => window.removeEventListener('resize', handleResize);
  }, [sale]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${baseUrl}/public/invoice/${id}`);
        if (res.data.success) {
          setSale(res.data.data);
        } else {
          setError('Invoice not found or could not be loaded.');
        }
      } catch (err) {
        setError('Invoice not found or the link is invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, baseUrl]);

  const handleDownload = async () => {
    if (!componentRef.current || !sale) return;
    setDownloading(true);

    // Give DOM time to fully paint before capture
    await new Promise(resolve => setTimeout(resolve, 300));

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
      pdf.save(`Invoice-${sale.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Official Invoice...</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Invoice Not Found</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans relative">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Floating Action Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-50 backdrop-blur-xl bg-white/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 leading-tight">Invoice {sale.invoiceNumber}</h2>
              <p className="text-xs text-slate-500 font-medium">Thank you for your business!</p>
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-wait"
          >
            <Download size={18} />
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Invoice View Area */}
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200 w-full" ref={containerRef}>
          <div 
            className="w-full flex justify-center bg-slate-200/50 py-4 md:py-8"
            style={{ height: `${(1123 * scale) + (window.innerWidth < 768 ? 32 : 64)}px` }}
          >
            <div 
              className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-lg origin-top"
              style={{ transform: `scale(${scale})` }}
            >
              <InvoiceTemplate sale={sale} />
            </div>
          </div>
        </div>

      </div>

      {/* Hidden template specifically for perfect PDF generation without overflow clipping */}
      <div className="fixed top-0 left-0 z-[-9999] opacity-0 pointer-events-none">
        <InvoiceTemplate ref={componentRef} sale={sale} />
      </div>
    </div>
  );
};

export default PublicInvoice;
