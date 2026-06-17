import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, Phone, MapPin, FileText } from 'lucide-react';
import dealerService from '../../services/dealerService';
import PageHeader from '../../components/common/PageHeader';
import FinancialWidget from '../../components/common/FinancialWidget';
import PaymentModal from '../../components/common/PaymentModal';
import PaymentHistory from '../../components/common/PaymentHistory';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import paymentService from '../../services/paymentService';
import purchaseService from '../../services/purchaseService';

const DealerDetails = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // stores payment ID
  const [activeTab, setActiveTab] = useState('supplies');

  const fetchDealer = async () => {
      try {
        const [dealerRes, paymentsRes, purchasesRes] = await Promise.all([
          dealerService.getDealerById(id),
          paymentService.getPaymentsByParty('Dealer', id),
          purchaseService.getPurchases({ dealerId: id, limit: 100 })
        ]);
        
        if (dealerRes.success) {
          setDealer(dealerRes.data);
        }
        if (paymentsRes && paymentsRes.success) {
          setPayments(paymentsRes.data);
        }
        if (purchasesRes && purchasesRes.success) {
          setPurchases(purchasesRes.data.purchases);
        }
      } catch (error) {
        console.error('Failed to fetch dealer details', error);
      } finally {
        setLoading(false);
      }
    };

  const confirmDeletePayment = async () => {
    if (!deleteConfirmation) return;
    try {
      const res = await paymentService.deletePayment(deleteConfirmation);
      if (res.success) {
        fetchDealer();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmation(null);
    }
  };
  
  useEffect(() => {
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
        {/* Left Column: Profile Card & Finances */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full h-20 bg-gradient-to-r from-blue-600 to-cyan-500 absolute top-0 left-0"></div>
            <div className="w-20 h-20 bg-white rounded-full p-1 z-10 mt-2 shadow-sm">
              <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Truck size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-3">{dealer.name}</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">ID: {dealer._id.substring(dealer._id.length - 6).toUpperCase()}</p>

            <div className="w-full border-t border-slate-100 mt-4 pt-4 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Phone className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</p>
                  <p className="text-slate-700 text-sm font-medium">{dealer.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">GST Number</p>
                  <p className="text-slate-700 text-sm font-medium">{dealer.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-slate-700 text-sm font-medium leading-snug">{dealer.address || 'No address provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reusable Financial Widget for Pending Balance - Kept below but Profile Card is now compacted */}
          <FinancialWidget 
            amount={dealer.pendingBalance}
            title="Pending Balance"
            type="credit" 
            actionText="Clear Payment"
            onActionClick={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }}
          />
        </div>

        {/* Right Column: History Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
            <div className="flex space-x-6 border-b border-slate-100 mb-6">
              <button
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'supplies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('supplies')}
              >
                Supply History
              </button>
              <button
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('payments')}
              >
                Payment History
              </button>
            </div>
            
            {activeTab === 'supplies' ? (
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
                    {purchases && purchases.length > 0 ? (
                      purchases.map(purchase => (
                        <tr key={purchase._id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/purchases/${purchase._id}`, { state: { from: `/dealers/${dealer._id}` } })}>
                          <td className="px-6 py-4 font-bold text-slate-900">{purchase.purchaseNumber}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">₹{parseFloat(purchase.totalAmount).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {purchase.status === 'Completed' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">Completed</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
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
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <PaymentHistory 
                payments={payments}
                partyName={dealer.name}
                onEditClick={(payment) => {
                  setEditingPayment(payment);
                  setIsPaymentModalOpen(true);
                }}
                onDeleteClick={(id) => setDeleteConfirmation(id)}
              />
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setEditingPayment(null); }}
        partyType="Dealer"
        partyId={dealer._id}
        partyName={dealer.name}
        onPaymentSuccess={fetchDealer}
        editingPayment={editingPayment}
        currentBalance={parseFloat(dealer.pendingBalance?.$numberDecimal || dealer.pendingBalance || 0)}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDeletePayment}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? The dealer's pending balance will be mathematically reversed."
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default DealerDetails;
