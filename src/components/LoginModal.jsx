import React, { useState } from 'react';
import { X, Phone, CheckCircle2, MapPin, User, ShieldCheck, Store, Truck, Lock, Package, Calendar, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function LoginModal() {
  const {
    isLoginOpen,
    setIsLoginOpen,
    loginPromptMessage,
    setLoginPromptMessage,
    loginDirect,
    isLoggedIn,
    userName,
    userPhone,
    logout,
    savedAddresses,
    isAdminOrStaff,
    authenticateAdmin,
    revokeAdminAuth,
    openSubscriptionModal,
    orders,
    setActiveView
  } = useStore();

  const [phone, setPhone] = useState(userPhone || '');
  const [name, setName] = useState(userName || '');
  const [error, setError] = useState('');

  // Admin PIN prompt state
  const [showAdminPinInput, setShowAdminPinInput] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminPinSuccess, setAdminPinSuccess] = useState('');

  if (!isLoginOpen) return null;

  const handleClose = () => {
    setIsLoginOpen(false);
    setError('');
    setShowAdminPinInput(false);
    setAdminPin('');
    setAdminPinError('');
    setAdminPinSuccess('');
    if (setLoginPromptMessage) setLoginPromptMessage('');
  };

  const handleDirectLogin = (e) => {
    e?.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    loginDirect(name.trim(), digits.slice(-10));
    setIsLoginOpen(false);
  };

  const handleVerifyAdminPin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    const res = authenticateAdmin(adminPin);
    if (res.success) {
      setAdminPinSuccess('Admin privileges unlocked!');
      setTimeout(() => {
        setShowAdminPinInput(false);
        setAdminPin('');
        setAdminPinSuccess('');
      }, 800);
    } else {
      setAdminPinError(res.message || 'Incorrect PIN.');
    }
  };

  const activeCustomerOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto safe-area-bottom animate-scale-up"
      >
        {/* Mobile Sheet Drag Indicator */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-2" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoggedIn ? (
          /* Profile & Session View */
          <div className="space-y-4 pt-1">
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-3.5 bg-cardcream rounded-2xl border border-hairline">
              <div className="w-12 h-12 rounded-xl bg-forest text-paper flex items-center justify-center font-bold text-lg font-serif shrink-0">
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-ink truncate">{userName}</h3>
                  {isAdminOrStaff ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-saffron-base/20 text-ink border border-saffron-base/40 shrink-0">
                      Store Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest/10 text-forest border border-forest/20 shrink-0">
                      Verified Customer
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft font-mono">+91 {userPhone}</p>
                <span className="text-[10px] text-forest font-semibold">
                  {isAdminOrStaff ? '✓ Full Management & Rider Privileges' : '✓ Nissi Super Stores Member'}
                </span>
              </div>
            </div>

            {/* STORE ADMIN CONTROLS (ONLY if authenticated as Admin) */}
            {isAdminOrStaff && (
              <div className="p-3.5 bg-forest/10 border border-forest/20 rounded-2xl space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-forest">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Store Management Portals</span>
                  </div>
                  <span className="text-[10px] bg-forest/20 px-2 py-0.5 rounded-full">Authorized</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setIsLoginOpen(false);
                    }}
                    className="py-2.5 px-3 bg-ink text-paper rounded-xl text-xs font-bold hover:bg-ink/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Admin Center</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('staff');
                      setIsLoginOpen(false);
                    }}
                    className="py-2.5 px-3 bg-forest text-paper rounded-xl text-xs font-bold hover:bg-forest-soft transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Rider Portal</span>
                  </button>
                </div>
                <button
                  onClick={revokeAdminAuth}
                  className="w-full py-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink transition-colors flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock Admin Mode (Switch to Customer View)</span>
                </button>
              </div>
            )}

            {/* CUSTOMER ACTIONS (Shown to regular customers) */}
            {!isAdminOrStaff && (
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveView('tracking');
                    setIsLoginOpen(false);
                  }}
                  className="p-3 bg-cardcream/80 hover:bg-cardcream border border-hairline rounded-xl text-left space-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-forest">
                    <Package className="w-4 h-4" />
                    {activeCustomerOrders.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-saffron-base animate-ping" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-ink">My Orders</div>
                    <div className="text-[10px] text-ink-soft">
                      {activeCustomerOrders.length > 0 ? `${activeCustomerOrders.length} active delivery` : 'Track order status'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsLoginOpen(false);
                    if (openSubscriptionModal) openSubscriptionModal();
                  }}
                  className="p-3 bg-cardcream/80 hover:bg-cardcream border border-hairline rounded-xl text-left space-y-1 transition-all flex flex-col justify-between"
                >
                  <Calendar className="w-4 h-4 text-forest" />
                  <div>
                    <div className="font-bold text-ink">Morning Pass</div>
                    <div className="text-[10px] text-ink-soft">6:30 AM Essentials</div>
                  </div>
                </button>
              </div>
            )}

            {/* Saved Delivery Addresses */}
            <div className="space-y-2">
              <h4 className="font-serif font-semibold text-xs text-ink flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>Saved Delivery Addresses</span>
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {savedAddresses.length > 0 ? (
                  savedAddresses.map((addr) => (
                    <div key={addr.id} className="p-3 bg-cardcream/60 border border-hairline rounded-xl text-xs space-y-1">
                      <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded text-[10px]">
                        {addr.tag}
                      </span>
                      <p className="text-ink-soft leading-snug">{addr.address}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-ink-soft italic p-3 bg-cardcream/40 rounded-xl border border-dashed border-hairline text-center">
                    No saved addresses yet. Enter your address during checkout and it will be remembered automatically.
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Store Help */}
            <a
              href="https://wa.me/919989069151?text=Hi%20Nissi%20Super%20Stores%2C%20I%20need%20assistance%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-forest/10 hover:bg-forest/20 text-forest font-bold text-xs rounded-xl border border-forest/30 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Store Support on WhatsApp</span>
            </a>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="w-full py-2.5 bg-kumkum/10 text-kumkum font-semibold text-xs rounded-xl border border-kumkum/30 hover:bg-kumkum/20 transition-colors cursor-pointer"
            >
              Sign Out Account
            </button>

            {/* Staff / Admin PIN Login Gate */}
            {!isAdminOrStaff && (
              <div className="pt-2 border-t border-hairline/60">
                {!showAdminPinInput ? (
                  <button
                    type="button"
                    onClick={() => setShowAdminPinInput(true)}
                    className="w-full py-1 text-[11px] text-ink-soft/70 hover:text-forest transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Store Staff or Owner? Enter Admin PIN</span>
                  </button>
                ) : (
                  <form onSubmit={handleVerifyAdminPin} className="p-3 bg-cardcream/80 border border-hairline rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1">
                        <Lock className="w-3 h-3 text-forest" />
                        <span>Admin PIN Verification</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminPinInput(false);
                          setAdminPinError('');
                        }}
                        className="text-[11px] text-ink-soft hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>

                    {adminPinError && (
                      <div className="p-1.5 bg-kumkum/10 text-kumkum text-[11px] font-semibold rounded-lg text-center">
                        {adminPinError}
                      </div>
                    )}
                    {adminPinSuccess && (
                      <div className="p-1.5 bg-forest/10 text-forest text-[11px] font-semibold rounded-lg text-center">
                        {adminPinSuccess}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Enter 4-digit PIN"
                        className="flex-1 px-3 py-1.5 bg-paper rounded-lg border border-hairline text-xs font-mono text-center tracking-widest focus:outline-none focus:border-forest"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-forest text-paper text-xs font-bold rounded-lg hover:bg-forest-soft transition-colors cursor-pointer"
                      >
                        Unlock
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Instant 1-Step Direct Sign-in Form */
          <form onSubmit={handleDirectLogin} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-forest/10 text-forest rounded-2xl flex items-center justify-center mx-auto mb-2 border border-forest/20">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-xl text-ink">Welcome to Nissi</h2>
              <p className="text-xs text-ink-soft">Enter your details to sign in instantly (No OTP required)</p>
            </div>

            {loginPromptMessage && (
              <div className="p-3 bg-saffron-base/15 border border-saffron-base/40 rounded-2xl text-xs text-ink font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
                <span className="text-base shrink-0">🛍️</span>
                <span className="leading-snug">{loginPromptMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-kumkum/10 border border-kumkum/30 rounded-xl text-xs text-kumkum text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-soft mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kavitha Reddy"
                    className="w-full pl-9 pr-3 py-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-soft">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-12 pr-3 py-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-saffron-gradient text-ink font-bold rounded-xl text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign In Instantly</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
