import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, Phone, MapPin, FileText } from 'lucide-react';
import dealerService from '../../services/dealerService';
import PageHeader from '../../components/common/PageHeader';
import FinancialWidget from '../../components/common/FinancialWidget';

const DealerDetails = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const response = await dealerService.getDealerById(id);
        if (response.success) {
          setDealer(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dealer details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDealer();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading dealer profile...</div>;
  }

  if (!dealer) {
    return <div className="p-8 text-center text-red-500 font-medium">Dealer not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Dealer Profile" backUrl="/dealers" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-500 absolute top-0 left-0"></div>
            <div className="w-24 h-24 bg-white rounded-full p-1 z-10 mt-6 shadow-lg">
              <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Truck size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">{dealer.name}</h2>
            <p className="text-slate-500 font-medium mt-1">Dealer ID: {dealer._id.substring(dealer._id.length - 6).toUpperCase()}</p>

            <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <Phone className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</p>
                  <p className="text-slate-700 font-medium">{dealer.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">GST Number</p>
                  <p className="text-slate-700 font-medium">{dealer.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-slate-700 font-medium leading-relaxed">{dealer.address || 'No address provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reusable Financial Widget for Pending Balance */}
          <FinancialWidget 
            amount={dealer.pendingBalance}
            title="Pending Balance"
            type="credit" 
            actionText="Clear Payment"
            onActionClick={() => alert('Payment flow will be integrated here')}
          />
        </div>

        {/* Right Column: Purchase History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Supply History</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg">Purchases Module</span>
            </div>
            
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">PO #</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <FileText className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium mb-1">No purchase orders found.</p>
                        <p className="text-slate-400 text-sm">Stock purchases from this dealer will appear here.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDetails;
