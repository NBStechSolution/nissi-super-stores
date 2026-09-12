import React from 'react';
import { ShoppingBag, Store, Clock, Zap, Tag, User, Globe, Truck, ArrowLeft, Calendar } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const {
    isStoreOpen,
    setIsStoreOpen,
    normalWindow,
    cartItemCount,
    setIsCartOpen,
    activeView,
    setActiveView,
    language,
    setLanguage,
    t,
    isLoggedIn,
    userName,
    isAdminOrStaff,
    setIsLoginOpen,
    storeAnnouncement,
    openSubscriptionModal,
    subscriptions
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-hairline shadow-xs transition-all duration-200">
      {/* Real-time Announcement Ticker from Admin/Store */}
      {storeAnnouncement?.enabled && storeAnnouncement?.text && (
        <div className="bg-forest text-paper px-4 py-1.5 text-xs text-center font-medium border-b border-forest-soft flex items-center justify-center gap-2 overflow-hidden animate-fade-in">
          <span className="shrink-0 text-saffron-highlight text-[10px] font-bold uppercase tracking-wider bg-paper/15 px-2 py-0.5 rounded-md">
            Notice
          </span>
          <span className="truncate max-w-3xl text-[11px]">{storeAnnouncement.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0" onClick={() => setActiveView('home')}>
          <img
            src="/logo.jpeg"
            alt="Nissi Super Stores Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-md ring-2 ring-forest/30 group-hover:ring-forest group-hover:scale-105 transition-all duration-300 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-bold text-base sm:text-xl text-ink tracking-tight truncate group-hover:text-forest transition-colors">
                {t('storeName', 'Nissi Super Stores')}
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-saffron-base/20 text-ink font-bold rounded-full border border-saffron-base/40 shrink-0">
                Kirana
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-ink-soft font-sans tracking-wide">
              by NBS Tech Solutions
            </p>
          </div>
        </div>

        {/* Store Status Badge & Delivery Window Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          {/* Desktop & Tablet Store Status (Hidden on mobile to save space for customers) */}
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all duration-200 ${
              isStoreOpen
                ? 'bg-forest/10 border-forest/30 text-forest hover:bg-forest/20'
                : 'bg-kumkum/10 border-kumkum/30 text-kumkum hover:bg-kumkum/20'
            }`}
            title="Click to toggle store status"
          >
            <span
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                isStoreOpen ? 'bg-forest animate-pulse-emerald' : 'bg-kumkum'
              }`}
            />
            <span>{isStoreOpen ? t('storeOpen', 'Open') : t('storeClosed', 'Closed')}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-cardcream border border-hairline rounded-full text-xs text-ink font-medium shadow-xs">
            <Tag className="w-3.5 h-3.5 text-saffron-base" />
            <span>{t('freeDeliveryOver199', 'FREE Delivery over ₹199')}</span>
            <span className="text-ink-soft/40">•</span>
            <Clock className="w-3.5 h-3.5 text-forest" />
            <span>{normalWindow}</span>
          </div>
        </div>

        {/* Right Actions, Language Toggle & User Login */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Language Selector (English / Telugu) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-cardcream hover:bg-paper text-ink font-bold rounded-xl border border-hairline text-xs transition-colors"
            title="Switch Language / భాషను మార్చండి"
          >
            <Globe className="w-3.5 h-3.5 text-forest" />
            <span className="text-[11px] sm:text-xs">{language === 'en' ? 'తెలుగు' : 'EN'}</span>
          </button>

          {/* Morning Essentials 6:30 AM Pass */}
          <button
            onClick={() => openSubscriptionModal()}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-cardcream hover:bg-paper text-ink font-semibold rounded-xl border border-hairline text-xs transition-colors shadow-xs"
            title="Manage 6:30 AM Morning Milk & Daily Essentials"
          >
            <Calendar className="w-3.5 h-3.5 text-forest" />
            <span className="hidden sm:inline">{language === 'te' ? 'ఉదయం డెలివరీ' : 'Morning Pass'}</span>
            <span className="text-[10px] font-mono font-bold bg-forest/15 text-forest px-1.5 py-0.5 rounded-full leading-none">
              {subscriptions?.length || 0}
            </span>
          </button>

          {/* Customer Login Button (Desktop only, mobile has BottomNav) */}
          <button
            onClick={() => setIsLoginOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cardcream hover:bg-paper text-ink font-semibold rounded-xl border border-hairline text-xs transition-colors"
          >
            <User className="w-3.5 h-3.5 text-forest" />
            <span>{isLoggedIn ? (userName || 'Account') : t('login', 'Login')}</span>
          </button>

          {/* Desktop View Toggle Buttons */}
          {(activeView === 'admin' || activeView === 'staff') ? (
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-forest hover:bg-forest/90 text-paper font-bold rounded-xl shadow-xs text-xs transition-all animate-fade-in"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px] sm:text-xs">Store</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('home')}
              className={`hidden md:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'home'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'bg-cardcream/80 text-ink-soft hover:bg-cardcream'
              }`}
            >
              Browse
            </button>
          )}

          <button
            onClick={() => setActiveView('tracking')}
            className={`hidden md:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-all items-center gap-1 ${
              activeView === 'tracking'
                ? 'bg-forest text-paper shadow-sm'
                : 'bg-cardcream/80 text-ink-soft hover:bg-cardcream'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-saffron-highlight" />
            <span>{t('trackOrder', 'Track Order')}</span>
          </button>

          {isAdminOrStaff && (
            <>
              <button
                onClick={() => setActiveView('staff')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  activeView === 'staff'
                    ? 'bg-forest text-paper border-forest shadow-sm'
                    : 'bg-cardcream/60 border-hairline text-ink-soft hover:bg-cardcream'
                }`}
                title="Delivery Staff Portal"
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('staffView', 'Rider')}</span>
              </button>

              <button
                onClick={() => setActiveView('admin')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'bg-ink text-paper border-ink shadow-sm'
                    : 'bg-cardcream/60 border-hairline text-ink-soft hover:bg-cardcream'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('admin', 'Admin')}</span>
              </button>
            </>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-saffron-gradient text-ink rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center font-bold"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-kumkum text-paper text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-paper animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
