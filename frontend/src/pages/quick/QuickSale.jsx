import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import {
  ScanBarcode, Plus, Minus, Trash2, ShoppingCart,
  RefreshCcw, Play, Square, AlertCircle, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const QuickSale = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ items: [], subTotal: 0, totalGst: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);
  const scannerRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

  useEffect(() => {
    fetchDraft();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchDraft = async () => {
    try {
      const res = await axios.get(`${baseUrl}/drafts`, { withCredentials: true });
      if (res.data.success) {
        setDraft(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (e) { console.log(e); }
  };

  const handleScan = async (decodedText) => {
    if (loading || pendingProduct) return; // Prevent multiple scans while processing
    setLoading(true);
    setScanError(null);
    try {
      const res = await axios.post(`${baseUrl}/drafts/scan`, { code: decodedText, lookupOnly: true }, { withCredentials: true });
      if (res.data.success) {
        if (scannerRef.current) scannerRef.current.pause(true);
        playSuccessSound();
        setPendingProduct(res.data.data);
      }
    } catch (err) {
      setScanError(`Product not found for code: ${decodedText}`);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Error vibration
    } finally {
      setLoading(false);
    }
  };

  const confirmAddProduct = async () => {
    if (!pendingProduct) return;
    setLoading(true);
    try {
      // Add the product for real this time
      const res = await axios.post(`${baseUrl}/drafts/scan`, { code: pendingProduct.productCode }, { withCredentials: true });
      if (res.data.success) {
        setDraft(res.data.data);
      }
    } catch (err) {
      setScanError("Failed to add product to draft");
    } finally {
      setPendingProduct(null);
      setLoading(false);
      if (scannerRef.current) scannerRef.current.resume();
    }
  };

  const cancelAddProduct = () => {
    setPendingProduct(null);
    if (scannerRef.current) scannerRef.current.resume();
  };

  const startScanner = () => {
    setScanning(true);
    setScanError(null);
  };

  const stopScanner = () => {
    setScanning(false);
  };

  useEffect(() => {
    let html5QrCode;

    if (scanning) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScanError("Camera access is not supported. Please use HTTPS or localhost.");
        setScanning(false);
        return;
      }

      html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 30, qrbox: { width: 250, height: 250 } },
        handleScan,
        undefined
      ).catch(err => {
        setScanError("Camera Error: " + (err?.message || err));
        setScanning(false);
      });
    }

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Scanner cleanup error:", err));
      }
    };
  }, [scanning]);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const res = await axios.put(`${baseUrl}/drafts/item/${itemId}`, { quantity: newQuantity }, { withCredentials: true });
      if (res.data.success) setDraft(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await axios.delete(`${baseUrl}/drafts/item/${itemId}`, { withCredentials: true });
      if (res.data.success) setDraft(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearDraft = async () => {
    if (!window.confirm("Are you sure you want to clear the draft?")) return;
    try {
      const res = await axios.delete(`${baseUrl}/drafts/clear`, { withCredentials: true });
      if (res.data.success) setDraft(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const proceedToInvoice = () => {
    // Navigate to Sale form with draft items. 
    navigate('/sales/new', { state: { draft: draft } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Quick Scan & Sale"
        subtitle="Quickly build a sales invoice by scanning product barcodes or QR codes."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Scanner */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ScanBarcode className="text-blue-600" /> Barcode / QR Scanner
            </h3>

            <div className={scanning ? "hidden" : "block"}>
              <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                <ScanBarcode size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-6 font-medium">Click below to open the camera and start scanning products.</p>
                <button
                  onClick={startScanner}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto w-full max-w-[200px]"
                >
                  <Play size={18} /> Start Scanner
                </button>
              </div>
            </div>

            <div className={scanning ? "block space-y-4" : "hidden"}>
              <div id="reader" className="w-full bg-black rounded-xl overflow-hidden shadow-inner min-h-[300px]"></div>
              <button
                onClick={stopScanner}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 w-full border border-red-200"
              >
                <Square size={18} /> Stop Scanner
              </button>
            </div>

            {scanError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100 animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{scanError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Draft Items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" /> Current Sales Draft
              </h3>
              {draft.items.length > 0 && (
                <button
                  onClick={clearDraft}
                  className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                >
                  <RefreshCcw size={16} /> Clear Draft
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-0">
              {draft.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                  <ShoppingCart size={48} className="mb-4 text-slate-300" />
                  <p className="font-medium text-slate-500">Your draft is empty.</p>
                  <p className="text-sm">Scan a product to add it to the draft.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold min-w-[200px]">Product</th>
                      <th className="px-4 py-3 font-semibold w-32 text-center min-w-[120px]">Qty</th>
                      <th className="px-4 py-3 font-semibold text-right min-w-[100px]">Price</th>
                      <th className="px-4 py-3 font-semibold text-right min-w-[80px]">GST</th>
                      <th className="px-4 py-3 font-semibold text-right min-w-[100px]">Total</th>
                      <th className="px-4 py-3 font-semibold text-center w-16">Act</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {draft.items.map((item, index) => (
                      <tr key={item._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {item.productId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center bg-white border border-slate-200 rounded-lg overflow-hidden w-full max-w-[100px] mx-auto shadow-sm">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                              className="w-10 text-center font-bold text-slate-800 focus:outline-none focus:bg-blue-50 py-1"
                              min="1"
                            />
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-green-600 transition-colors"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">₹{parseFloat(item.unitPrice).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-slate-700">₹{parseFloat(item.gstAmount).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-0.5">{item.gstPercentage}%</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">₹{parseFloat(item.totalPrice).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors mx-auto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Draft Summary Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Items</p>
                    <p className="text-xl font-black text-slate-800">{draft.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subtotal</p>
                    <p className="text-xl font-black text-slate-800">₹{(draft.subTotal || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tax (GST)</p>
                    <p className="text-xl font-black text-slate-800">₹{(draft.totalGst || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grand Total</p>
                    <p className="text-2xl font-black text-blue-600">₹{(draft.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    disabled={draft.items.length === 0}
                    className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Draft
                  </button>
                  <button
                    onClick={proceedToInvoice}
                    disabled={draft.items.length === 0}
                    className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {pendingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <ScanBarcode size={32} />
              </div>
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Product Found</h2>
              <p className="text-center text-slate-500 mb-6">Do you want to add this product to the draft?</p>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <div className="text-center">
                  <div className="font-bold text-lg text-slate-800">{pendingProduct.name}</div>
                  <div className="text-sm font-mono text-slate-500 mt-1">{pendingProduct.productCode}</div>
                </div>
                <div className="mt-4 flex justify-between items-center px-4 py-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-500 font-medium">Price</span>
                  <span className="font-bold text-blue-600">₹{parseFloat(pendingProduct.sellingPrice || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelAddProduct}
                  className="flex-1 px-4 py-3 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddProduct}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSale;
