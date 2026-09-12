import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Zap,
  MapPin,
  Phone,
  User,
  Info,
  ShieldCheck,
  Tag,
  Sparkles,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';

export default function CheckoutView() {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    amountNeededForFreeDelivery,
    grandTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    discountAmount,
    createOrder,
    setActiveView,
    isStoreOpen,
    emergencyAvailable,
    staffAvailable,
    isLoggedIn,
    userName,
    userPhone,
    setIsLoginOpen,
    setLoginPromptMessage
  } = useStore();

  const [formData, setFormData] = useState(() => ({
    name: userName || '',
    phone: userPhone ? (userPhone.startsWith('+91') ? userPhone : `+91 ${userPhone}`) : '',
    address: '',
    pincode: ''
  }));

  const [formError, setFormError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [deliveryType, setDeliveryType] = useState('Normal');
  const [paymentMethod, setPaymentMethod] = useState('Doorstep_UPI'); // 'Doorstep_UPI' | 'COD' | 'Card'
  const [tooltipMessage, setTooltipMessage] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');

  const isEmergencyFeasible = isStoreOpen && emergencyAvailable && staffAvailable;

  const getEmergencyUnavailableReason = () => {
    if (!isStoreOpen) return 'Store is currently closed for incoming emergency orders.';
    if (!emergencyAvailable) return 'Emergency 15-min delivery paused due to heavy weather / traffic.';
    if (!staffAvailable) return 'All delivery riders are currently on active orders.';
    return '';
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setFormError('');

    if (!isLoggedIn) {
      setLoginPromptMessage('Please sign in with your mobile number to place your order.');
      setIsLoginOpen(true);
      return;
    }

    if (cart.length === 0) {
      setFormError('Your cart is empty. Please add items before placing order.');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for doorstep coordination.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (formData.address.trim().length < 6) {
      setFormError('Please provide a complete flat/street address for accurate delivery.');
      return;
    }

    setIsSubmittingOrder(true);

    const selectedMethodLabel =
      paymentMethod === 'Doorstep_UPI'
        ? 'Doorstep UPI Scanner'
        : paymentMethod === 'Card'
        ? 'Card on Delivery (POS Swipe)'
        : 'Cash on Delivery (COD)';

    setTimeout(() => {
      createOrder({
        ...formData,
        deliveryType,
        paymentMethod: selectedMethodLabel,
        paymentStatus: 'Unpaid (Collect at Doorstep)'
      });
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header Back Button */}
      <button
        onClick={() => setActiveView('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-ink bg-cardcream px-3 py-1.5 rounded-xl border border-hairline transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Catalogue</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Checkout & Delivery Details</h1>
          <p className="text-xs text-ink-soft font-sans mt-0.5">
            Complete delivery location and timing for your Nissi Super Stores order.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Form & Delivery Type */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Address & Contact Section */}
          <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-4">
            <h2 className="font-serif font-semibold text-lg text-ink flex items-center gap-2">
              <MapPin className="w-5 h-5 text-forest" />
              <span>Delivery Address & Contact</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-soft mb-1">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/40" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-paper rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">Phone Number (Required for Delivery)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/40" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-paper rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">Full Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House / Flat No., Apartment / Building Name, Street, Landmark, Area"
                  className="w-full p-3 bg-paper rounded-xl border border-hairline text-ink font-sans placeholder:text-ink-soft/40 focus:outline-none focus:border-forest text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500033"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-paper rounded-xl border border-hairline text-ink font-sans placeholder:text-ink-soft/40 focus:outline-none focus:border-forest text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Speed Selector */}
          <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-4">
            <h2 className="font-serif font-semibold text-lg text-ink flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                <span>Select Delivery Option</span>
              </span>
              <span className="text-xs font-sans font-semibold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                {deliveryFee === 0 ? 'FREE Delivery' : '₹10 Delivery Fee'}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Normal Delivery Card */}
              <div
                onClick={() => setDeliveryType('Normal')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  deliveryType === 'Normal'
                    ? 'bg-paper border-forest shadow-md'
                    : 'bg-paper/50 border-hairline hover:border-forest/40'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-forest/10 rounded-xl text-forest">
                    <Clock className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'Normal'}
                    onChange={() => setDeliveryType('Normal')}
                    className="accent-forest w-4 h-4"
                  />
                </div>
                <h3 className="font-serif font-bold text-sm text-ink">Normal Slot Delivery</h3>
                <p className="text-xs text-forest font-semibold mt-1">2:15 PM – 5:15 PM Slot</p>
                <p className="text-[11px] text-ink-soft font-sans mt-1">
                  Scheduled afternoon delivery for daily essentials.
                </p>
              </div>

              {/* Emergency Delivery Card */}
              <div
                onMouseEnter={() => {
                  if (!isEmergencyFeasible) {
                    setTooltipMessage(getEmergencyUnavailableReason());
                  }
                }}
                onMouseLeave={() => setTooltipMessage(null)}
                onClick={() => {
                  if (isEmergencyFeasible) {
                    setDeliveryType('Emergency');
                  }
                }}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  !isEmergencyFeasible
                    ? 'bg-paper/30 border-hairline/50 opacity-60 cursor-not-allowed'
                    : deliveryType === 'Emergency'
                    ? 'bg-paper border-kumkum shadow-md'
                    : 'bg-paper/50 border-hairline hover:border-kumkum/40 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-kumkum/10 rounded-xl text-kumkum">
                    <Zap className="w-5 h-5 fill-kumkum" />
                  </div>
                  <input
                    type="radio"
                    name="deliveryType"
                    disabled={!isEmergencyFeasible}
                    checked={deliveryType === 'Emergency'}
                    onChange={() => isEmergencyFeasible && setDeliveryType('Emergency')}
                    className="accent-kumkum w-4 h-4"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <h3 className="font-serif font-bold text-sm text-ink">Emergency Delivery</h3>
                  <span className="text-[10px] font-bold bg-kumkum text-paper px-2 py-0.5 rounded-full animate-pulse">
                    15-Min SLA
                  </span>
                </div>
                <p className="text-xs text-kumkum font-semibold mt-1">Target within 15 Minutes</p>
                <p className="text-[11px] text-ink-soft font-sans mt-1">
                  Priority express rider assigned immediately.
                </p>

                {/* Why Unavailable Tooltip */}
                {!isEmergencyFeasible && tooltipMessage && (
                  <div className="absolute inset-x-2 -bottom-10 z-20 bg-ink text-paper p-2 rounded-xl text-[10px] shadow-lg flex items-center gap-1.5 border border-hairline">
                    <Info className="w-3.5 h-3.5 text-saffron-highlight shrink-0" />
                    <span>{tooltipMessage}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. Upgraded Payment Method & Dynamic Multi-Mode UPI */}
          <div id="payment-section" className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-semibold text-lg text-ink">Payment Method</h2>
                <span className="px-2 py-0.5 bg-forest/10 text-forest text-[10px] font-bold rounded-full border border-forest/20">
                  Doorstep Collection
                </span>
              </div>
              <span className="text-[11px] text-forest font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>Zero Upfront Risk</span>
              </span>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Option 1: Doorstep UPI Scanner (Recommended) */}
              <label className={`p-3.5 bg-paper rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                paymentMethod === 'Doorstep_UPI'
                  ? 'border-forest ring-2 ring-forest/20 shadow-xs'
                  : 'border-hairline hover:border-forest/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Doorstep_UPI'}
                      onChange={() => setPaymentMethod('Doorstep_UPI')}
                      className="accent-forest w-4 h-4"
                    />
                    <span className="font-bold text-ink">Doorstep UPI QR</span>
                  </div>
                  <span className="text-[9px] font-bold bg-forest text-paper px-1.5 py-0.5 rounded">RECOMMENDED</span>
                </div>
                <p className="text-[10px] text-ink-soft leading-tight">
                  Scan store QR on rider's phone via PhonePe/GPay/Paytm upon delivery
                </p>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label className={`p-3.5 bg-paper rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                paymentMethod === 'COD'
                  ? 'border-forest ring-2 ring-forest/20 shadow-xs'
                  : 'border-hairline hover:border-forest/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-forest w-4 h-4"
                    />
                    <span className="font-bold text-ink">Cash on Delivery</span>
                  </div>
                  <Banknote className="w-3.5 h-3.5 text-ink-soft" />
                </div>
                <p className="text-[10px] text-ink-soft leading-tight">
                  Pay cash directly to delivery partner upon arrival
                </p>
              </label>

              {/* Option 3: Card on Delivery */}
              <label className={`p-3.5 bg-paper rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                paymentMethod === 'Card'
                  ? 'border-forest ring-2 ring-forest/20 shadow-xs'
                  : 'border-hairline hover:border-forest/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                      className="accent-forest w-4 h-4"
                    />
                    <span className="font-bold text-ink">Card on Delivery</span>
                  </div>
                  <CreditCard className="w-3.5 h-3.5 text-ink-soft" />
                </div>
                <p className="text-[10px] text-ink-soft leading-tight">
                  Rider brings wireless POS swipe machine (Visa/MC/RuPay)
                </p>
              </label>
            </div>

            {/* Doorstep Payment Instructions Banner */}
            {paymentMethod === 'Doorstep_UPI' && (
              <div className="p-4 bg-forest/5 border border-forest/25 rounded-2xl space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-forest text-paper rounded-xl">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-ink">Pay at Doorstep via Store Scanner</h4>
                      <p className="text-[10px] text-ink-soft">No advance payment needed • Scan rider's phone on delivery</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full border border-forest/20">
                    100% Safe
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-forest/20 text-xs space-y-2">
                  <p className="text-[11px] text-ink font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-saffron-base" />
                    <span>How it works:</span>
                  </p>
                  <ol className="text-[11px] text-ink-soft space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Place your order now without paying anything upfront.</li>
                    <li>Our delivery partner will reach your doorstep with your ordered items.</li>
                    <li>The delivery partner will display the <strong>official store QR scanner</strong> on their mobile app.</li>
                    <li>Scan using <strong>PhonePe, Google Pay, Paytm, or BHIM</strong> to complete payment of <strong className="text-forest font-mono">₹{grandTotal}</strong>.</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-ink-soft px-1">
                  <Smartphone className="w-3 h-3 text-forest" />
                  <span>Compatible with PhonePe, Google Pay, Paytm, BHIM & all UPI apps</span>
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-4 bg-paper border border-hairline rounded-2xl text-xs space-y-1.5 animate-fade-in">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-forest" />
                  <span>Cash on Delivery</span>
                </p>
                <p className="text-[11px] text-ink-soft leading-relaxed">
                  Please keep exact cash of <strong className="text-forest font-mono">₹{grandTotal}</strong> ready for the delivery partner upon arrival at your doorstep.
                </p>
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div className="p-4 bg-paper border border-hairline rounded-2xl text-xs space-y-1.5 animate-fade-in">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-forest" />
                  <span>Card on Delivery</span>
                </p>
                <p className="text-[11px] text-ink-soft leading-relaxed">
                  Delivery partner will carry a secure wireless POS swipe machine. Accepts Visa, Mastercard, RuPay cards and contactless NFC.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-md sticky top-20 space-y-4">

            {/* Dynamic Priority Badge Micro-interaction */}
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h2 className="font-serif font-bold text-xl text-ink">Order Summary</h2>
              {deliveryType === 'Emergency' ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2.5 py-1 bg-kumkum text-paper rounded-full text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-paper" /> Priority Order
                </motion.span>
              ) : (
                <span className="px-2.5 py-1 bg-forest/10 text-forest rounded-full text-xs font-semibold">
                  Standard Delivery
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-hairline/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest">{item.quantity}x</span>
                    <span className="font-medium text-ink truncate max-w-[170px]">{item.name}</span>
                  </div>
                  <span className="font-mono text-ink font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="p-3 bg-paper border border-hairline rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-forest" />
                  <span>Coupon Code</span>
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10px] text-kumkum hover:underline font-semibold"
                  >
                    Remove ({appliedCoupon.code})
                  </button>
                )}
              </div>

              {!appliedCoupon && (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-cardcream rounded-xl text-xs uppercase font-mono font-semibold border border-hairline text-ink focus:outline-none focus:border-forest"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (applyCoupon(couponCodeInput)) {
                          setCouponCodeInput('');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-forest hover:bg-forest/90 text-paper rounded-xl text-xs font-bold shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-kumkum font-medium">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 text-xs font-sans">
              <div className="flex justify-between text-ink-soft">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-ink">₹{cartSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-forest font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Coupon ({appliedCoupon?.code})</span>
                  </span>
                  <span className="font-mono font-bold">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-ink-soft">
                <span className="flex items-center gap-1">
                  <span>Delivery Charge</span>
                  <Tag className="w-3 h-3 text-saffron-base" />
                </span>
                {deliveryFee > 0 ? (
                  <span className="font-mono font-bold text-kumkum">+₹10 (Under ₹199)</span>
                ) : (
                  <span className="font-mono font-bold text-forest">₹0 (FREE)</span>
                )}
              </div>

              {amountNeededForFreeDelivery > 0 && (
                <div className="p-2 bg-saffron-base/10 border border-saffron-base/30 rounded-lg text-[11px] text-ink font-medium">
                  💡 Add ₹{amountNeededForFreeDelivery} more to get FREE delivery!
                </div>
              )}

              <div className="pt-3 border-t border-hairline flex justify-between items-baseline text-base font-bold text-ink">
                <span className="font-serif text-lg">Grand Total</span>
                <span className="font-mono text-xl text-forest">₹{grandTotal}</span>
              </div>
            </div>

            {/* Form Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-kumkum/10 border border-kumkum/30 rounded-xl text-xs text-kumkum font-semibold flex items-center gap-2 animate-fade-in">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={cart.length === 0 || isSubmittingOrder}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmittingOrder
                  ? 'bg-forest text-paper cursor-wait'
                  : deliveryType === 'Emergency'
                  ? 'bg-kumkum hover:bg-kumkum/90 text-paper active:scale-[0.99]'
                  : 'bg-saffron-gradient hover:brightness-105 text-ink active:scale-[0.99]'
              }`}
            >
              {isSubmittingOrder ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Your Kirana Order... 🛵</span>
                </>
              ) : (
                <span>
                  Place Order • ₹{grandTotal} ({paymentMethod === 'Doorstep_UPI' ? 'Pay at Doorstep via QR' : paymentMethod === 'Card' ? 'Card on Delivery' : 'Cash on Delivery'})
                </span>
              )}
            </button>

            <div className="text-[11px] text-center text-ink-soft flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Doorstep delivery backed by Nissi Kirana Speed</span>
            </div>

          </div>
        </div>

        {/* Sticky Mobile Checkout Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-t border-hairline p-3 px-4 flex items-center justify-between shadow-2xl safe-area-bottom">
          <div>
            <span className="text-[10px] text-ink-soft block uppercase font-bold tracking-wider">Total Payable</span>
            <span className="font-mono text-lg font-bold text-forest">₹{grandTotal}</span>
          </div>
          <button
            type="submit"
            disabled={cart.length === 0 || isSubmittingOrder}
            className={`py-3 px-6 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
              isSubmittingOrder
                ? 'bg-forest text-paper cursor-wait'
                : deliveryType === 'Emergency'
                ? 'bg-kumkum text-paper'
                : 'bg-saffron-gradient text-ink'
            }`}
          >
            {isSubmittingOrder ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Placing...</span>
              </>
            ) : (
              <>
                <span>Place Order (₹{grandTotal})</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
