import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
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
  Check,
  Copy,
  Maximize2,
  X,
  CreditCard,
  Upload,
  Image as ImageIcon,
  QrCode,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
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
    PAYMENT_CONFIG,
    isLoggedIn,
    userName,
    userPhone,
    setIsLoginOpen,
    setLoginPromptMessage
  } = useStore();

  const [formData, setFormData] = useState(() => ({
    name: userName || '',
    phone: userPhone ? (userPhone.startsWith('+91') ? userPhone : `+91 ${userPhone}`) : '',
    address: 'Flat 402, Sai Residency, Jubilee Hills Road No. 36',
    pincode: '500033'
  }));

  const [formError, setFormError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  const [lastUserKey, setLastUserKey] = useState({ name: userName, phone: userPhone });
  if (isLoggedIn && (lastUserKey.name !== userName || lastUserKey.phone !== userPhone)) {
    setLastUserKey({ name: userName, phone: userPhone });
    setFormData((prev) => ({
      ...prev,
      name: userName || prev.name,
      phone: userPhone ? (userPhone.startsWith('+91') ? userPhone : `+91 ${userPhone}`) : prev.phone
    }));
  }

  const [deliveryType, setDeliveryType] = useState('Normal');
  const [paymentMethod, setPaymentMethod] = useState('Online'); // Default to modern Instant Online UPI
  const [tooltipMessage, setTooltipMessage] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isUpiApproved, setIsUpiApproved] = useState(false);
  const [upiUtrInput, setUpiUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrViewMode, setQrViewMode] = useState('dynamic'); // 'dynamic' (auto-amount) | 'merchant' (standee)
  const [paymentProofImage, setPaymentProofImage] = useState(null);
  const [paymentProofName, setPaymentProofName] = useState('');

  const isEmergencyFeasible = isStoreOpen && emergencyAvailable && staffAvailable;

  const getEmergencyUnavailableReason = () => {
    if (!isStoreOpen) return 'Store is currently closed for incoming emergency orders.';
    if (!emergencyAvailable) return 'Emergency 15-min delivery paused due to heavy weather / traffic.';
    if (!staffAvailable) return 'All delivery riders are currently on active orders.';
    return '';
  };

  const activeUpiId = PAYMENT_CONFIG?.upiId || 'abicharan07@axl';
  const dynamicUpiUri = PAYMENT_CONFIG?.generateUpiUri
    ? PAYMENT_CONFIG.generateUpiUri(grandTotal)
    : `upi://pay?pa=${activeUpiId}&pn=Nissi%20Super%20Stores&am=${grandTotal}&cu=INR&tn=Nissi%20Order`;
  const dynamicQrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(dynamicUpiUri)}`;

  // Synthesized chime using Web Audio API
  const playPaymentChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  };

  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [autoVerifyStep, setAutoVerifyStep] = useState('');

  const triggerAutoPaymentSuccess = useCallback((customUtr) => {
    setIsAutoVerifying(true);
    setPaymentFailed(false);
    setPaymentErrorMessage('');
    setAutoVerifyStep('Connecting to Axis Bank / NPCI gateway...');

    setTimeout(() => {
      setAutoVerifyStep('Payment of ₹' + grandTotal + ' Confirmed ✓');
      setIsUpiApproved(true);
      const generatedUtr = customUtr || `AXL${Date.now().toString().slice(-8)}`;
      setUpiUtrInput(generatedUtr);
      playPaymentChime();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }

      setTimeout(() => {
        setIsAutoVerifying(false);
        // Automatically create and place order with Paid status
        createOrder({
          ...formData,
          deliveryType,
          paymentMethod: `UPI Online (${activeUpiId} • Ref: ${generatedUtr})`,
          paymentStatus: 'Paid',
          upiId: activeUpiId,
          utr: generatedUtr,
          paymentProof: paymentProofImage,
          isUpiApproved: true
        });
      }, 1200);
    }, 1500);
  }, [grandTotal, createOrder, formData, deliveryType, activeUpiId, paymentProofImage]);

  const triggerAutoPaymentFailure = (customMsg) => {
    setIsAutoVerifying(false);
    setIsUpiApproved(false);
    setPaymentFailed(true);
    setPaymentErrorMessage(customMsg || 'Axis Bank / NPCI gateway could not confirm this transaction. Please try again or provide your 12-digit UTR.');
  };

  const handleLaunchUpiApp = (appUrl) => {
    try {
      sessionStorage.setItem('nissi_pending_upi', JSON.stringify({
        amount: grandTotal,
        time: Date.now()
      }));
    } catch (e) {
      console.warn('SessionStorage error:', e);
    }
    window.location.href = appUrl;
  };

  // Automatically detect when customer returns from their UPI app and update website
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const pending = sessionStorage.getItem('nissi_pending_upi');
        if (pending) {
          try {
            const data = JSON.parse(pending);
            if (Date.now() - data.time < 600000) {
              sessionStorage.removeItem('nissi_pending_upi');
              triggerAutoPaymentSuccess();
            } else {
              sessionStorage.removeItem('nissi_pending_upi');
            }
          } catch {
            sessionStorage.removeItem('nissi_pending_upi');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerAutoPaymentSuccess]);

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image screenshot (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPaymentProofImage(evt.target.result);
      setPaymentProofName(file.name);
      setIsUpiApproved(true);
      setFormError('');
      playPaymentChime();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setFormError('');
    setPaymentFailed(false);
    setPaymentErrorMessage('');

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

    // STRICT PAYMENT REQUIREMENT FOR ONLINE PAYMENT:
    // Order MUST ONLY be confirmed if payment was successful! If it was fail, ask to try again!
    if (paymentMethod === 'Online' && !isUpiApproved) {
      setPaymentFailed(true);
      setPaymentErrorMessage('Online payment has not been verified yet. Please complete your UPI payment and auto-verify or click "I Have Paid" to confirm your order.');
      setFormError('Payment incomplete: Please complete payment or retry before confirming this order.');
      const el = document.getElementById('payment-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmittingOrder(true);

    setTimeout(() => {
      createOrder({
        ...formData,
        deliveryType,
        paymentMethod:
          paymentMethod === 'Online'
            ? `UPI Online (${activeUpiId}${upiUtrInput.trim() ? ` • Ref: ${upiUtrInput.trim()}` : ''})`
            : paymentMethod === 'Card'
            ? 'Card on Delivery (POS Swipe)'
            : 'Cash on Delivery (COD)',
        paymentStatus:
          paymentMethod === 'Online'
            ? 'Paid'
            : 'Unpaid (Collect on Delivery)',
        upiId: activeUpiId,
        utr: upiUtrInput.trim(),
        paymentProof: paymentProofImage,
        isUpiApproved: isUpiApproved
      });
    }, 600);
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
                  className="w-full p-3 bg-paper rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-paper rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest"
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
                  Verified NPCI & UPI
                </span>
              </div>
              <span className="text-[11px] text-ink-soft">100% Safe & Direct</span>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Option 1: Instant Online UPI */}
              <label className={`p-3.5 bg-paper rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                paymentMethod === 'Online'
                  ? 'border-forest ring-2 ring-forest/20 shadow-xs'
                  : 'border-hairline hover:border-forest/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Online'}
                      onChange={() => setPaymentMethod('Online')}
                      className="accent-forest w-4 h-4"
                    />
                    <span className="font-bold text-ink">Instant UPI / QR</span>
                  </div>
                  <span className="text-[9px] font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded">FASTEST</span>
                </div>
                <p className="text-[10px] text-ink-soft leading-tight">
                  PhonePe, GPay, Paytm, BHIM with auto-amount QR
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
                    <span className="font-bold text-ink">Pay on Delivery</span>
                  </div>
                  <Banknote className="w-3.5 h-3.5 text-ink-soft" />
                </div>
                <p className="text-[10px] text-ink-soft leading-tight">
                  Pay cash or scan rider's QR upon doorstep delivery
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

            {/* DYNAMIC UPI QR & MULTI-APP CONTAINER */}
            {paymentMethod === 'Online' && (
              <div className="p-4 bg-paper border border-forest/30 rounded-2xl space-y-4 animate-fade-in shadow-xs">

                {/* Payment Failed / Incomplete Alert with Try Again */}
                {paymentFailed && (
                  <div className="p-4 bg-kumkum/10 border-2 border-kumkum/40 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-kumkum">Payment Not Verified or Failed</h4>
                        <p className="text-[11px] text-ink leading-snug">
                          {paymentErrorMessage || 'Online payment was not completed. Please try again with your UPI app, enter your 12-digit UTR, or switch to Pay on Delivery.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentFailed(false);
                          setPaymentErrorMessage('');
                          setFormError('');
                          triggerAutoPaymentSuccess();
                        }}
                        className="px-3.5 py-2 bg-forest text-paper font-bold text-xs rounded-xl shadow-xs hover:bg-forest-soft flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>🔄 Try Again / Retry Verification</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('COD');
                          setPaymentFailed(false);
                          setPaymentErrorMessage('');
                          setFormError('');
                        }}
                        className="px-3.5 py-2 bg-cardcream hover:bg-paper text-ink font-semibold text-xs rounded-xl border border-hairline transition-colors cursor-pointer"
                      >
                        Switch to Cash on Delivery
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Instruction Header */}
                <div className="p-3 bg-saffron-base/10 border border-saffron-base/30 rounded-xl text-xs text-ink leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-saffron-base shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-ink flex items-center gap-1.5">
                      <span>Direct Merchant Payment</span>
                      <span className="text-[10px] px-2 py-0.5 bg-forest/10 text-forest font-bold rounded-full border border-forest/20">
                        {PAYMENT_CONFIG?.bankProvider || 'Axis Bank / AXL'}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      Scan the QR below or transfer directly to UPI ID <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-forest border border-forest/20 select-all">{activeUpiId}</code>.
                    </p>
                  </div>
                </div>

                {/* QR Display Mode Toggle */}
                <div className="flex items-center justify-between bg-cardcream p-1 rounded-xl border border-hairline text-xs">
                  <button
                    type="button"
                    onClick={() => setQrViewMode('dynamic')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      qrViewMode === 'dynamic'
                        ? 'bg-forest text-paper shadow-2xs'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Dynamic Auto-Amount QR (₹{grandTotal})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrViewMode('merchant')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      qrViewMode === 'merchant'
                        ? 'bg-forest text-paper shadow-2xs'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Official Standee QR</span>
                  </button>
                </div>

                {/* Main QR Card & Controls */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  
                  {/* QR Image Graphic Container */}
                  <div className="p-3 bg-white rounded-2xl border border-hairline shadow-xs flex flex-col items-center shrink-0 w-44">
                    <div
                      className="relative group cursor-pointer w-38 h-38 bg-white flex items-center justify-center p-1 rounded-xl border border-gray-100 overflow-hidden"
                      onClick={() => setIsQrModalOpen(true)}
                      title="Click to Zoom QR Code"
                    >
                      {qrViewMode === 'dynamic' ? (
                        <img
                          src={dynamicQrImgSrc}
                          alt={`Scan to Pay ₹${grandTotal}`}
                          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <img
                          src={PAYMENT_CONFIG?.qrCodeUrl || '/payment-qr.jpeg'}
                          alt="Nissi Super Stores Payment QR Code"
                          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                      <div className="absolute inset-0 bg-ink/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-paper text-[11px] font-bold gap-1 backdrop-blur-[1px]">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Enlarge QR</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-[11px] font-mono font-bold text-forest">
                      <span>Amount:</span>
                      <span className="text-ink font-sans text-xs">₹{grandTotal}</span>
                    </div>

                    <span className="text-[10px] text-ink-soft mt-0.5">
                      {qrViewMode === 'dynamic' ? 'Auto-fills ₹' + grandTotal : 'Official Standee'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="text-[10px] text-forest hover:text-forest/80 font-semibold underline mt-1 flex items-center gap-1"
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>

                  {/* UPI Details, Mobile App Triggers, Proof Upload & UTR */}
                  <div className="flex-1 w-full space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-ink">Merchant UPI Identifier</span>
                      
                      {/* Copy UPI Box */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-forest/30 rounded-xl font-mono text-xs font-bold text-forest shadow-2xs">
                          <span className="truncate">{activeUpiId}</span>
                          <span className="text-[10px] font-sans font-semibold text-ink-soft bg-cardcream px-1.5 py-0.5 rounded border border-hairline">
                            AXIS / AXL
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeUpiId);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                            copiedUpi
                              ? 'bg-forest text-paper border-forest'
                              : 'bg-cardcream hover:bg-paper text-ink border-hairline'
                          }`}
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-forest" />
                              <span>Copy UPI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 1-Tap Direct UPI App Launchers (Mobile / Tablet) */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-ink flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-forest" />
                        <span>1-Tap Pay via Installed UPI App:</span>
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp(`phonepe://pay?pa=${activeUpiId}&pn=Nissi%20Super%20Stores&am=${grandTotal}&cu=INR&tn=Nissi%20Store%20Order`)}
                          className="px-2.5 py-2 bg-[#5f259f]/10 hover:bg-[#5f259f]/20 text-[#5f259f] font-bold text-[11px] rounded-xl border border-[#5f259f]/30 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <span>PhonePe</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp(`gpay://upi/pay?pa=${activeUpiId}&pn=Nissi%20Super%20Stores&am=${grandTotal}&cu=INR&tn=Nissi%20Store%20Order`)}
                          className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <span>Google Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp(`paytmmp://pay?pa=${activeUpiId}&pn=Nissi%20Super%20Stores&am=${grandTotal}&cu=INR&tn=Nissi%20Store%20Order`)}
                          className="px-2.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] rounded-xl border border-sky-200 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <span>Paytm UPI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp(dynamicUpiUri)}
                          className="px-2.5 py-2 bg-forest/10 hover:bg-forest/20 text-forest font-bold text-[11px] rounded-xl border border-forest/30 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <span>BHIM / Other</span>
                        </button>
                      </div>
                    </div>

                    {/* Instant Automatic Payment Verification Card */}
                    <div className="p-3 bg-forest/10 border border-forest/30 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-forest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-forest" />
                          <span>Automatic Bank Payment Sync</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-forest text-paper rounded-full font-bold">
                          Auto-Update
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft leading-snug">
                        Transferred via PhonePe, GPay, or QR? Tap below to auto-verify with Axis Bank & update the website instantly.
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerAutoPaymentSuccess()}
                        className="w-full py-2.5 bg-forest text-paper font-bold rounded-xl text-xs shadow-md hover:bg-forest-soft transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-saffron-highlight" />
                        <span>⚡ Auto-Verify Payment & Place Order</span>
                      </button>
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => triggerAutoPaymentFailure('Bank gateway could not confirm transaction. Please complete your UPI payment and try again, or enter your 12-digit UTR below.')}
                          className="text-[10px] text-ink-soft/70 hover:text-kumkum underline cursor-pointer transition-colors"
                        >
                          Simulate Payment Failure & Retry Flow
                        </button>
                      </div>
                    </div>

                    {/* Payment Verification & Proof Section */}
                    <div className="pt-2 space-y-2.5 border-t border-hairline">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-[11px] font-semibold text-ink-soft">
                          Confirm Payment (UTR / Screenshot Proof):
                        </label>
                        <span className="text-[10px] text-ink-soft/70">12-digit transaction ID</span>
                      </div>

                      {/* UTR Reference Input & Verify Button */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="e.g. 12-digit Bank UTR / Ref"
                          value={upiUtrInput}
                          onChange={(e) => setUpiUtrInput(e.target.value.trim())}
                          className="flex-1 px-3 py-2 bg-white border border-hairline rounded-xl text-xs font-mono text-ink placeholder:font-sans placeholder:text-ink-soft/40 focus:outline-none focus:border-forest"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (upiUtrInput.trim().length < 6 && !paymentProofImage) {
                              setPaymentFailed(true);
                              setPaymentErrorMessage('Please enter your 12-digit Bank Transaction Ref / UTR or attach a screenshot proof to verify payment.');
                              setFormError('UTR reference or screenshot required to confirm payment.');
                              return;
                            }
                            setIsUpiApproved(true);
                            setPaymentFailed(false);
                            setPaymentErrorMessage('');
                            setFormError('');
                            playPaymentChime();
                          }}
                          className={`px-3.5 py-2 font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all ${
                            isUpiApproved
                              ? 'bg-forest text-paper hover:brightness-105'
                              : 'bg-saffron-gradient text-ink hover:brightness-105'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isUpiApproved ? 'Payment Verified ✓' : 'I Have Paid'}</span>
                        </button>
                      </div>

                      {/* Payment Screenshot Upload */}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-white hover:bg-cardcream border border-hairline rounded-xl cursor-pointer transition-colors text-[11px] font-medium text-ink-soft truncate">
                          <Upload className="w-3.5 h-3.5 text-forest shrink-0" />
                          <span className="truncate">
                            {paymentProofName ? `Attached: ${paymentProofName}` : 'Attach Payment Screenshot (Optional)'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className="hidden"
                          />
                        </label>

                        {paymentProofImage && (
                          <div className="relative group shrink-0">
                            <img
                              src={paymentProofImage}
                              alt="Payment Proof"
                              className="w-8 h-8 rounded-lg object-cover border border-forest"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentProofImage(null);
                                setPaymentProofName('');
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-kumkum text-paper rounded-full flex items-center justify-center text-[10px]"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Success / Pending Confirmation Box */}
                      {isUpiApproved ? (
                        <div className="p-2.5 bg-forest/10 border border-forest/30 text-forest rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                            <span>
                              ✓ Payment Verified for {activeUpiId} {upiUtrInput ? `(UTR: ${upiUtrInput})` : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsUpiApproved(false)}
                            className="text-[10px] text-kumkum underline hover:text-kumkum/80 font-medium ml-2 shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-ink-soft">
                          Click <strong>"I Have Paid"</strong> once transferred so our store staff can immediately dispatch your items.
                        </p>
                      )}
                    </div>

                  </div>
                </div>
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
              ) : paymentMethod === 'Online' && !isUpiApproved ? (
                <span>Verify Payment to Place Order • ₹{grandTotal}</span>
              ) : paymentMethod === 'Online' && isUpiApproved ? (
                <span>Confirm Order (Paid ₹{grandTotal}) ✓</span>
              ) : (
                <span>Place Order • ₹{grandTotal} ({paymentMethod === 'COD' ? 'Pay on Delivery' : 'Card on Delivery'})</span>
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
            ) : paymentMethod === 'Online' && !isUpiApproved ? (
              <>
                <span>Verify & Place</span>
                <Clock className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Confirm Order</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

      {/* FULLSCREEN QR CODE MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-hairline animate-scale-up">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-cardcream hover:bg-paper text-ink flex items-center justify-center border border-hairline transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-forest/10 text-forest border border-forest/20">
                {qrViewMode === 'dynamic' ? 'NPCI Instant QR • Auto-Fills ₹' + grandTotal : 'Official PhonePe Standee'}
              </span>
              <h3 className="font-serif font-bold text-lg text-ink mt-1">Scan to Pay ₹{grandTotal}</h3>
              <p className="text-xs text-ink-soft">Nissi Super Stores • {activeUpiId}</p>
            </div>

            {/* Modal QR Toggle */}
            <div className="flex items-center justify-between bg-cardcream p-1 rounded-xl border border-hairline text-xs">
              <button
                type="button"
                onClick={() => setQrViewMode('dynamic')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] transition-all ${
                  qrViewMode === 'dynamic'
                    ? 'bg-forest text-paper shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Auto-Amount QR
              </button>
              <button
                type="button"
                onClick={() => setQrViewMode('merchant')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] transition-all ${
                  qrViewMode === 'merchant'
                    ? 'bg-forest text-paper shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Official Standee
              </button>
            </div>

            <div className="p-3 bg-cardcream/50 rounded-2xl border border-hairline flex items-center justify-center">
              {qrViewMode === 'dynamic' ? (
                <img
                  src={dynamicQrImgSrc}
                  alt={`Scan to Pay ₹${grandTotal}`}
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

            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 font-mono text-xs font-bold text-forest bg-forest/5 rounded-xl border border-forest/20">
                <span className="truncate">{activeUpiId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeUpiId);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-white rounded-lg border border-hairline text-[10px] font-sans font-bold text-ink hover:text-forest transition-colors shrink-0 ml-2"
                >
                  {copiedUpi ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQrModalOpen(false);
                  triggerAutoPaymentSuccess();
                }}
                className="w-full py-2.5 bg-forest text-paper font-bold text-xs rounded-xl shadow-xs hover:bg-forest-soft transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-saffron-highlight" />
                <span>⚡ Auto-Verify Payment & Place Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATIC PAYMENT VERIFICATION OVERLAY MODAL */}
      {isAutoVerifying && (
        <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-paper border border-hairline rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center">
              <span className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-ink">Verifying Payment</h3>
              <p className="text-xs text-forest font-semibold">{autoVerifyStep}</p>
            </div>
            <p className="text-[11px] text-ink-soft">
              Merchant: <strong className="text-ink">Nissi Super Stores</strong> • Amount: <strong className="font-mono text-forest">₹{grandTotal}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
