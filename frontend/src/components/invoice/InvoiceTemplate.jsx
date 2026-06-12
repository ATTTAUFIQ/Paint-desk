import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const InvoiceTemplate = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  // Mock Shop Details (Will be fetched from Settings later)
  const shopDetails = {
    name: 'ColorWorld Paint Distributors',
    address: '45 Industrial Hub, Sector 5, Tech City, 400001',
    phone: '+91-9876543210',
    email: 'billing@colorworld.com',
    gstin: '22AAAAA0000A1Z5'
  };

  const invoiceDate = new Date(sale.saleDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Calculate totals
  const totalAmount = parseFloat(sale.totalAmount) || 0;
  const amountPaid = parseFloat(sale.amountPaid) || 0;
  const balanceDue = totalAmount - amountPaid;

  // Generate UPI payment string for QR code (mocked)
  // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
  const upiString = `upi://pay?pa=colorworld@ybl&pn=ColorWorld&am=${balanceDue > 0 ? balanceDue : totalAmount}&cu=INR&tn=Invoice-${sale.invoiceNumber}`;

  return (
    <div className="bg-white" ref={ref}>
      {/* 
        A4 Size Container 
        Standard A4 is 210mm x 297mm. 
        Using pixel equivalents: roughly 794px x 1123px at 96 DPI.
        We ensure it fills but can scale down in preview.
      */}
      <div 
        id="invoice-capture"
        className="w-full bg-white text-black p-10 mx-auto" 
        style={{ minHeight: '1123px', maxWidth: '794px' }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">{shopDetails.name}</h1>
            <p className="text-sm font-medium mt-1">{shopDetails.address}</p>
            <p className="text-sm font-medium mt-1">Ph: {shopDetails.phone} | Email: {shopDetails.email}</p>
            <p className="text-sm font-bold mt-1 text-slate-700">GSTIN: {shopDetails.gstin}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-200 tracking-widest uppercase mb-2">Invoice</h2>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg inline-block text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No.</p>
              <p className="text-lg font-bold text-slate-900">{sale.invoiceNumber}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Date</p>
              <p className="text-sm font-bold text-slate-900">{invoiceDate}</p>
            </div>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1 inline-block">Bill To</h3>
          <div className="mt-2">
            <p className="text-lg font-bold text-slate-800">{sale.customerId?.name}</p>
            <p className="text-sm font-medium mt-1">Mobile: {sale.customerId?.mobileNumber}</p>
            {sale.customerId?.address && <p className="text-sm font-medium mt-1">{sale.customerId.address}</p>}
            {sale.customerId?.gstNumber && <p className="text-sm font-bold mt-1 text-slate-700">GSTIN: {sale.customerId.gstNumber}</p>}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-2 px-3 font-semibold border border-slate-800 w-10 text-center">#</th>
                <th className="py-2 px-3 font-semibold border border-slate-800">Item Description</th>
                <th className="py-2 px-3 font-semibold border border-slate-800 text-center w-16">Qty</th>
                <th className="py-2 px-3 font-semibold border border-slate-800 text-right w-24">Rate (₹)</th>
                <th className="py-2 px-3 font-semibold border border-slate-800 text-right w-20">GST %</th>
                <th className="py-2 px-3 font-semibold border border-slate-800 text-right w-24">GST (₹)</th>
                <th className="py-2 px-3 font-semibold border border-slate-800 text-right w-32">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className="border-b border-slate-200">
                  <td className="py-3 px-3 border-x border-slate-200 text-center">{index + 1}</td>
                  <td className="py-3 px-3 border-x border-slate-200">
                    <p className="font-bold text-slate-800">{item.productId?.name}</p>
                    <p className="text-xs text-slate-500">{item.productId?.brand}</p>
                  </td>
                  <td className="py-3 px-3 border-x border-slate-200 text-center font-semibold">{item.quantity}</td>
                  <td className="py-3 px-3 border-x border-slate-200 text-right">{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td className="py-3 px-3 border-x border-slate-200 text-right">{item.gstPercentage}%</td>
                  <td className="py-3 px-3 border-x border-slate-200 text-right">{parseFloat(item.gstAmount).toFixed(2)}</td>
                  <td className="py-3 px-3 border-x border-slate-200 text-right font-bold">{parseFloat(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
              {/* Padding rows if items are few */}
              {[...Array(Math.max(0, 10 - (sale.items?.length || 0)))].map((_, i) => (
                <tr key={`pad-${i}`} className="border-b border-slate-200 text-transparent">
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                  <td className="py-3 px-3 border-x border-slate-200">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINANCIAL SUMMARY & QR */}
        <div className="flex justify-between items-start mt-8 border-t-2 border-slate-800 pt-8">
          <div className="flex gap-8">
            <div className="w-32 h-32 border-2 border-slate-200 p-2 rounded-lg flex items-center justify-center">
              <QRCodeSVG value={upiString} size={112} level="H" includeMargin={false} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-800 mb-1">Scan to Pay via UPI</p>
              <p className="text-xs text-slate-500 max-w-xs">Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to clear the balance instantly.</p>
            </div>
          </div>
          
          <div className="w-80 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Sub Total</span>
              <span className="font-bold">₹{parseFloat(sale.subTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Total GST</span>
              <span className="font-bold">₹{parseFloat(sale.totalGst).toFixed(2)}</span>
            </div>
            {parseFloat(sale.totalDiscount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Discount</span>
                <span className="font-bold">- ₹{parseFloat(sale.totalDiscount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg mt-2">
              <span className="font-bold text-lg text-slate-800">Grand Total</span>
              <span className="font-black text-xl text-blue-700">₹{parseFloat(sale.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-700">
              <span className="font-semibold">Amount Paid</span>
              <span className="font-bold">₹{parseFloat(sale.amountPaid).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="font-semibold">Balance Due</span>
              <span className="font-bold">₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER & SIGNATURE */}
        <div className="mt-24 pt-8 border-t border-slate-200 flex justify-between items-end">
          <div className="text-xs text-slate-500">
            <p className="font-bold text-slate-700 mb-1">Terms & Conditions:</p>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. Subject to local jurisdiction.</p>
            <p>3. This is a computer generated invoice.</p>
          </div>
          <div className="text-center w-48">
            <div className="border-b border-slate-400 mb-2 h-16"></div>
            <p className="text-sm font-bold text-slate-800">Authorized Signatory</p>
            <p className="text-xs text-slate-500">For {shopDetails.name}</p>
          </div>
        </div>

      </div>
    </div>
  );
});

export default InvoiceTemplate;
