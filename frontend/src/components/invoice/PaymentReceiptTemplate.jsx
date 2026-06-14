import React, { forwardRef } from 'react';
import { Building2, Phone, Globe, Mail } from 'lucide-react';

const PaymentReceiptTemplate = forwardRef(({ payment, partyName }, ref) => {
  if (!payment) return null;

  // Mock Shop Details (matching InvoiceTemplate)
  const shopDetails = {
    name: 'ColorWorld Paint',
    address: '45 Industrial Hub, Sector 5\nTech City, Maharashtra 400001\nIndia',
    phone: '+91 98765 43210',
    email: 'billing@colorworld.in',
    website: 'www.colorworld.in',
    gstin: '22AAAAA0000A1Z5'
  };

  const receiptDate = new Date(payment.paymentDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });

  const amount = parseFloat(payment.amount?.$numberDecimal || payment.amount || 0);

  return (
    <div className="bg-[#ffffff]" ref={ref}>
      <div 
        id="receipt-capture"
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
            <h2 className="text-2xl font-normal text-[#1e293b]">Receipt #{payment._id.slice(-6).toUpperCase()}</h2>
            <p className="text-xs text-[#64748b] uppercase tracking-wider mt-1 font-semibold">Payment Receipt</p>
          </div>
        </div>

        {/* INFO SECTION: Party & Dates */}
        <div className="flex justify-between items-end mb-8 text-sm">
          {/* Party Details */}
          <div>
            <h3 className="text-xs font-bold uppercase text-[#1e293b] mb-2 tracking-widest">
              {payment.partyType === 'Customer' ? 'RECEIVED FROM' : 'PAID TO'}
            </h3>
            <p className="font-semibold text-[#1e293b] text-sm">{partyName}</p>
            <p className="text-[#334155] mt-0.5 text-xs">{payment.partyType}</p>
          </div>
          
          {/* Dates & Ref */}
          <div className="text-right">
            <table className="text-xs text-[#334155] ml-auto">
              <tbody>
                <tr>
                  <td className="pr-12 pb-1 text-left">Issue date:</td>
                  <td className="font-semibold text-[#0f172a] text-right pb-1">{receiptDate}</td>
                </tr>
                <tr>
                  <td className="pr-12 text-left">Reference:</td>
                  <td className="font-semibold text-[#0f172a] text-right">{payment.referenceNumber || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* YELLOW SUMMARY BAR */}
        <div className="flex w-full mb-8 text-sm">
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Receipt No</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{payment._id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Date</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{receiptDate}</p>
          </div>
          <div className="bg-[#fbc05c] px-4 py-2.5 flex-1 border-r border-[#ffffff33]">
            <p className="text-[10px] text-[#1e293b] font-semibold mb-0.5 uppercase tracking-wide">Method</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">{payment.paymentMethod}</p>
          </div>
          <div className="bg-[#3b3b3b] px-4 py-2.5 flex-[1.2]">
            <p className="text-[10px] text-[#cbd5e1] font-semibold mb-0.5 uppercase tracking-wide">Amount (₹)</p>
            <p className="text-lg text-[#ffffff] font-normal tracking-wide">₹{amount.toFixed(2)}</p>
          </div>
        </div>

        {/* DETAILS TABLE */}
        <div className="mb-6 border-t-[1.5px] border-[#1e293b]">
          <table className="w-full text-left text-xs border-b-[1.5px] border-[#1e293b]">
            <thead>
              <tr className="border-b-[1.5px] border-[#cbd5e1] text-[#0f172a]">
                <th className="py-2.5 font-bold w-[50%]">Description</th>
                <th className="py-2.5 font-bold text-center">Reference No.</th>
                <th className="py-2.5 font-bold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e2e8f0] last:border-b-0">
                <td className="py-2.5 text-[#1e293b]">
                  <span className="font-semibold">
                    {payment.partyType === 'Customer' ? 'Payment received against outstanding balance' : 'Payment made against pending balance'}
                  </span>
                  {payment.notes && <div className="text-[#64748b] mt-1 italic">Note: {payment.notes}</div>}
                </td>
                <td className="py-2.5 text-center text-[#1e293b]">{payment.referenceNumber || 'N/A'}</td>
                <td className="py-2.5 text-right text-[#1e293b]">{amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS SECTION */}
        <div className="flex justify-end mb-16">
          <div className="w-[45%] text-xs text-[#1e293b]">
            <div className="flex justify-between py-1.5 font-bold text-[#0f172a]">
              <span>Total Paid (₹):</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE AREA */}
        <div className="flex justify-end mb-16">
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#0f172a] mb-1">Authorized Signatory</p>
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

export default PaymentReceiptTemplate;
