import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, FileText } from 'lucide-react';
import customerService from '../../services/customerService';
import PageHeader from '../../components/common/PageHeader';
import FinancialWidget from '../../components/common/FinancialWidget';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await customerService.getCustomerById(id);
        if (response.success) {
          setCustomer(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch customer details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

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
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0"></div>
            <div className="w-24 h-24 bg-white rounded-full p-1 z-10 mt-6 shadow-lg">
              <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <User size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">{customer.name}</h2>
            <p className="text-slate-500 font-medium mt-1">Customer ID: {customer._id.substring(customer._id.length - 6).toUpperCase()}</p>

            <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <Phone className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</p>
                  <p className="text-slate-700 font-medium">{customer.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">GST Number</p>
                  <p className="text-slate-700 font-medium">{customer.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-slate-700 font-medium leading-relaxed">{customer.address || 'No address provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reusable Financial Widget */}
          <FinancialWidget 
            amount={customer.outstandingBalance}
            title="Outstanding Balance"
            type="debt" 
            actionText="Record Payment"
            onActionClick={() => alert('Payment flow will be integrated here')}
          />
        </div>

        {/* Right Column: Purchase History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Purchase History</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg">Sales Module</span>
            </div>
            
            {/* Mock Table since Sales module isn't built yet */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
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
                        <p className="text-slate-500 font-medium mb-1">No purchase history yet.</p>
                        <p className="text-slate-400 text-sm">Once sales are recorded, they will appear here.</p>
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

export default CustomerDetails;
