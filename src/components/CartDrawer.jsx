import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    deliveryFee,
    MIN_ORDER_FREE_DELIVERY,
    amountNeededForFreeDelivery,
    grandTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    discountAmount,
    isLoggedIn,
    setIsLoginOpen,
    setLoginPromptMessage,
    setActiveView,
    products
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      setLoginPromptMessage('Please sign in with your mobile number to proceed to checkout.');
      setIsLoginOpen(true);
      return;
    }
    setIsCartOpen(false);
    setActiveView('checkout');
  };

  const freeDeliveryProgressPct = Math.min(100, (cartSubtotal / MIN_ORDER_FREE_DELIVERY) * 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-paper border-l border-hairline shadow-2xl flex flex-col justify-between pt-safe pb-safe"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-hairline bg-cardcream flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-forest text-paper rounded-xl shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-ink">Your Kirana Basket</h2>
                  <div className="flex items-center gap-2 text-[11px] text-ink-soft font-sans">
                    <span>
                      {cart.length} item{cart.length !== 1 ? 's' : ''} added
                    </span>
                    {cart.length > 0 && (
                      <>
                        <span>•</span>
                        <button
                          onClick={clearCart}
                          className="text-kumkum hover:underline font-semibold flex items-center gap-0.5"
                          title="Empty entire basket"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-ink-soft hover:text-ink bg-paper rounded-xl border border-hairline transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Delivery Threshold Progress Banner */}
            {cart.length > 0 && (
              <div className="bg-hero-gradient p-3.5 border-b border-hairline space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-ink">
                    <Tag className="w-3.5 h-3.5 text-saffron-base" />
                    {amountNeededForFreeDelivery > 0 ? (
                      <span>Add <strong className="text-saffron-base font-bold">₹{amountNeededForFreeDelivery}</strong> more for FREE delivery!</span>
                    ) : (
                      <span className="text-forest font-bold">🎉 You unlocked FREE Delivery!</span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-ink-soft font-bold">
                    ₹{cartSubtotal}/₹{MIN_ORDER_FREE_DELIVERY}
                  </span>
                </div>
                <div className="w-full h-2 bg-hairline/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saffron-gradient transition-all duration-300"
                    style={{ width: `${freeDeliveryProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="text-5xl">🛒</div>
                  <h3 className="font-serif font-semibold text-base text-ink">Your cart is empty</h3>
                  <p className="text-xs text-ink-soft max-w-xs leading-relaxed">
                    Explore raw rice, unpolished dal, fresh milk, pickles, or daily pooja items to fill your basket. Minimum order for free delivery is ₹199.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-5 py-2.5 bg-saffron-gradient text-ink font-bold rounded-xl text-xs shadow-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const liveProduct = products.find((p) => p.id === item.id);
                  const maxStock = liveProduct ? liveProduct.stock : item.stock;

                  return (
                    <div
                      key={item.id}
                      className="bg-cardcream border border-hairline rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 shadow-xs"
                    >
                      <div className="w-14 h-14 bg-paper rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-hairline/60">
                        {item.image2D ? (
                          <img
                            src={item.image2D}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{item.fallbackEmoji || '🧺'}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-semibold text-xs sm:text-sm text-ink truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-ink-soft font-sans mt-0.5">
                          <span>{item.unit}</span>
                          <span>•</span>
                          <span className="font-medium text-ink font-mono">₹{item.price}</span>
                          <span>•</span>
                          <span className="font-bold text-forest font-mono">
                            = ₹{item.price * item.quantity}
                          </span>
                        </div>
                        {item.quantity >= maxStock && (
                          <span className="text-[10px] text-saffron-base font-bold block mt-0.5">
                            Max available limit reached
                          </span>
                        )}
                      </div>

                      {/* Stepper Controls - Touch friendly min 34px targets */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <div className="flex items-center bg-paper border border-hairline rounded-xl overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-2 sm:p-1.5 hover:bg-cardcream text-ink transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-2 sm:p-1.5 hover:bg-cardcream text-ink transition-colors disabled:opacity-30 min-w-[34px] min-h-[34px] flex items-center justify-center active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-kumkum hover:bg-kumkum/10 rounded-xl transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bill Summary & Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-hairline bg-cardcream space-y-3.5">

                {/* Promo Coupon Section */}
                <div className="bg-paper border border-hairline rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-forest" />
                      <span>Have a Coupon?</span>
                    </span>
                    {appliedCoupon && (
                      <span className="text-[10px] text-forest bg-forest/10 px-2 py-0.5 rounded-full font-bold">
                        Applied!
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="p-2 bg-forest/10 border border-forest/30 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-forest">{appliedCoupon.code}</span>
                        <p className="text-[10px] text-forest/80">{appliedCoupon.desc}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-kumkum hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-1.5 bg-cardcream rounded-xl text-xs uppercase font-mono font-semibold border border-hairline focus:outline-none focus:border-forest text-ink"
                        />
                        <button
                          onClick={() => {
                            if (applyCoupon(couponInput)) {
                              setCouponInput('');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-forest hover:bg-forest/90 text-paper rounded-xl text-xs font-bold shadow-xs transition-colors"
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

                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-semibold text-ink">₹{cartSubtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-forest font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                      </span>
                      <span className="font-mono font-bold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-ink-soft">
                      <span>Delivery Fee</span>
                      {deliveryFee > 0 && (
                        <span className="text-[10px] text-kumkum bg-kumkum/10 px-1.5 py-0.5 rounded font-semibold">
                          Below ₹199
                        </span>
                      )}
                    </span>
                    {deliveryFee > 0 ? (
                      <span className="font-mono font-bold text-kumkum">+₹10</span>
                    ) : (
                      <span className="font-mono font-bold text-forest">₹0 (FREE)</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-hairline flex items-center justify-between text-sm font-bold text-ink">
                    <span className="font-serif">Grand Total</span>
                    <span className="font-mono text-lg text-forest">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-saffron-gradient hover:brightness-105 text-ink font-bold rounded-xl text-sm shadow-md transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-ink-soft flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  <span>Choose Normal vs 15-Min Emergency Delivery at next step</span>
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
