import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, FileText, CheckCircle, XCircle, Edit } from 'lucide-react';
import purchaseService from '../../services/purchaseService';
import PageHeader from '../../components/common/PageHeader';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await purchaseService.getPurchaseById(id);
        if (response.success) {
          setPurchase(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch purchase details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading purchase details...</div>;
  }

  if (!purchase) {
    return <div className="p-8 text-center text-red-500 font-medium">Purchase not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title={`Purchase Order: ${purchase.purchaseNumber}`} backUrl="/purchases">
        {purchase.status !== 'Cancelled' && (
          <button
            onClick={() => navigate(`/purchases/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors text-sm"
          >
            <Edit size={16} /> Edit Purchase
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: PO Info & Dealer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Order Status</h3>
            <div className="flex items-center gap-4 mb-6">
              {purchase.status === 'Completed' ? (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle size={24} />
                </div>
              )}
              <div>
                <p className={`text-xl font-bold ${purchase.status === 'Completed' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {purchase.status}
                </p>
                <p className="text-slate-500 text-sm font-medium">
                  {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-6 mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Supplier Details</h3>
              <div className="flex items-start gap-3">
                <Truck className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-lg font-bold text-slate-800">{purchase.dealerId?.name || 'Unknown Dealer'}</p>
                  <p className="text-slate-500 font-medium text-sm mt-1">Mobile: {purchase.dealerId?.mobileNumber}</p>
                  {purchase.dealerId?.gstNumber && <p className="text-slate-500 font-medium text-sm">GST: {purchase.dealerId.gstNumber}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Payment Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-300">
                <span>Sub Total</span>
                <span className="font-medium text-white">₹{parseFloat(purchase.subTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Total GST</span>
                <span className="font-medium text-white">₹{parseFloat(purchase.totalGst).toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="text-2xl font-extrabold text-blue-400">₹{parseFloat(purchase.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <FileText className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Order Items Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="pb-4 px-2 w-12">#</th>
                    <th className="pb-4">Product Name</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Unit Price (₹)</th>
                    <th className="pb-4 text-right">GST (₹)</th>
                    <th className="pb-4 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchase.items && purchase.items.length > 0 ? (
                    purchase.items.map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{item.productId?.name || 'Unknown Product'}</p>
                          <p className="text-xs font-medium text-slate-500">{item.productId?.productCode} &bull; {item.productId?.brand}</p>
                        </td>
                        <td className="py-4 text-center font-bold text-slate-700">
                          <span className="px-3 py-1 bg-slate-100 rounded-lg">{item.quantity} {item.productId?.unitType}</span>
                        </td>
                        <td className="py-4 text-right font-medium text-slate-600">{parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td className="py-4 text-right font-medium text-slate-600">{parseFloat(item.gstAmount).toFixed(2)}</td>
                        <td className="py-4 text-right font-bold text-slate-900">{parseFloat(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No items found in this order.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PurchaseDetails;
