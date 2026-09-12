import React, { useState } from 'react';
import { X, Phone, Lock, CheckCircle2, MapPin, User, ShieldCheck, Store, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function LoginModal() {
  const {
    isLoginOpen,
    setIsLoginOpen,
    loginWithOtp,
    isLoggedIn,
    userName,
    userPhone,
    logout,
    savedAddresses,
    isAdminOrStaff,
    setActiveView
  } = useStore();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState(userPhone || '');
  const [name, setName] = useState(userName || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!isLoginOpen) return null;

  const handleClose = () => {
    setIsLoginOpen(false);
    setError('');
    if (!isLoggedIn) {
      setStep('phone');
      setOtp('');
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
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
    setStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const finalOtp = otp.trim() || '1234';
    if (finalOtp.length >= 4) {
      loginWithOtp(phone, name);
      setStep('phone');
      setOtp('');
    } else {
      setError('Please enter a valid OTP code (e.g. 1234).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-paper border border-hairline rounded-crate p-6 shadow-2xl space-y-5 animate-scale-up">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoggedIn ? (
          /* Profile & Session View */
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3.5 bg-cardcream rounded-2xl border border-hairline">
              <div className="w-12 h-12 rounded-xl bg-forest text-paper flex items-center justify-center font-bold text-lg font-serif">
                {(userName || 'U').charAt(0)}
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
                  {isAdminOrStaff ? '✓ Full Management & Rider Privileges' : 'Verified Customer'}
                </span>
              </div>
            </div>

            {/* Quick Staff / Admin Navigation if authorized */}
            {isAdminOrStaff && (
              <div className="p-3 bg-forest/10 border border-forest/20 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administrative Shortcuts</span>
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
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedAddresses.map((addr) => (
                  <div key={addr.id} className="p-3 bg-cardcream/60 border border-hairline rounded-xl text-xs space-y-1">
                    <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded text-[10px]">
                      {addr.tag}
                    </span>
                    <p className="text-ink-soft">{addr.address}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-2.5 bg-kumkum/10 text-kumkum font-semibold text-xs rounded-xl border border-kumkum/30 hover:bg-kumkum/20 transition-colors"
            >
              Sign Out Account
            </button>
          </div>
        ) : step === 'phone' ? (
          /* Step 1: Phone Number Input */
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-forest/10 text-forest rounded-2xl flex items-center justify-center mx-auto mb-2 border border-forest/20">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-xl text-ink">Account Login</h2>
              <p className="text-xs text-ink-soft">Enter your details to sign in with OTP verification</p>
            </div>

            {error && (
              <div className="p-2.5 bg-kumkum/10 border border-kumkum/30 rounded-xl text-xs text-kumkum text-center">
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
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-sans focus:outline-none focus:border-forest"
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
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-3 py-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-saffron-gradient text-ink font-bold rounded-xl text-xs shadow-md hover:brightness-105 transition-all"
            >
              Get OTP Verification Code
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-saffron-base/20 text-ink rounded-2xl flex items-center justify-center mx-auto mb-2 border border-saffron-base/40">
                <Lock className="w-6 h-6 text-saffron-base" />
              </div>
              <h2 className="font-serif font-bold text-xl text-ink">Verify OTP</h2>
              <p className="text-xs text-ink-soft">Enter 4-digit code sent to +91 {phone}</p>
            </div>

            {error && (
              <div className="p-2.5 bg-kumkum/10 border border-kumkum/30 rounded-xl text-xs text-kumkum text-center">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-soft mb-1 text-center">Enter 4-Digit Security Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-2.5 bg-cardcream rounded-xl border border-hairline text-forest placeholder:text-ink-soft/30 focus:outline-none focus:border-forest"
                  autoFocus
                />
                <p className="text-[11px] text-center text-ink-soft/70 mt-1.5 flex items-center justify-center gap-1">
                  <span>Demo access code:</span>
                  <button
                    type="button"
                    onClick={() => setOtp('1234')}
                    className="font-mono font-bold text-forest bg-forest/10 px-2 py-0.5 rounded text-[10px] hover:bg-forest/20 transition-colors"
                  >
                    1234 (Tap to Fill)
                  </button>
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-forest text-paper font-bold rounded-xl text-xs shadow-md hover:bg-forest-soft transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Continue</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setError('');
              }}
              className="w-full text-center text-xs text-ink-soft underline"
            >
              Change Mobile Number
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
