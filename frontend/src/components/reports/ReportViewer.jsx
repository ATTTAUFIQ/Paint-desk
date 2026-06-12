import React, { useRef } from 'react';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportViewer = ({ title, columns, data, summary }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: title,
  });

  const handleExportExcel = () => {
    // Format data for Excel
    const excelData = data.map(item => {
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
    const element = componentRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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

      {/* Printable Area */}
      <div className="p-8" ref={componentRef}>
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">{title}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>

        <table className="w-full text-left text-sm text-slate-600 mb-8 border-collapse">
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
