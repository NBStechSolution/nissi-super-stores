import React, { useState } from 'react';
import { X, Phone, CheckCircle2, MapPin, User, ShieldCheck, Store, Truck } from 'lucide-react';
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
    setActiveView
  } = useStore();

  const [phone, setPhone] = useState(userPhone || '');
  const [name, setName] = useState(userName || '');
  const [error, setError] = useState('');

  if (!isLoginOpen) return null;

  const handleClose = () => {
    setIsLoginOpen(false);
    setError('');
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
    loginDirect(phone, name);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up max-sm:animate-slide-up max-h-[90vh] overflow-y-auto pb-safe"
      >

        {/* Mobile Swipe / Drag Indicator */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-1" />

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
            <div className="flex items-center gap-3 p-3.5 bg-cardcream rounded-2xl border border-hairline">
              <div className="w-12 h-12 rounded-xl bg-forest text-paper flex items-center justify-center font-bold text-lg font-serif shrink-0">
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-ink truncate">{userName}</h3>
                  {isAdminOrStaff && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-saffron-base/20 text-ink border border-saffron-base/40 shrink-0">
                      Store Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft font-mono">+91 {userPhone}</p>
                <span className="text-[10px] text-forest font-semibold">
                  {isAdminOrStaff ? '✓ Full Management & Rider Privileges' : '✓ Verified Customer'}
                </span>
              </div>
            </div>

            {/* Quick Staff / Admin Navigation if authorized */}
            {isAdminOrStaff && (
              <div className="p-3 bg-forest/10 border border-forest/20 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Management Portals</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setIsLoginOpen(false);
                    }}
                    className="py-2 px-3 bg-ink text-paper rounded-xl text-xs font-bold hover:bg-ink/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Admin Center</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('staff');
                      setIsLoginOpen(false);
                    }}
                    className="py-2 px-3 bg-forest text-paper rounded-xl text-xs font-bold hover:bg-forest-soft transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Rider Portal</span>
                  </button>
                </div>
              </div>
            )}

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
                    No saved addresses yet. Enter your address during checkout and it will be remembered.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-2.5 bg-kumkum/10 text-kumkum font-semibold text-xs rounded-xl border border-kumkum/30 hover:bg-kumkum/20 transition-colors"
            >
              Sign Out Account
            </button>
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
