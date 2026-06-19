import React, { useRef } from 'react';
import { Download, Printer, FileSpreadsheet, Building2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ReportViewer = ({ title, columns, data, summary }) => {
  const componentRef = useRef();

  // Reverse data to ascending order if it's a date-based report
  const isDateReport = columns.some(c => c.header === 'Date');
  const exportData = isDateReport ? [...data].reverse() : data;

  const handlePrintFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: title,
  });

  const handlePrint = async () => {
    try {
      if (!componentRef.current) throw new Error("Component ref is missing");
      await handlePrintFn();
    } catch (err) {
      console.error('Print failed:', err);
      alert('Print failed: ' + (err.message || err));
    }
  };

  const handleExportExcel = () => {
    // Format data for Excel
    const excelData = exportData.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.header] = col.render ? col.render(item, true) : item[col.key]; // Pass true if we need plain text version
      });
      return row;
    });

    if (summary) {
      excelData.push({}); // Empty row
      const summaryRow = { [columns[0].header]: 'Summary' };
      Object.keys(summary).forEach((key) => {
        summaryRow[key] = summary[key];
      });
      excelData.push(summaryRow);
    }

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = async () => {
    // Temporarily proxy getComputedStyle to hide 'oklch' and 'oklab' colors from html2canvas
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function(element, pseudoElt) {
      const style = originalGetComputedStyle(element, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          const val = target[prop];
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
            return prop === 'color' ? 'rgb(15, 23, 42)' : 'rgba(0, 0, 0, 0)';
          }
          if (typeof val === 'function') {
            return function(...args) {
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
      if (!element) throw new Error("Component ref is missing");
      // Pass window dimensions so html2canvas doesn't clip large off-screen elements
      const canvas = await html2canvas(element, { 
        scale: 1.5, // Reduced from 2 to save memory and file size while keeping text readable
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // Use JPEG with 0.7 quality instead of PNG to drastically reduce image size
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for reports
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Use an alias ('report_img') so jsPDF only stores the image bytes ONCE for the entire document
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, 'report_img', 'FAST');
      heightLeft -= pageHeight;

      // Add new pages if the content height exceeds the page height
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, 'report_img', 'FAST');
        heightLeft -= pageHeight;
      }
      pdf.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed: ' + (err.message || err));
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">

      {/* Action Bar */}
      <div className="p-4 border-b border-slate-100 flex justify-end gap-3 bg-slate-50/50">
        <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold transition-colors text-sm">
          <FileSpreadsheet size={16} /> Excel
        </button>
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-semibold transition-colors text-sm">
          <Download size={16} /> PDF
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-semibold transition-colors text-sm">
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Hidden Printable Area for PDF & Print */}
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        <div 
          className="p-10 rounded-3xl" 
          style={{ backgroundColor: '#ffffff', border: '8px solid #f1f5f9', width: 'max-content', minWidth: '1123px' }}
          ref={componentRef}
        >
          {/* Decorative Top Border */}
          <div 
            className="h-4 w-full mb-8 rounded-full shadow-sm"
            style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
          ></div>

          {/* Header Section */}
          <div 
            className="flex justify-between items-center mb-10 pb-8"
            style={{ borderBottom: '2px solid #f1f5f9' }}
          >
            {/* Logo & Company Name */}
            <div className="flex items-center gap-5">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)', border: '4px solid #dbeafe' }}
              >
                <Building2 size={34} style={{ color: '#ffffff' }} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight" style={{ color: '#1e293b' }}>Your Business Name</h1>
                <p className="text-sm font-bold tracking-widest uppercase mt-1" style={{ color: '#2563eb' }}>Reports & Analytics</p>
              </div>
            </div>
            
            {/* Report Title & Date */}
            <div className="text-right flex flex-col items-end">
              <div 
                className="px-6 py-2.5 rounded-xl shadow-md mb-3"
                style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
              >
                <h2 className="text-xl font-black tracking-widest uppercase" style={{ color: '#ffffff' }}>{title}</h2>
              </div>
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <p className="font-bold text-sm" style={{ color: '#475569' }}>
                  Generated: <span style={{ color: '#1e293b' }}>{new Date().toLocaleDateString()}</span>
                </p>
                <p className="font-medium text-xs mt-0.5" style={{ color: '#64748b' }}>
                  Time: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div 
            className="rounded-2xl overflow-hidden mb-10 shadow-lg"
            style={{ border: '2px solid #cbd5e1', backgroundColor: '#ffffff' }}
          >
            <table className="w-full text-left text-sm border-collapse" style={{ color: '#334155' }}>
              <thead className="uppercase font-black text-xs tracking-widest" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-5" style={{ borderBottom: '4px solid #3b82f6' }}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {exportData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center font-bold text-base" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                      No data available for this report.
                    </td>
                  </tr>
                ) : (
                  exportData.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className={`px-6 py-4 ${colIdx === 0 ? 'font-bold' : 'font-medium'}`} style={{ borderRight: colIdx === columns.length - 1 ? 'none' : '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9' }}>
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          {summary && Object.keys(summary).length > 0 && (
            <div className="flex justify-end mb-8">
              <div 
                className="rounded-2xl p-7 w-full max-w-lg shadow-md relative overflow-hidden"
                style={{ background: 'linear-gradient(to bottom right, #eff6ff, #f8fafc)', border: '2px solid #bfdbfe' }}
              >
                {/* Decorative background element */}
                <div 
                  className="absolute -right-6 -top-6 w-32 h-32 rounded-full"
                  style={{ backgroundColor: '#3b82f6', opacity: 0.05 }}
                ></div>
                
                <h3 
                  className="font-black mb-5 uppercase text-sm tracking-widest pb-3 flex items-center gap-2"
                  style={{ color: '#1e3a8a', borderBottom: '2px solid #dbeafe' }}
                >
                  <div className="w-2 h-6 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                  Financial Summary
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(summary).map(([key, value]) => {
                    const isTotal = key.toLowerCase().includes('total') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('outstanding') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('value');
                    return (
                      <div 
                        key={key} 
                        className="flex justify-between items-center px-4 py-3 rounded-xl shadow-sm"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}
                      >
                        <span className="font-bold capitalize tracking-wide" style={{ color: '#475569' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-black text-lg" style={{ color: isTotal ? '#1d4ed8' : '#1e293b' }}>
                          {typeof value === 'number' && isTotal ? `₹${value.toFixed(2)}` : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div 
            className="mt-8 pt-8 text-center flex flex-col items-center justify-center"
            style={{ borderTop: '4px solid #f1f5f9' }}
          >
            <div className="w-16 h-1 rounded-full mb-4" style={{ backgroundColor: '#dbeafe' }}></div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#64748b' }}>This is a computer-generated document</p>
            <p className="text-[10px] font-medium mt-1" style={{ color: '#94a3b8' }}>No physical signature is required for validation.</p>
          </div>
        </div>
      </div>

      {/* On-Screen Area */}
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">{title}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full whitespace-nowrap text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 border border-slate-200">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border border-slate-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 font-medium border border-slate-200">
                    No data available for this report.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 border border-slate-200">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        {summary && Object.keys(summary).length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full max-w-md ml-auto">
            <h3 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">Summary</h3>
            <div className="space-y-2">
              {Object.entries(summary).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-black text-slate-800">
                    {typeof value === 'number' && key.toLowerCase().includes('total') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('outstanding') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') ? `₹${value.toFixed(2)}` : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;

