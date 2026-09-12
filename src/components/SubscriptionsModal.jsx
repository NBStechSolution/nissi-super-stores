import React, { useState } from 'react';
import { X, Calendar, Clock, Plus, Minus, CheckCircle, PauseCircle, PlayCircle, Trash2, Sparkles, ShieldCheck, Sun } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function SubscriptionsModal() {
  const {
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    subscriptionTargetProduct,
    setSubscriptionTargetProduct,
    subscriptions,
    addSubscription,
    toggleSubscriptionStatus,
    cancelSubscription,
    products,
    savedAddresses,
    language
  } = useStore();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [selectedProductId, setSelectedProductId] = useState(
    subscriptionTargetProduct?.id || 'prod-3'
  );
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('Daily');
  const [successToast, setSuccessToast] = useState('');

  if (!isSubscriptionModalOpen) return null;

  // Curated daily morning essentials (strictly excluding coconut)
  const morningEssentials = products.filter(
    (p) =>
      p &&
      p.category !== 'coconut' &&
      p.category !== 'utilities' &&
      (p.category === 'milk' || p.category === 'pooja' || p.badge === 'Popular' || p.id === 'prod-4')
  );

  const selectedProductObj =
    products.find((p) => p.id === selectedProductId) || morningEssentials[0] || products[0];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!selectedProductObj) return;

    addSubscription({
      product: selectedProductObj,
      quantity,
      frequency,
      deliveryTime: '06:30 AM',
      address: savedAddresses[0]?.address || 'Primary Residence'
    });

    setSuccessToast(`Morning subscription for ${selectedProductObj.name} confirmed!`);
    setTimeout(() => {
      setSuccessToast('');
      setActiveTab('list');
      setSubscriptionTargetProduct(null);
    }, 1400);
  };

  const handleClose = () => {
    setIsSubscriptionModalOpen(false);
    setSubscriptionTargetProduct(null);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto safe-area-bottom animate-scale-up"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-saffron-base/20 text-ink rounded-xl">
              <Sun className="w-5 h-5 text-saffron-base fill-saffron-base/30" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-ink">
                {language === 'te' ? 'ఉదయం డెలివరీ సబ్‌స్క్రిప్షన్' : 'Morning Essentials Pass'}
              </h2>
              <p className="text-[11px] text-ink-soft flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-forest" />
                <span>6:30 AM Doorstep Delivery • Zero Delivery Fee</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1 bg-cardcream rounded-xl border border-hairline">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-paper text-forest shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {language === 'te' ? 'నా సబ్‌స్క్రిప్షన్లు' : 'My Deliveries'} ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-paper text-forest shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {language === 'te' ? '+ కొత్త సబ్‌స్క్రిప్షన్' : '+ New Subscription'}
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-forest/10 border border-forest/30 text-forest text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab 1: Active Subscriptions List */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 space-y-3 bg-cardcream/50 rounded-2xl border border-dashed border-hairline p-4">
                <span className="text-4xl">🥛</span>
                <p className="text-xs text-ink-soft">
                  {language === 'te'
                    ? 'ఇంకా ఎటువంటి ఉదయకాలపు సబ్‌స్క్రిప్షన్లు లేవు. పాలు, పెరుగు లేదా పూజా వస్తువులను ప్రతిరోజూ ఉదయం 6:30 గంటలకు పొందండి.'
                    : 'No active morning deliveries yet. Subscribe to fresh milk, curd, or pooja items for hassle-free 6:30 AM doorstep delivery.'}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-saffron-gradient text-ink font-bold text-xs rounded-xl shadow-xs"
                >
                  Start Morning Subscription
                </button>
              </div>
            ) : (
              subscriptions.map((sub) => {
                const isActive = sub.status === 'Active';
                return (
                  <div
                    key={sub.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-paper border-hairline shadow-xs'
                        : 'bg-cardcream/60 border-hairline/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-ink">
                            {sub.productName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-forest/10 text-forest border border-forest/20'
                                : 'bg-saffron-base/20 text-ink border border-saffron-base/30'
                            }`}
                          >
                            {isActive ? '● Active' : '⏸ Paused'}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft">
                          Qty: <span className="font-bold text-ink">{sub.quantity}</span> • {sub.unit} • ₹{sub.price * sub.quantity} / day
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-ink-soft font-medium pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-forest" />
                            {sub.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-saffron-base" />
                            {sub.deliveryTime}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleSubscriptionStatus(sub.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-cardcream hover:bg-paper text-ink border-hairline'
                              : 'bg-forest text-paper hover:bg-forest/90 border-forest'
                          }`}
                          title={isActive ? 'Pause Delivery' : 'Resume Delivery'}
                        >
                          {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => cancelSubscription(sub.id)}
                          className="p-2 bg-kumkum/10 hover:bg-kumkum/20 text-kumkum rounded-xl border border-kumkum/20 transition-colors"
                          title="Cancel Subscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Value proposition guarantee card */}
            <div className="p-3 bg-forest/5 border border-forest/15 rounded-xl space-y-1.5 text-xs text-forest">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Nissi Morning Milk & Essentials Guarantee</span>
              </div>
              <p className="text-[11px] text-ink-soft leading-relaxed">
                Directly procured from local dairy hubs every morning at 4:30 AM. Placed safely at your door before 6:30 AM. Pause anytime during holidays with zero cancellation charges.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Create New Morning Subscription */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Product selection grid */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Select Morning Essential:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {morningEssentials.map((prod) => {
                  const isChosen = prod.id === selectedProductId;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        isChosen
                          ? 'bg-forest/10 border-forest text-ink ring-2 ring-forest/30'
                          : 'bg-cardcream/60 border-hairline hover:bg-cardcream text-ink'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{prod.fallbackEmoji || '🥛'}</span>
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-xs truncate">
                          {language === 'te' && prod.nameTe ? prod.nameTe : prod.name}
                        </div>
                        <div className="text-[10px] text-ink-soft font-mono">
                          ₹{prod.price} • {prod.unit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cardcream/70 p-3 rounded-xl border border-hairline space-y-1.5">
                <span className="block text-[11px] font-bold text-ink">Daily Packets / Qty:</span>
                <div className="flex items-center justify-between bg-paper border border-hairline rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 hover:bg-cardcream rounded text-ink"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-sm text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="p-1 hover:bg-cardcream rounded text-ink"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-cardcream/70 p-3 rounded-xl border border-hairline space-y-1.5">
                <span className="block text-[11px] font-bold text-ink">Delivery Schedule:</span>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-paper border border-hairline rounded-lg p-1.5 text-xs text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  <option value="Daily">Daily (ప్రతిరోజూ)</option>
                  <option value="Alternate Days">Alternate Days (రోజు విడిచి రోజు)</option>
                  <option value="Weekdays">Weekdays (Mon-Fri)</option>
                  <option value="Weekends">Weekends Only (Sat-Sun)</option>
                </select>
              </div>
            </div>

            {/* Slot & Delivery Time Notice */}
            <div className="p-3 bg-saffron-base/15 rounded-xl border border-saffron-base/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest" />
                <span className="font-semibold text-ink">Daily Slot: 06:00 AM – 06:30 AM</span>
              </div>
              <span className="text-[10px] font-bold bg-forest text-paper px-2 py-0.5 rounded-full">
                0% Delivery Fee
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-saffron-gradient text-ink font-bold rounded-xl text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Morning Delivery (₹{selectedProductObj.price * quantity} / day)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
