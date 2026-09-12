import React, { Suspense, lazy } from 'react';
import { Lock } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import Hero2D from './components/Hero2D';
import CategoryRail from './components/CategoryRail';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import LoginModal from './components/LoginModal';
import UtilityServicesModal from './components/UtilityServicesModal';
import SubscriptionsModal from './components/SubscriptionsModal';
import QuickAddProductModal from './components/QuickAddProductModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import BottomNav from './components/BottomNav';

// Code-split heavy views for fastest initial customer storefront load
const CheckoutView = lazy(() => import('./components/CheckoutView'));
const OrderTrackingView = lazy(() => import('./components/OrderTrackingView'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const DeliveryStaffView = lazy(() => import('./components/DeliveryStaffView'));

function MainContent() {
  const {
    activeView,
    setActiveView,
    isHolidayClosed,
    holidayReason,
    isAdminOrStaff,
    setIsLoginOpen,
    storeAnnouncement,
    userPhone,
    userName,
    utilityType,
    toggleManagerMode
  } = useStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8">

      {/* Network Offline Notification Banner */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-kumkum text-paper rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>⚠️ You are currently offline. Orders and updates will sync automatically once reconnected.</span>
          <span className="text-[10px] bg-paper/20 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Offline</span>
        </div>
      )}

      {/* Holiday Store Closed Notice */}
      {isHolidayClosed && (
        <div className="mb-6 p-4 bg-kumkum/10 border border-kumkum/30 text-kumkum rounded-crate text-xs font-semibold flex items-center justify-between">
          <span>📢 Notice: Store is currently paused due to {holidayReason}. Online orders will resume shortly.</span>
        </div>
      )}

      {/* Live Store Announcement Banner */}
      {storeAnnouncement?.enabled && storeAnnouncement?.text && activeView === 'home' && (
        <div className="mb-5 p-3.5 bg-forest text-paper rounded-2xl text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">📢</span>
            <span className="font-sans leading-snug">{storeAnnouncement.text}</span>
          </div>
          <span className="text-[10px] bg-paper/20 text-paper px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-3 hidden sm:inline">
            Notice
          </span>
        </div>
      )}

      {activeView === 'home' && (
        <div className="space-y-6">
          <Hero2D />
          <CategoryRail />
          <ProductGrid />
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-forest/30 border-t-forest rounded-full animate-spin" />
            <span className="text-xs font-bold text-ink-soft">Loading view...</span>
          </div>
        }
      >
        {activeView === 'checkout' && <CheckoutView key={`${userPhone}-${userName}`} />}
        {activeView === 'tracking' && <OrderTrackingView />}
      </Suspense>

      {/* Access Protection: Restricted strictly to authorized store management */}
      {(activeView === 'admin' || activeView === 'staff') && !isAdminOrStaff && (
        <div className="max-w-md mx-auto my-12 p-8 bg-cardcream border border-hairline rounded-crate text-center space-y-5 shadow-crate">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-kumkum/10 text-kumkum border border-kumkum/20 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-kumkum/10 text-kumkum border border-kumkum/20">
              Restricted Access
            </span>
            <h2 className="mt-2 font-serif font-bold text-xl text-ink">
              {activeView === 'admin' ? 'Store Admin Center' : 'Delivery Rider Portal'}
            </h2>
            <p className="mt-2 text-xs text-ink-soft leading-relaxed">
              This portal is restricted to authorized store management and staff only. Please sign in with your authorized account.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => toggleManagerMode(true)}
              className="w-full py-3 bg-forest text-paper font-bold text-xs rounded-xl shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <span>✨ Unlock Store Manager Access (Add & Delete Items)</span>
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-2.5 bg-cardcream hover:bg-paper text-ink font-semibold text-xs rounded-xl border border-hairline transition-colors"
            >
              Sign In with Mobile
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="w-full py-2 bg-transparent text-ink-soft hover:text-ink font-semibold text-xs transition-colors"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      )}

      {/* Authorized Staff / Admin Portal */}
      {(activeView === 'admin' || activeView === 'staff') && isAdminOrStaff && (
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-forest/30 border-t-forest rounded-full animate-spin" />
              <span className="text-xs font-bold text-ink-soft">Loading portal...</span>
            </div>
          }
        >
          {activeView === 'admin' && <AdminDashboard />}
          {activeView === 'staff' && <DeliveryStaffView />}
        </Suspense>
      )}

      {/* Global Overlays */}
      <ProductModal />
      <CartDrawer />
      <LoginModal key={`login-${userPhone}-${userName}`} />
      <UtilityServicesModal key={`util-${utilityType}`} />
      <SubscriptionsModal />
      <QuickAddProductModal />
      <DeleteConfirmationModal />
    </main>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-saffron-highlight selection:text-ink">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Mobile Quick-Commerce Bottom Navigation & Floating Cart */}
        <BottomNav />

        {/* Footer */}
        <footer className="border-t border-hairline bg-cardcream/60 py-6 mt-12 mb-16 md:mb-0 text-xs text-ink-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="Nissi Logo"
                className="w-10 h-10 rounded-full object-cover shadow-xs ring-1 ring-forest/30 shrink-0"
              />
              <div>
                <p className="font-serif font-semibold text-sm text-ink">Nissi Super Stores</p>
                <p className="text-[11px] text-ink-soft/80">
                  Kirana at Delivery Speed • Developed by <span className="font-semibold text-forest">NBS Tech Solutions</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium">
              <span className="text-forest font-bold">FREE Delivery over ₹199</span>
              <span>•</span>
              <span>₹10 Charge under ₹199</span>
              <span>•</span>
              <span>Target 15-Min Emergency Delivery</span>
              <span>•</span>
              <span>Telugu / English Interface</span>
            </div>
          </div>
        </footer>
      </div>
    </StoreProvider>
  );
}
