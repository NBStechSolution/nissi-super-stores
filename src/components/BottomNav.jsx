import React from 'react';
import { Store, Layers, Package, User, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function BottomNav() {
  const {
    activeView,
    setActiveView,
    cartItemCount,
    grandTotal,
    setIsCartOpen,
    isLoggedIn,
    userName,
    setIsLoginOpen,
    setSelectedCategory,
    t,
    language
  } = useStore();

  const handleCategoryTab = () => {
    setActiveView('home');
    const catRail = document.getElementById('category-rail-section');
    if (catRail) {
      catRail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setSelectedCategory('all');
    }
  };

  const handleStoreTab = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activeView === 'home';
  const isTracking = activeView === 'tracking';

  return (
    <>
      {/* Floating Quick-Commerce Cart Pill on Mobile */}
      {cartItemCount > 0 && activeView !== 'checkout' && (
        <div className="md:hidden fixed bottom-18 left-3 right-3 z-40 animate-slide-up pointer-events-auto">
          <div
            onClick={() => setIsCartOpen(true)}
            className="flex items-center justify-between px-4 py-3 bg-forest text-paper rounded-2xl shadow-xl border border-forest-soft cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 bg-paper/20 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-paper" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron-base text-ink font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold font-mono tracking-tight text-saffron-highlight">
                  ₹{grandTotal}
                </div>
                <div className="text-[10px] text-paper/80 font-sans">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in basket
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper text-ink font-bold text-xs rounded-xl shadow-xs">
              <span>{t('viewCart', language === 'te' ? 'కార్ట్ చూడండి' : 'View Cart')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      )}

      {/* Modern App Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-lg border-t border-hairline shadow-2xl px-2 py-1.5 safe-area-bottom">
        <div className="grid grid-cols-4 items-center">
          
          {/* 1. Store / Home */}
          <button
            onClick={handleStoreTab}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isHome
                ? 'text-forest font-bold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isHome ? 'bg-forest/10' : ''}`}>
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {t('store', language === 'te' ? 'స్టోర్' : 'Store')}
            </span>
          </button>

          {/* 2. Categories */}
          <button
            onClick={handleCategoryTab}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-ink-soft hover:text-ink transition-all"
          >
            <div className="p-1 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {t('categories', language === 'te' ? 'విభాగాలు' : 'Categories')}
            </span>
          </button>

          {/* 3. Orders / Tracking */}
          <button
            onClick={() => setActiveView('tracking')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isTracking
                ? 'text-forest font-bold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isTracking ? 'bg-forest/10' : ''}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {t('orders', language === 'te' ? 'ఆర్డర్లు' : 'Orders')}
            </span>
          </button>

          {/* 4. Account */}
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-ink-soft hover:text-ink transition-all"
          >
            <div className={`p-1 rounded-xl ${isLoggedIn ? 'bg-forest/10 text-forest' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[65px]">
              {isLoggedIn ? (userName ? userName.split(' ')[0] : 'Profile') : t('login', 'Account')}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
