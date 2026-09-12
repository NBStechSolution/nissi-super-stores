import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Zap,
  Printer,
  X,
  Navigation,
  ArrowLeft,
  Store,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function DeliveryStaffView() {
  const {
    orders,
    updateOrderStatus,
    verifyAndDeliverOrder,
    setActiveView,
    isAdminOrStaff,
    PAYMENT_CONFIG
  } = useStore();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [printSlipOrder, setPrintSlipOrder] = useState(null);
  const [riderQrOrder, setRiderQrOrder] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrViewMode, setQrViewMode] = useState('dynamic'); // 'dynamic' | 'merchant'

  const activeDeliveries = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedDeliveries = orders.filter((o) => o.status === 'Delivered');

  const playDeliveryChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleDirectDeliver = (orderId, method = 'Doorstep UPI') => {
    verifyAndDeliverOrder(orderId, method);
    playDeliveryChime();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">

      {/* Top Quick Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-paper p-3 rounded-2xl border border-hairline shadow-xs">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 px-3.5 py-2 bg-forest hover:bg-forest/90 text-paper font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Customer Storefront</span>
        </button>

        {isAdminOrStaff && (
          <button
            onClick={() => setActiveView('admin')}
            className="flex items-center gap-1.5 px-3 py-2 bg-cardcream hover:bg-hairline/60 text-ink font-semibold text-xs rounded-xl border border-hairline transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-forest" />
            <span>Switch to Admin Center</span>
          </button>
        )}
      </div>

      {/* Rider Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cardcream p-5 rounded-crate border border-hairline shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest text-paper flex items-center justify-center font-bold text-xl">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-xl text-ink">Delivery Rider Portal</h1>
              <span className="text-[10px] bg-forest text-paper font-bold px-2 py-0.5 rounded-full">
                Rider #1: Raju M.
              </span>
            </div>
            <p className="text-xs text-ink-soft font-sans mt-0.5">
              Assigned Doorstep & 15-Min Emergency Delivery Queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-forest text-paper shadow-xs'
                : 'bg-paper text-ink-soft border border-hairline'
            }`}
          >
            Assigned Orders ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-forest text-paper shadow-xs'
                : 'bg-paper text-ink-soft border border-hairline'
            }`}
          >
            History ({completedDeliveries.length})
          </button>
        </div>
      </div>

      {/* Active Orders List */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeDeliveries.length === 0 ? (
            <div className="bg-cardcream/50 p-8 rounded-crate border border-dashed border-hairline text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="font-serif font-bold text-base text-ink">No pending deliveries right now</h3>
              <p className="text-xs text-ink-soft">All assigned orders have been delivered successfully.</p>
            </div>
          ) : (
            activeDeliveries.map((ord) => (
              <div
                key={ord.id}
                className={`bg-cardcream border rounded-crate p-5 shadow-xs space-y-4 ${
                  ord.isEmergency ? 'border-kumkum/60 ring-2 ring-kumkum/20' : 'border-hairline'
                }`}
              >
                {/* Top Row: Order ID & Emergency Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-ink">#{ord.id}</span>
                    {ord.isEmergency && (
                      <span className="px-2.5 py-0.5 bg-kumkum text-paper rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-paper" /> 15-Min Emergency Priority
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintSlipOrder(ord)}
                      className="p-1.5 bg-paper hover:bg-cardcream border border-hairline rounded-lg text-ink-soft hover:text-ink transition-colors cursor-pointer"
                      title="Print Packing Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-forest" />
                    </button>
                    <span className="px-3 py-1 bg-paper text-forest font-bold rounded-lg border border-hairline text-xs">
                      Status: {ord.status}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Map Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-paper p-3.5 rounded-2xl border border-hairline">
                  <div className="space-y-1">
                    <span className="text-[10px] text-ink-soft font-bold block">CUSTOMER ADDRESS</span>
                    <p className="font-bold text-ink">{ord.customerName || 'Customer'}</p>
                    <p className="text-ink-soft flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                      <span>{ord.address || ''}</span>
                    </p>
                  </div>

                  <div className="flex sm:justify-end items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${(ord.phone || '').replace(/\s+/g, '')}`}
                      className="px-3 py-2 bg-cardcream hover:bg-hairline/60 rounded-xl font-semibold flex items-center gap-1.5 text-ink transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-forest" /> Call
                    </a>
                    <a
                      href={`https://wa.me/91${(ord.phone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${ord.customerName || 'Customer'}! I am your delivery rider from Nissi Super Stores with your order #${ord.id}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-forest/10 hover:bg-forest/20 text-forest font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-forest/30"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(ord.address || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-forest text-paper font-semibold rounded-xl flex items-center gap-1.5 hover:bg-forest-soft transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Maps GPS
                    </a>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs space-y-1">
                  <span className="text-ink-soft font-bold">ITEMS TO DELIVER:</span>
                  <p className="text-ink font-medium">
                    {(ord.items || []).map((i) => `${i.quantity || 1}x ${i.name || 'Item'}${i.unit ? ` (${i.unit})` : ''}`).join(' • ')}
                  </p>
                </div>

                {/* Rider Action Controls & Payment Status */}
                <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    {ord.paymentStatus === 'Paid' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-forest text-paper font-bold text-[10px] rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-saffron-highlight" /> PAID AT DOORSTEP
                        </span>
                        <span className="text-[11px] font-bold text-forest">₹{ord.totalAmount} ✓</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-kumkum text-sm">
                          Collect: ₹{ord.totalAmount}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-paper border border-hairline font-semibold text-ink-soft">
                          {ord.paymentMethod || 'Doorstep UPI'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRiderQrOrder(ord)}
                          className="px-2.5 py-1 bg-saffron-gradient hover:brightness-105 text-ink rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          <QrCode className="w-3 h-3 text-forest" />
                          <span>Show Scanner</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {ord.status === 'Placed' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'Confirmed')}
                        className="px-3.5 py-2 bg-forest text-paper font-bold rounded-xl hover:bg-forest-soft transition-all cursor-pointer"
                      >
                        Accept Order
                      </button>
                    )}
                    {ord.status === 'Confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                        className="px-3.5 py-2 bg-saffron-gradient text-ink font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Start Packing
                      </button>
                    )}
                    {ord.status === 'Preparing' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'Packed')}
                        className="px-3.5 py-2 bg-saffron-gradient text-ink font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Mark Packed
                      </button>
                    )}
                    {ord.status === 'Packed' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'Out for Delivery')}
                        className="px-3.5 py-2 bg-forest text-paper font-bold rounded-xl hover:bg-forest-soft transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" /> Picked Up & Out for Delivery
                      </button>
                    )}
                    {ord.status === 'Out for Delivery' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setRiderQrOrder(ord)}
                          className="px-3.5 py-2 bg-saffron-gradient text-ink font-bold rounded-xl shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <QrCode className="w-4 h-4 text-forest" />
                          <span>📱 Show Store Scanner (₹{ord.totalAmount})</span>
                        </button>
                        <button
                          onClick={() => handleDirectDeliver(ord.id, 'Cash on Delivery')}
                          className="px-3.5 py-2 bg-paper hover:bg-cardcream text-ink font-bold rounded-xl border border-hairline transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                          <span>Cash Received</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed History List */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {completedDeliveries.map((ord) => (
            <div key={ord.id} className="p-4 bg-cardcream border border-hairline rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-ink">#{ord.id}</span>
                <p className="text-ink-soft">{ord.customerName || 'Customer'} • {ord.placedAt || 'Today'}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-forest text-sm">₹{ord.totalAmount}</span>
                <span className="text-forest font-bold block text-[11px]">✓ Handover & Payment Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRINT PACKING SLIP MODAL */}
      {printSlipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-black border border-hairline rounded-2xl p-6 max-w-md w-full font-mono text-xs space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
              <img
                src="/logo.jpeg"
                alt="Nissi Logo"
                className="w-12 h-12 rounded-full mx-auto mb-1.5 object-cover ring-1 ring-gray-300"
              />
              <h2 className="font-bold text-base tracking-wider uppercase">NISSI SUPER STORES</h2>
              <p className="text-[10px] text-gray-600">Rider Delivery Dispatch Slip • Hyderabad</p>
              <p className="text-[10px] font-bold mt-1">ORDER #{printSlipOrder.id} ({printSlipOrder.deliveryType})</p>
            </div>

            <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-gray-400">
              <p><strong>Customer:</strong> {printSlipOrder.customerName || 'Customer'}</p>
              <p><strong>Phone:</strong> {printSlipOrder.phone || ''}</p>
              <p><strong>Address:</strong> {printSlipOrder.address || ''}</p>
              <p><strong>Rider Assigned:</strong> {printSlipOrder.assignedRider || 'Rider #1'}</p>
            </div>

            <div className="space-y-1 py-1 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between font-bold pb-1">
                <span>ITEM</span>
                <span>QTY</span>
              </div>
              {(printSlipOrder.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[220px]">[ ] {it.name || 'Item'}</span>
                  <span>{it.quantity || 1}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-sm">
                <span>COLLECT FROM CUSTOMER:</span>
                <span>₹{printSlipOrder.totalAmount}</span>
              </div>
              <p className="text-[10px] text-gray-600">Payment: {printSlipOrder.paymentMethod || 'COD'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-300 print:hidden font-sans">
              <button
                onClick={() => setPrintSlipOrder(null)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIDER DOORSTEP QR SCANNER MODAL */}
      {riderQrOrder && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-hairline animate-scale-up">
            <button
              type="button"
              onClick={() => setRiderQrOrder(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-cardcream hover:bg-paper text-ink flex items-center justify-center border border-hairline transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-forest/10 text-forest border border-forest/20">
                Doorstep Store QR Scanner
              </span>
              <h3 className="font-serif font-bold text-2xl text-ink mt-1">
                Collect ₹{riderQrOrder.totalAmount}
              </h3>
              <p className="text-xs text-ink-soft">
                Customer: <strong className="text-ink">{riderQrOrder.customerName}</strong> • #{riderQrOrder.id}
              </p>
            </div>

            {/* QR View Mode Toggle */}
            <div className="flex items-center justify-between bg-cardcream p-1 rounded-xl border border-hairline text-xs">
              <button
                type="button"
                onClick={() => setQrViewMode('dynamic')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  qrViewMode === 'dynamic'
                    ? 'bg-forest text-paper shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Dynamic QR (₹{riderQrOrder.totalAmount})
              </button>
              <button
                type="button"
                onClick={() => setQrViewMode('merchant')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  qrViewMode === 'merchant'
                    ? 'bg-forest text-paper shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Official Standee QR
              </button>
            </div>

            {/* High-Contrast QR Code for Outdoor/Doorstep Scanning */}
            <div className="p-3 bg-white rounded-2xl border-2 border-forest/20 flex flex-col items-center justify-center shadow-inner">
              <img
                src={
                  qrViewMode === 'dynamic'
                    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
                        PAYMENT_CONFIG?.generateUpiUri
                          ? PAYMENT_CONFIG.generateUpiUri(riderQrOrder.totalAmount, riderQrOrder.id)
                          : `upi://pay?pa=${PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}&pn=Nissi%20Super%20Stores&am=${riderQrOrder.totalAmount}&cu=INR&tn=Order%20${riderQrOrder.id}`
                      )}`
                    : PAYMENT_CONFIG?.qrCodeUrl || '/payment-qr.jpeg'
                }
                alt="Store Payment QR Code"
                className="w-64 h-64 object-contain rounded-xl"
              />
              <span className="text-[10px] text-ink-soft mt-1.5 font-semibold">
                Customer scans with PhonePe, GPay, Paytm or BHIM
              </span>
            </div>

            {/* Merchant Details & Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 font-mono text-xs font-bold text-forest bg-forest/5 rounded-xl border border-forest/20">
                <span className="truncate">{PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(PAYMENT_CONFIG?.upiId || 'abicharan07@axl');
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-white rounded-lg border border-hairline text-[10px] font-sans font-bold text-ink hover:text-forest transition-colors shrink-0 ml-2 cursor-pointer"
                >
                  {copiedUpi ? 'Copied!' : 'Copy UPI'}
                </button>
              </div>

              {/* 1-Tap UPI Received */}
              <button
                type="button"
                onClick={() => {
                  handleDirectDeliver(riderQrOrder.id, 'Doorstep UPI');
                  setRiderQrOrder(null);
                }}
                className="w-full py-3 bg-forest text-paper font-bold text-xs rounded-xl shadow-md hover:bg-forest-soft transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-saffron-highlight" />
                <span>✓ UPI Payment Received (₹{riderQrOrder.totalAmount}) & Deliver</span>
              </button>

              {/* 1-Tap Cash Received */}
              <button
                type="button"
                onClick={() => {
                  handleDirectDeliver(riderQrOrder.id, 'Cash on Delivery');
                  setRiderQrOrder(null);
                }}
                className="w-full py-2 bg-cardcream hover:bg-hairline/60 text-ink font-bold text-xs rounded-xl border border-hairline transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>💵 Cash Collected (₹{riderQrOrder.totalAmount}) & Deliver</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
