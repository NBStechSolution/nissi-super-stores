import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Zap,
  Play,
  Printer,
  XCircle,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  QrCode,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const TIMELINE_STEPS = [
  { id: 'Placed', label: 'Order Placed', time: '10:14 AM', icon: '📝' },
  { id: 'Confirmed', label: 'Confirmed', time: '10:15 AM', icon: '✅' },
  { id: 'Preparing', label: 'Preparing', time: '10:17 AM', icon: '🧺' },
  { id: 'Packed', label: 'Packed', time: '10:20 AM', icon: '📦' },
  { id: 'Out for Delivery', label: 'Out for Delivery', time: '10:22 AM', icon: '🛵' },
  { id: 'Delivered', label: 'Delivered', time: '10:29 AM', icon: '🏠' }
];

export default function OrderTrackingView() {
  const {
    activeOrder,
    updateOrderStatus,
    updateOrderPaymentStatus,
    orders,
    setActiveOrderId,
    addToCart,
    setIsCartOpen,
    PAYMENT_CONFIG
  } = useStore();
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isPayQrOpen, setIsPayQrOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrMode, setQrMode] = useState('dynamic'); // 'dynamic' | 'merchant'

  const currentStatus = activeOrder ? activeOrder.status : 'Placed';
  const isCancelled = currentStatus === 'Cancelled';

  const activeStepIndex = isCancelled
    ? -1
    : TIMELINE_STEPS.findIndex((s) => s.id === currentStatus);

  const calculateProgressPercent = () => {
    if (isCancelled) return 0;
    if (activeStepIndex === -1) return 0;
    return (activeStepIndex / (TIMELINE_STEPS.length - 1)) * 100;
  };

  const handleNextStep = () => {
    if (isCancelled) {
      updateOrderStatus(activeOrder.id, 'Placed');
      return;
    }
    const nextIdx = (activeStepIndex + 1) % TIMELINE_STEPS.length;
    updateOrderStatus(activeOrder.id, TIMELINE_STEPS[nextIdx].id);
  };

  // Only allow cancellation during initial prep stages (Placed, Confirmed, Preparing)
  const canCancelOrder = !isCancelled && activeStepIndex >= 0 && activeStepIndex <= 2;

  const handleCancelOrder = () => {
    if (!canCancelOrder) return;
    updateOrderStatus(activeOrder.id, 'Cancelled');
  };

  const handleReorderItems = () => {
    if (!activeOrder?.items?.length) return;
    activeOrder.items.forEach((item) => {
      addToCart(item, item.quantity || 1);
    });
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">

      {/* Header & Order Selector Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cardcream p-5 rounded-crate border border-hairline shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-ink">Order #{activeOrder.id}</h1>
            {activeOrder.isEmergency && (
              <span className="px-2.5 py-0.5 bg-kumkum text-paper rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 fill-paper" /> 15-Min Emergency
              </span>
            )}
          </div>
          <p className="text-xs text-ink-soft font-sans mt-0.5">
            Placed on {activeOrder.placedAt} • Delivery Slot: <span className="font-semibold text-forest">{activeOrder.deliveryWindow}</span>
          </p>
        </div>

        {/* Switch Order Dropdown & Reorder button */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-ink-soft font-medium">Switch Order:</label>
          <select
            value={activeOrder.id}
            onChange={(e) => setActiveOrderId(e.target.value)}
            className="px-3 py-1.5 bg-paper rounded-xl border border-hairline text-xs font-semibold text-ink focus:outline-none max-w-xs truncate"
          >
            {orders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                #{ord.id} • {ord.status} • ₹{ord.totalAmount}
              </option>
            ))}
          </select>

          <button
            onClick={handleReorderItems}
            className="px-3 py-1.5 bg-forest text-paper hover:bg-forest-soft rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            title="Add all items from this order back to basket"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-order</span>
          </button>
        </div>
      </div>

      {/* Interactive Timeline Step Simulator Control Bar */}
      <div className="bg-forest/10 border border-forest/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-forest">Live Status Simulator:</span>
          <span className="px-2.5 py-1 bg-paper text-ink rounded-lg font-mono font-semibold border border-hairline">
            Current: {currentStatus}
          </span>
          <span className="text-[11px] text-ink-soft hidden md:inline">
            • Expected: {activeOrder.isEmergency ? '15 mins from dispatch' : activeOrder.deliveryWindow}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextStep}
            className="px-3.5 py-1.5 bg-forest hover:bg-forest-soft text-paper rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-paper" />
            <span>Advance Status</span>
          </button>
          {!isCancelled && (
            <button
              onClick={handleCancelOrder}
              disabled={!canCancelOrder}
              title={
                canCancelOrder
                  ? 'Cancel order before packing starts'
                  : 'Cannot cancel once order is packed or out for delivery'
              }
              className={`px-3.5 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1 ${
                canCancelOrder
                  ? 'bg-kumkum/10 hover:bg-kumkum/20 text-kumkum border-kumkum/30 cursor-pointer active:scale-95'
                  : 'bg-paper text-ink-soft/40 border-hairline cursor-not-allowed opacity-60'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{canCancelOrder ? 'Cancel Order' : 'Cannot Cancel (Packed)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Horizontal Timeline Card */}
      <div className="bg-cardcream border border-hairline rounded-crate p-6 sm:p-8 shadow-md space-y-8">

        {!isCancelled ? (
          <div className="relative pt-4 pb-2">
            <div className="absolute top-8 left-6 right-6 h-1.5 bg-hairline/70 rounded-full" />

            <motion.div
              className="absolute top-8 left-6 h-1.5 bg-forest rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${calculateProgressPercent()}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            <div className="relative z-10 flex items-center justify-between">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = index <= activeStepIndex;
                const isCurrent = index === activeStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center max-w-[80px]">
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.2 : 1,
                        boxShadow: isCurrent ? '0 0 16px rgba(18, 48, 39, 0.4)' : 'none'
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                        isCompleted
                          ? 'bg-forest text-paper border-forest'
                          : 'bg-paper text-ink-soft/40 border-hairline'
                      }`}
                    >
                      {isCompleted ? step.icon : index + 1}
                    </motion.div>
                    <span
                      className={`text-[11px] font-semibold mt-2.5 leading-tight ${
                        isCurrent
                          ? 'text-forest font-bold'
                          : isCompleted
                          ? 'text-ink'
                          : 'text-ink-soft/40'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-ink-soft/60 font-mono mt-0.5">
                      {step.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-kumkum/10 border border-kumkum/30 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-kumkum text-paper rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h3 className="font-serif font-bold text-lg text-kumkum">Order Cancelled & Full Refund Initiated</h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              This order was cancelled. 100% refund has been processed back to your original payment source within 15 minutes per Nissi Guarantee.
            </p>
            <button
              onClick={() => updateOrderStatus(activeOrder.id, 'Placed')}
              className="px-4 py-2 bg-kumkum text-paper rounded-xl text-xs font-bold hover:bg-kumkum/90"
            >
              Reactivate Order Demo
            </button>
          </div>
        )}

        {/* Active Order Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-hairline">

          {/* Delivery & Address Info */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif font-semibold text-sm text-ink flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest" />
              <span>Delivery Details</span>
            </h3>
            <div className="p-3.5 bg-paper rounded-xl border border-hairline space-y-1.5">
              <p className="font-bold text-ink">{activeOrder.customerName}</p>
              <p className="text-ink-soft">{activeOrder.address}</p>
              <p className="text-ink-soft/70 font-mono">{activeOrder.phone}</p>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif font-semibold text-sm text-ink flex items-center justify-between">
              <span>Items in this Order ({activeOrder.items.length})</span>
              <span className="font-mono font-bold text-forest">₹{activeOrder.totalAmount}</span>
            </h3>
            <div className="p-3.5 bg-paper rounded-xl border border-hairline space-y-2">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-ink-soft">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-mono font-semibold text-ink">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between items-center text-forest font-semibold">
                  <span>Coupon Discount ({activeOrder.appliedCoupon})</span>
                  <span>-₹{activeOrder.discountAmount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-hairline/50 flex justify-between font-bold text-forest">
                <span>Delivery Charge</span>
                <span>{activeOrder.deliveryFee && activeOrder.deliveryFee > 0 ? `+₹${activeOrder.deliveryFee}` : '₹0 (FREE)'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Order Payment Status Card */}
      <div className="p-5 bg-cardcream border border-hairline rounded-crate shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-forest/10 text-forest rounded-xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-ink">Payment Information</h3>
                {activeOrder.paymentStatus === 'Paid' ? (
                  <span className="px-2 py-0.5 bg-forest text-paper text-[10px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Paid Online
                  </span>
                ) : activeOrder.paymentStatus === 'Pending Verification' ? (
                  <span className="px-2 py-0.5 bg-saffron-base/30 text-ink text-[10px] font-bold rounded-full border border-saffron-base">
                    Verification Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-paper text-ink-soft text-[10px] font-bold rounded-full border border-hairline">
                    Pay on Delivery
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                Mode: <strong className="text-ink">{activeOrder.paymentMethod || 'COD'}</strong> • Total: <strong className="text-forest font-mono">₹{activeOrder.totalAmount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPayQrOpen(true)}
              className="px-3 py-1.5 bg-paper hover:bg-cardcream text-forest font-bold text-xs rounded-xl border border-forest/30 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{activeOrder.paymentStatus === 'Paid' ? 'View QR Receipt' : 'Pay Online via QR'}</span>
            </button>
          </div>
        </div>

        {/* Payment Sub-details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-paper rounded-xl border border-hairline">
            <span className="text-[10px] text-ink-soft block font-medium">BENEFICIARY UPI ID</span>
            <span className="font-mono font-bold text-forest text-xs">{activeOrder.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}</span>
          </div>

          <div className="p-2.5 bg-paper rounded-xl border border-hairline">
            <span className="text-[10px] text-ink-soft block font-medium">TRANSACTION UTR / REF</span>
            <span className="font-mono font-bold text-ink text-xs">
              {activeOrder.utr ? activeOrder.utr : activeOrder.paymentStatus === 'Paid' ? 'Confirmed by Customer' : 'Pay at Doorstep'}
            </span>
          </div>

          <div className="p-2.5 bg-paper rounded-xl border border-hairline flex items-center justify-between">
            <div>
              <span className="text-[10px] text-ink-soft block font-medium">RECEIPT PROOF</span>
              <span className="text-xs font-semibold text-ink">
                {activeOrder.paymentProof ? 'Attached ✓' : 'Direct Digital'}
              </span>
            </div>
            {activeOrder.paymentProof && (
              <img
                src={activeOrder.paymentProof}
                alt="Receipt Proof"
                className="w-8 h-8 rounded-lg object-cover border border-hairline cursor-pointer"
                onClick={() => setIsPayQrOpen(true)}
                title="Click to view"
              />
            )}
          </div>
        </div>
      </div>

      {/* Handover OTP Card */}
      {!isCancelled && (
        <div className="p-5 bg-cardcream border border-hairline rounded-crate flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-forest/10 text-forest rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-ink">Delivery Handover PIN</h3>
                {currentStatus === 'Delivered' ? (
                  <span className="px-2 py-0.5 bg-forest/10 text-forest text-[10px] font-bold rounded-full">
                    ✓ Handover Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-saffron-base/20 text-saffron-base text-[10px] font-bold rounded-full">
                    Share with Rider
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                {currentStatus === 'Delivered'
                  ? 'Delivery confirmed at your doorstep with verified handover PIN.'
                  : 'Please share this 4-digit security PIN with the delivery rider to confirm receipt.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono font-bold text-lg bg-paper px-3 py-2 rounded-xl border border-hairline tracking-widest text-forest shadow-xs">
              {(activeOrder.deliveryOtp || '4829').split('').map((char, i) => (
                <span key={i} className="w-7 h-8 bg-cardcream rounded-lg flex items-center justify-center border border-hairline shadow-inner">
                  {char}
                </span>
              ))}
            </div>

            <button
              onClick={() => setIsPrintOpen(true)}
              className="px-3 py-2 bg-paper hover:bg-cardcream text-ink border border-hairline rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Print Order Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-forest" />
              <span>Bill</span>
            </button>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {isPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-black border border-hairline rounded-2xl p-6 max-w-md w-full font-mono text-xs space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
              <img
                src="/logo.jpeg"
                alt="Nissi Logo"
                className="w-12 h-12 rounded-full mx-auto mb-1.5 object-cover ring-1 ring-gray-300"
              />
              <h2 className="font-bold text-base tracking-wider uppercase">NISSI SUPER STORES</h2>
              <p className="text-[10px] text-gray-600">Kirana at Delivery Speed • Hyderabad</p>
              <p className="text-[9px] text-gray-500">GSTIN: 36AABCN1234F1Z8 • FSSAI: 13622011000452</p>
              <p className="text-[10px] font-bold mt-1">ORDER #{activeOrder.id} ({activeOrder.deliveryType})</p>
            </div>

            <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-gray-400">
              <p><strong>Customer:</strong> {activeOrder.customerName}</p>
              <p><strong>Phone:</strong> {activeOrder.phone}</p>
              <p><strong>Address:</strong> {activeOrder.address}</p>
              <p><strong>Placed:</strong> {activeOrder.placedAt}</p>
              <p className="text-forest font-bold"><strong>DELIVERY OTP:</strong> {activeOrder.deliveryOtp || '4829'}</p>
            </div>

            <div className="space-y-1 py-1 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between font-bold pb-1">
                <span>ITEM</span>
                <span>AMT</span>
              </div>
              {activeOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[220px]">{it.quantity}x {it.name}</span>
                  <span>₹{it.quantity * it.price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount:</span>
                  <span>-₹{activeOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{activeOrder.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-400">
                <span>TOTAL PAYABLE:</span>
                <span>₹{activeOrder.totalAmount}</span>
              </div>
              <div className="text-[10px] text-gray-600 space-y-0.5 pt-0.5">
                <p>Payment: {activeOrder.paymentMethod || 'COD'}</p>
                <p>Status: {activeOrder.paymentStatus === 'Paid' ? 'PAID ONLINE (VERIFIED)' : activeOrder.paymentStatus === 'Pending Verification' ? 'PENDING VERIFICATION' : 'UNPAID / CASH ON DELIVERY'}</p>
                {activeOrder.utr && <p>UTR / Ref: {activeOrder.utr}</p>}
                <p>UPI Payee: {activeOrder.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}</p>
              </div>
            </div>

            <div className="text-center pt-2 space-y-1">
              <div className="flex justify-center items-end h-8 gap-0.5">
                {[4, 2, 6, 3, 8, 2, 5, 2, 7, 3, 5, 2, 8, 3, 6, 2, 4, 3, 7, 2, 5, 4, 6].map((h, i) => (
                  <div key={i} className="bg-black w-1" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="text-[9px] text-gray-500 tracking-widest font-mono">*{activeOrder.id}*</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-300 print:hidden font-sans">
              <button
                onClick={() => setIsPrintOpen(false)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING VIEW QR PAYMENT MODAL */}
      {isPayQrOpen && (
        <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-hairline animate-scale-up">
            <button
              type="button"
              onClick={() => setIsPayQrOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-cardcream hover:bg-paper text-ink flex items-center justify-center border border-hairline transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-forest/10 text-forest border border-forest/20">
                {qrMode === 'dynamic' ? 'Dynamic Amount QR' : 'Official PhonePe Standee'}
              </span>
              <h3 className="font-serif font-bold text-lg text-ink mt-1">
                {activeOrder.paymentStatus === 'Paid' ? 'Payment Verified' : `Scan & Pay ₹${activeOrder.totalAmount}`}
              </h3>
              <p className="text-xs text-ink-soft">Order #{activeOrder.id} • {activeOrder.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}</p>
            </div>

            {/* QR View Mode Toggle */}
            <div className="flex items-center justify-between bg-cardcream p-1 rounded-xl border border-hairline text-xs">
              <button
                type="button"
                onClick={() => setQrMode('dynamic')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] transition-all ${
                  qrMode === 'dynamic' ? 'bg-forest text-paper shadow-2xs' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Auto-Amount QR
              </button>
              <button
                type="button"
                onClick={() => setQrMode('merchant')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] transition-all ${
                  qrMode === 'merchant' ? 'bg-forest text-paper shadow-2xs' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Official Standee
              </button>
            </div>

            <div className="p-3 bg-cardcream/50 rounded-2xl border border-hairline flex items-center justify-center">
              {qrMode === 'dynamic' ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
                    PAYMENT_CONFIG?.generateUpiUri
                      ? PAYMENT_CONFIG.generateUpiUri(activeOrder.totalAmount, activeOrder.id)
                      : `upi://pay?pa=${activeOrder.upiId || 'abicharan07@axl'}&pn=Nissi%20Super%20Stores&am=${activeOrder.totalAmount}&cu=INR&tn=Order%20${activeOrder.id}`
                  )}`}
                  alt={`Scan to Pay ₹${activeOrder.totalAmount}`}
                  className="w-64 h-64 object-contain rounded-xl shadow-xs"
                />
              ) : (
                <img
                  src={PAYMENT_CONFIG?.qrCodeUrl || '/payment-qr.jpeg'}
                  alt="Full Payment QR"
                  className="w-64 h-64 object-contain rounded-xl shadow-xs"
                />
              )}
            </div>

            {/* Proof Preview if available */}
            {activeOrder.paymentProof && (
              <div className="p-2.5 bg-cardcream rounded-xl border border-hairline text-left flex items-center gap-2">
                <img src={activeOrder.paymentProof} alt="Uploaded Proof" className="w-10 h-10 rounded-lg object-cover border" />
                <div className="text-[11px]">
                  <span className="font-bold text-ink block">Uploaded Screenshot Proof</span>
                  <span className="text-forest">Submitted with Order</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 font-mono text-xs font-bold text-forest bg-forest/5 rounded-xl border border-forest/20">
                <span className="truncate">{activeOrder.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl'}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeOrder.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl');
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-white rounded-lg border border-hairline text-[10px] font-sans font-bold text-ink hover:text-forest transition-colors shrink-0 ml-2"
                >
                  {copiedUpi ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {activeOrder.paymentStatus !== 'Paid' && (
                <button
                  type="button"
                  onClick={() => {
                    updateOrderPaymentStatus(activeOrder.id, 'Paid');
                    setIsPayQrOpen(false);
                  }}
                  className="w-full py-2.5 bg-saffron-gradient text-ink font-bold text-xs rounded-xl shadow-xs hover:brightness-105 transition-all"
                >
                  Mark Order as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
