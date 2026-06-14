import React, { forwardRef } from 'react';
import { Building2, Phone, Globe, Mail } from 'lucide-react';

const InvoiceTemplate = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  // Mock Shop Details
  const shopDetails = {
    name: 'ColorWorld Paint',
    address: '45 Industrial Hub, Sector 5\nTech City, Maharashtra 400001\nIndia',
    phone: '+91 98765 43210',
    email: 'billing@colorworld.in',
    website: 'www.colorworld.in',
    gstin: '22AAAAA0000A1Z5'
  };

  const invoiceDate = new Date(sale.saleDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });

  // Calculate totals
  const totalAmount = parseFloat(sale.totalAmount) || 0;
  const amountPaid = parseFloat(sale.amountPaid) || 0;
  const balanceDue = totalAmount - amountPaid;

  return (
    <div className="bg-[#ffffff]" ref={ref}>
      <div 
        id="invoice-capture"
        className="bg-[#ffffff] text-[#0f172a] mx-auto font-sans relative" 
        style={{ minHeight: '1123px', width: '794px', padding: '40px 48px' }}
      >
        {/* HEADER: Logo & Title */}
        <div className="flex justify-between items-start mb-12">
          {/* Logo Area */}
          <div className="flex flex-col items-center">
            <Building2 size={48} className="text-[#eab308] mb-1" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-[#1e293b] leading-tight text-center">Your Business<br/>Name</h1>
          </div>
          {/* Title Area */}
          <div className="text-right mt-2">
            <h2 className="text-2xl font-normal text-[#1e293b]">Invoice {sale.invoiceNumber}</h2>
            <p className="text-xs text-[#64748b] uppercase tracking-wider mt-1 font-semibold">Tax invoice</p>
          </div>
        </div>

        {/* INFO SECTION: Bill To & Dates */}
        <div className="flex justify-between items-end mb-8 text-sm">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-bold uppercase text-[#1e293b] mb-2 tracking-widest">BILL TO</h3>
            <p className="font-semibold text-[#1e293b] text-sm">{sale.customerId?.name || sale.customerName || 'Miscellaneous Customer'}</p>
            {sale.customerId?.address ? (
              <p className="text-[#334155] whitespace-pre-wrap mt-0.5 text-xs">{sale.customerId.address}</p>
            ) : (
              <p className="text-[#334155] whitespace-pre-wrap mt-0.5 text-xs">Walk-in Customer</p>
            )}
            {sale.customerId?.mobileNumber && <p className="text-[#334155] mt-0.5 text-xs">Mobile: {sale.customerId.mobileNumber}</p>}
            {sale.customerId?.gstNumber && <p className="text-[#334155] mt-0.5 text-xs">GST: {sale.customerId.gstNumber}</p>}
          </div>
          
          {/* Dates & Ref */}
          <div className="text-right">
            <table className="text-xs text-[#334155] ml-auto">
              <tbody>
                <tr>
                  <td className="pr-12 pb-1 text-left">Issue date:</td>
                  <td className="font-semibold text-[#0f172a] text-right pb-1">{invoiceDate}</td>
                </tr>
                <tr>
                  <td className="pr-12 pb-1 text-left">Due date:</td>
                  <td className="font-semibold text-[#0f172a] text-right pb-1">{invoiceDate}</td>
                </tr>
                <tr>
                  <td className="pr-12 text-left">Reference:</td>
                  <td className="font-semibold text-[#0f172a] text-right">{sale.invoiceNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* YELLOW SUMMARY BAR */}
        <div className="flex w-full mb-8 text-sm">
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Invoice No</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{sale.invoiceNumber}</p>
          </div>
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Issue date</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{invoiceDate}</p>
          </div>
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Due date</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{invoiceDate}</p>
          </div>
          <div className="bg-[#3b3b3b] px-4 py-2.5 flex-[1.2]">
            <p className="text-[10px] text-[#cbd5e1] font-semibold mb-0.5 uppercase tracking-wide">Total due (₹)</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">₹{balanceDue > 0 ? balanceDue.toFixed(2) : '0.00'}</p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-6 border-t-[1.5px] border-[#1e293b]">
          <table className="w-full text-left text-xs border-b-[1.5px] border-[#1e293b]">
            <thead>
              <tr className="border-b-[1.5px] border-[#cbd5e1] text-[#0f172a]">
                <th className="py-2.5 font-bold w-12 text-left">Sr No</th>
                <th className="py-2.5 font-bold w-[40%]">Description</th>
                <th className="py-2.5 font-bold text-center">Quantity</th>
                <th className="py-2.5 font-bold text-right">Unit price (₹)</th>
                <th className="py-2.5 font-bold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className="border-b border-[#e2e8f0] last:border-b-0">
                  <td className="py-2.5 text-left text-[#1e293b] font-medium">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2.5 text-[#1e293b]">
                    <span className="font-semibold">{item.productId?.name}</span>
                    {item.productId?.brand && <span className="text-[#64748b] ml-1">({item.productId.brand})</span>}
                  </td>
                  <td className="py-2.5 text-center text-[#1e293b]">{item.quantity}</td>
                  <td className="py-2.5 text-right text-[#1e293b]">{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td className="py-2.5 text-right text-[#1e293b]">{parseFloat(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS SECTION */}
        <div className="flex justify-end mb-16">
          <div className="w-[45%] text-xs text-[#1e293b]">
            <div className="flex justify-between py-1">
              <span className="font-semibold">Subtotal:</span>
              <span>₹{parseFloat(sale.subTotal).toFixed(2)}</span>
            </div>
            {/* Break down GST for display purposes based on items if possible, else just show total */}
            <div className="flex justify-between py-1">
              <span>Total GST:</span>
              <span>₹{parseFloat(sale.totalGst).toFixed(2)}</span>
            </div>
            {parseFloat(sale.totalDiscount) > 0 && (
              <div className="flex justify-between py-1 text-[#1e293b]">
                <span>Discount applied:</span>
                <span>- ₹{parseFloat(sale.totalDiscount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 font-bold text-[#0f172a]">
              <span>Total (₹):</span>
              <span>₹{parseFloat(sale.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE AREA */}
        <div className="flex justify-end mb-16">
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#0f172a] mb-1">Issued by, signature</p>
            {/* SVG Signature mimicking a handwritten signature */}
            <div className="h-20 w-48 relative flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" className="h-full w-full text-[#1e293b] fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 45 c-10-20 -5-35 5-35 c15 0 25 20 10 35 c-5 5 -20-5 -10-20 c15-15 35-5 45 10 c10 15 30 20 40 5 c10-15-5-30 5-30 c15 0 20 15 10 30 c-10 15 15 20 30 5 c15-15 35-20 50-5" />
              </svg>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-10 left-12 right-12">
          <div className="flex justify-between items-center text-[10px] text-[#1e293b] border-b border-[#cbd5e1] pb-2 mb-2 font-medium">
            <div className="flex items-center gap-1.5">
              <Phone size={11} strokeWidth={2.5} /> {shopDetails.phone}
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={11} strokeWidth={2.5} /> {shopDetails.website}
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={11} strokeWidth={2.5} /> {shopDetails.email}
            </div>
          </div>
          <div className="text-[10px] text-[#475569] leading-tight">
            <p className="font-bold text-[#1e293b] mb-0.5">{shopDetails.name}</p>
            <p className="whitespace-pre-wrap">{shopDetails.address}</p>
          </div>
        </div>

      </div>
    </div>
  );
});

export default InvoiceTemplate;
