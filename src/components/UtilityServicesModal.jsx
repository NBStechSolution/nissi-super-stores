import React, { useState } from 'react';
import { X, Zap, Tv, Smartphone, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function UtilityServicesModal() {
  const { isUtilityModalOpen, setIsUtilityModalOpen, utilityType } = useStore();
  const normalizeTab = (t) => (t === 'dth_mobile' ? 'mobile' : (t === 'dth' || t === 'mobile' || t === 'electricity' ? t : 'electricity'));
  const [tab, setTab] = useState(() => normalizeTab(utilityType));
  const [consumerNo, setConsumerNo] = useState('');
  const [biller, setBiller] = useState('TSSPDCL - Telangana Southern Power');
  const [amount, setAmount] = useState('840');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [copiedTxn, setCopiedTxn] = useState(false);

  if (!isUtilityModalOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const generatedTxn = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    setTxnId(generatedTxn);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsPaid(false);
    setIsProcessing(false);
    setIsUtilityModalOpen(false);
  };

  return (
    <div
      onClick={handleResetAndClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-scale-up max-sm:animate-slide-up max-h-[92vh] overflow-y-auto safe-area-bottom"
      >

        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-1" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Service Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-saffron-base/20 text-ink rounded-xl border border-saffron-base/30">
              <Zap className="w-5 h-5 text-saffron-base" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-ink">Bill Pay & Mobile Recharge</h2>
              <p className="text-xs text-ink-soft font-sans">0% convenience fee • Instant receipt confirmation</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-bold pt-1">
            <button
              onClick={() => {
                setTab('electricity');
                setIsPaid(false);
              }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                tab === 'electricity'
                  ? 'bg-forest text-paper border-forest shadow-xs'
                  : 'bg-cardcream text-ink-soft border-hairline'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Electricity
            </button>
            <button
              onClick={() => {
                setTab('dth');
                setIsPaid(false);
              }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                tab === 'dth'
                  ? 'bg-forest text-paper border-forest shadow-xs'
                  : 'bg-cardcream text-ink-soft border-hairline'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> DTH Bill
            </button>
            <button
              onClick={() => {
                setTab('mobile');
                setIsPaid(false);
              }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                tab === 'mobile'
                  ? 'bg-forest text-paper border-forest shadow-xs'
                  : 'bg-cardcream text-ink-soft border-hairline'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>

        {isPaid ? (
          <div className="p-8 text-center bg-forest/10 border border-forest/20 rounded-2xl space-y-3.5 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-forest mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-lg text-forest">Payment Successful!</h3>
            <div className="p-3 bg-paper rounded-xl border border-hairline inline-flex items-center gap-2">
              <span className="text-xs text-ink-soft">Ref:</span>
              <span className="font-mono font-bold text-xs text-forest">{txnId}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(txnId);
                  setCopiedTxn(true);
                  setTimeout(() => setCopiedTxn(false), 2000);
                }}
                className="px-2 py-0.5 text-[10px] font-bold bg-cardcream hover:bg-forest/10 text-ink rounded border border-hairline transition-colors"
              >
                {copiedTxn ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-ink-soft">
              Paid <strong className="text-ink">₹{amount}</strong> for {biller || tab.toUpperCase()}
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-2 px-5 py-2 bg-forest text-paper font-bold rounded-xl text-xs shadow-md hover:bg-forest-soft transition-all"
            >
              Done & Return to Store
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4 text-xs">

            {tab === 'electricity' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Select Electricity Board</label>
                  <select
                    value={biller}
                    onChange={(e) => setBiller(e.target.value)}
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-semibold focus:outline-none"
                  >
                    <option value="TSSPDCL - Telangana Southern Power">TSSPDCL - Telangana Southern Power</option>
                    <option value="TSNPDCL - Telangana Northern Power">TSNPDCL - Telangana Northern Power</option>
                    <option value="APCPDCL - Andhra Pradesh Central Power">APCPDCL - Andhra Pradesh Central Power</option>
                    <option value="APEPDCL - Andhra Pradesh Eastern Power">APEPDCL - Andhra Pradesh Eastern Power</option>
                    <option value="BESCOM - Bangalore Electricity Supply">BESCOM - Bangalore Electricity Supply</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Unique Consumer Service Number (USC)</label>
                  <input
                    type="text"
                    required
                    value={consumerNo}
                    onChange={(e) => setConsumerNo(e.target.value)}
                    placeholder="e.g. 109823471"
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Bill Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-forest font-mono font-bold text-base focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            )}

            {tab === 'dth' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Select DTH Provider</label>
                  <select
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-semibold focus:outline-none"
                  >
                    <option value="Tata Play">Tata Play (formerly Tata Sky)</option>
                    <option value="Airtel Digital TV">Airtel Digital TV</option>
                    <option value="Sun Direct">Sun Direct DTH</option>
                    <option value="Dish TV">Dish TV India</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Subscriber ID / Smartcard No.</label>
                  <input
                    type="text"
                    required
                    defaultValue="1029384756"
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Recharge Pack Amount (₹)</label>
                  <input
                    type="number"
                    required
                    defaultValue="349"
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-forest font-mono font-bold text-base focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            )}

            {tab === 'mobile' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Mobile Number & Operator</label>
                  <input
                    type="tel"
                    required
                    defaultValue="98490 12345"
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Select Plan</label>
                  <select
                    className="w-full p-2.5 bg-cardcream rounded-xl border border-hairline text-ink font-semibold focus:outline-none"
                  >
                    <option value="299">₹299 - 1.5GB/day (28 Days + Unlimited Calls)</option>
                    <option value="719">₹719 - 1.5GB/day (84 Days + Unlimited Calls)</option>
                    <option value="199">₹199 - 1GB/day (21 Days)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-saffron-gradient text-ink font-bold rounded-xl text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Biller Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay & Confirm Recharge</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-ink-soft flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Direct Bank Settlement with Instant Receipt</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
