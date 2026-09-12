import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Zap, Truck, Clock, Sparkles } from 'lucide-react';

export default function Hero2D() {
  const { setSelectedCategory, openUtilityModal, language, isStoreOpen, emergencyAvailable } = useStore();
  const [failedImages, setFailedImages] = useState({});

  const handleImgError = (key) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const isEmergencyReady = isStoreOpen && emergencyAvailable;

  return (
    <div className="relative w-full rounded-crate bg-hero-gradient border border-hairline hero-card-highlight shadow-crate p-4 sm:p-6 lg:p-10 mb-4 sm:mb-8 overflow-hidden">
      
      {/* Background Subtle Organic Accents */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-saffron-base/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-forest/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile/Tablet Compact View (< lg) */}
      <div className="lg:hidden space-y-3 relative z-10">
        {/* Banner header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse-emerald" />
            <span className="text-xs font-bold text-forest tracking-wide">
              {language === 'te' ? '15-నిమిషాల డెలివరీ' : '15-Min Kirana Express'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-ink bg-cardcream px-2.5 py-0.5 rounded-full border border-hairline shrink-0">
            🚚 Free over ₹199
          </span>
        </div>

        {/* Catchy headline + Status */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-serif font-bold text-ink leading-tight">
            {language === 'te' ? (
              <>మీ ఇంటి దరిచేరే <span className="text-saffron-gradient">కిరాణా</span></>
            ) : (
              <>Fresh Kirana at <span className="text-saffron-gradient">Express Speed</span></>
            )}
          </h1>
          {isEmergencyReady ? (
            <span className="px-2.5 py-1 bg-saffron-gradient text-ink rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1 shrink-0">
              <Zap className="w-3 h-3 fill-ink" />
              15m Emergency
            </span>
          ) : !isStoreOpen ? (
            <span className="px-2.5 py-1 bg-kumkum/10 text-kumkum rounded-lg text-[10px] font-bold border border-kumkum/30 shrink-0">
              Closed
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-forest/10 text-forest rounded-lg text-[10px] font-bold border border-forest/20 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              Normal Slots
            </span>
          )}
        </div>

        {/* Quick Utility Shortcuts */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => openUtilityModal('electricity')}
            className="flex-1 py-1.5 px-2 bg-cardcream hover:bg-paper text-ink font-semibold rounded-lg border border-hairline text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-saffron-base" />
            <span>Electricity</span>
          </button>
          <button
            onClick={() => openUtilityModal('dth_mobile')}
            className="flex-1 py-1.5 px-2 bg-cardcream hover:bg-paper text-ink font-semibold rounded-lg border border-hairline text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>Recharge</span>
          </button>
        </div>

        {/* Horizontal Category Strip on Mobile */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          {/* Card 1 */}
          <div
            onClick={() => setSelectedCategory('grocery')}
            className="w-28 shrink-0 bg-paper border border-hairline rounded-xl p-2 shadow-xs space-y-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-16 rounded-lg overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.rice ? (
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80"
                  alt="Sona Masoori Rice"
                  onError={() => handleImgError('rice')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🌾</span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-serif font-bold text-ink truncate">Rice & Dal</span>
              <span className="text-[9px] bg-forest/10 text-forest font-bold px-1 rounded">₹340</span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setSelectedCategory('milk')}
            className="w-28 shrink-0 bg-paper border border-hairline rounded-xl p-2 shadow-xs space-y-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-16 rounded-lg overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.milk ? (
                <img
                  src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80"
                  alt="Fresh Milk"
                  onError={() => handleImgError('milk')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🥛</span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-serif font-bold text-ink truncate">Milk</span>
              <span className="text-[9px] bg-saffron-base/20 text-ink font-bold px-1 rounded">₹32</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setSelectedCategory('snacks')}
            className="w-28 shrink-0 bg-paper border border-hairline rounded-xl p-2 shadow-xs space-y-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-16 rounded-lg overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.snacks ? (
                <img
                  src="https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=300&q=80"
                  alt="Kurkure Snacks"
                  onError={() => handleImgError('snacks')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🍿</span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-serif font-bold text-ink truncate">Snacks</span>
              <span className="text-[9px] bg-forest/10 text-forest font-bold px-1 rounded">₹20</span>
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setSelectedCategory('coconut')}
            className="w-28 shrink-0 bg-paper border border-hairline rounded-xl p-2 shadow-xs space-y-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-16 rounded-lg overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.coconut ? (
                <img
                  src="https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=300&q=80"
                  alt="Tender Coconut"
                  onError={() => handleImgError('coconut')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🥥</span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-serif font-bold text-ink truncate">Coconut</span>
              <span className="text-[9px] bg-saffron-base/20 text-ink font-bold px-1 rounded">₹45</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View (lg:grid lg:grid-cols-12) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-forest/10 text-forest rounded-full text-xs font-semibold tracking-wide border border-forest/20">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse-emerald" />
            <span>NBS Tech Solutions • Kirana at Delivery Speed</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-bold text-ink leading-[1.1] tracking-tight">
            {language === 'te' ? (
              <>
                మీ ఇంటి దరిచేరే <span className="font-serif italic text-saffron-gradient font-normal">15-నిమిషాల స్పీడ్</span> కిరాణా.
              </>
            ) : (
              <>
                Your neighborhood grocer, running at{' '}
                <span className="font-serif italic text-saffron-gradient font-normal">
                  15-minute speed.
                </span>
              </>
            )}
          </h1>

          <p className="text-ink-soft text-sm sm:text-base font-sans leading-relaxed max-w-lg">
            {language === 'te'
              ? 'సోనా మసూరి బియ్యం, స్వచ్ఛమైన నెయ్యి, తాజా పాలు, స్నాక్స్, పచ్చళ్ళు, పూజ సామగ్రి మరియు కరెంటు బిల్లుల చెల్లింపులు నేరుగా మీ ఇంటి వద్దకే.'
              : 'Fresh Sona Masoori rice, unpolished dal, pure ghee, morning milk, snacks, cold drinks, pickles, daily pooja items, and utility bill payments delivered straight to your doorstep.'}
          </p>

          {/* Feature Badges & Delivery Threshold Notice */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isEmergencyReady ? (
              <div className="px-4 py-2.5 bg-saffron-gradient text-ink rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
                <Zap className="w-4 h-4 fill-ink" />
                <span>Emergency 15-min delivery available</span>
              </div>
            ) : !isStoreOpen ? (
              <div className="px-4 py-2.5 bg-kumkum/10 text-kumkum rounded-xl text-xs font-bold border border-kumkum/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-kumkum" />
                <span>Store currently closed for deliveries</span>
              </div>
            ) : (
              <div className="px-4 py-2.5 bg-cardcream text-ink-soft rounded-xl text-xs font-bold border border-hairline flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest" />
                <span>Normal slot delivery active</span>
              </div>
            )}

            <div className="px-4 py-2.5 bg-forest text-paper rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-saffron-highlight" />
              <span>FREE Delivery on orders over ₹199</span>
            </div>
          </div>

          {/* Utility Quick Actions Bar */}
          <div className="pt-2 flex items-center gap-3 text-xs">
            <button
              onClick={() => openUtilityModal('electricity')}
              className="px-3.5 py-1.5 bg-cardcream hover:bg-paper text-ink font-semibold rounded-xl border border-hairline transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-saffron-base" />
              <span>Pay Electricity Bill</span>
            </button>
            <button
              onClick={() => openUtilityModal('dth_mobile')}
              className="px-3.5 py-1.5 bg-cardcream hover:bg-paper text-ink font-semibold rounded-xl border border-hairline transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest" />
              <span>Mobile / DTH Recharge</span>
            </button>
          </div>
        </div>

        {/* Hero Right 2D High-Res Visual Collage */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 relative">
          
          {/* Card 1: Rice & Dal */}
          <div
            onClick={() => setSelectedCategory('grocery')}
            className="group bg-paper border border-hairline rounded-crate p-3.5 shadow-md space-y-2 transform transition-all hover:-translate-y-1 cursor-pointer hover:border-forest/40"
            title="Browse Grocery & Staples"
          >
            <div className="w-full h-28 rounded-xl overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.rice ? (
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
                  alt="Sona Masoori Rice"
                  onError={() => handleImgError('rice')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">🌾</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-ink truncate group-hover:text-forest transition-colors">Raw Rice & Dal</span>
              <span className="text-[10px] bg-forest/10 text-forest font-bold px-1.5 py-0.5 rounded">₹340</span>
            </div>
          </div>

          {/* Card 2: Fresh Milk & Dairy */}
          <div
            onClick={() => setSelectedCategory('milk')}
            className="group bg-paper border border-hairline rounded-crate p-3.5 shadow-md space-y-2 transform transition-all hover:-translate-y-1 mt-4 cursor-pointer hover:border-forest/40"
            title="Browse Milk & Dairy"
          >
            <div className="w-full h-28 rounded-xl overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.milk ? (
                <img
                  src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh Milk"
                  onError={() => handleImgError('milk')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">🥛</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-ink truncate group-hover:text-forest transition-colors">Heritage Milk</span>
              <span className="text-[10px] bg-saffron-base/20 text-ink font-bold px-1.5 py-0.5 rounded">₹32</span>
            </div>
          </div>

          {/* Card 3: Kurkure Snacks */}
          <div
            onClick={() => setSelectedCategory('snacks')}
            className="group bg-paper border border-hairline rounded-crate p-3.5 shadow-md space-y-2 transform transition-all hover:-translate-y-1 cursor-pointer hover:border-forest/40"
            title="Browse Namkeen & Snacks"
          >
            <div className="w-full h-28 rounded-xl overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.snacks ? (
                <img
                  src="https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=600&q=80"
                  alt="Kurkure Snacks"
                  onError={() => handleImgError('snacks')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">🍿</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-ink truncate group-hover:text-forest transition-colors">Kurkure Snacks</span>
              <span className="text-[10px] bg-forest/10 text-forest font-bold px-1.5 py-0.5 rounded">₹20</span>
            </div>
          </div>

          {/* Card 4: Tender Coconut */}
          <div
            onClick={() => setSelectedCategory('coconut')}
            className="group bg-paper border border-hairline rounded-crate p-3.5 shadow-md space-y-2 transform transition-all hover:-translate-y-1 -mt-2 cursor-pointer hover:border-forest/40"
            title="Browse Coconut & Fresh Produce"
          >
            <div className="w-full h-28 rounded-xl overflow-hidden bg-cardcream flex items-center justify-center">
              {!failedImages.coconut ? (
                <img
                  src="https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80"
                  alt="Tender Coconut"
                  onError={() => handleImgError('coconut')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">🥥</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-ink truncate group-hover:text-forest transition-colors">Tender Coconut</span>
              <span className="text-[10px] bg-saffron-base/20 text-ink font-bold px-1.5 py-0.5 rounded">₹45</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
