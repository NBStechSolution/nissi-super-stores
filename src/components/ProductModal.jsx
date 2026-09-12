import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Clock, Heart, Calendar, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    cart,
    favorites,
    toggleFavorite,
    language,
    openSubscriptionModal,
    setProductToDelete,
    isManagerMode,
    isAdminOrStaff
  } = useStore();
  const [qty, setQty] = useState(1);

  if (!selectedProduct) return null;

  const cartItem = cart.find((i) => i.id === selectedProduct.id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;
  const maxAvailable = selectedProduct.stock;
  const remainingAddable = Math.max(0, maxAvailable - currentCartQty);
  const isFav = favorites.includes(selectedProduct.id);

  const handleAdd = () => {
    addToCart(selectedProduct, qty);
    setSelectedProduct(null);
  };

  return (
    <div
      onClick={() => setSelectedProduct(null)}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-scale-up max-sm:animate-slide-up max-h-[92vh] overflow-y-auto safe-area-bottom"
      >

        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-1" />

        {/* Action Header Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={() => toggleFavorite(selectedProduct.id)}
            className="p-2 bg-paper/90 text-ink-soft hover:text-kumkum rounded-full border border-hairline transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-kumkum text-kumkum' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image Header with Large 2D Visual */}
        <div
          className="w-full h-56 rounded-2xl flex items-center justify-center overflow-hidden border border-hairline/40 shadow-inner relative"
          style={{ backgroundColor: selectedProduct.imageBg || '#F5F5F0' }}
        >
          {selectedProduct.image2D ? (
            <img
              src={selectedProduct.image2D}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-7xl drop-shadow-md">{selectedProduct.fallbackEmoji || '🧺'}</span>
          )}
        </div>

        {/* Info Header */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-semibold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
              {(selectedProduct.category || 'General').toUpperCase()}
            </span>
            <span className="text-[11px] font-semibold text-ink-soft bg-cardcream px-2.5 py-0.5 rounded-full border border-hairline">
              {selectedProduct.unit}
            </span>
            {currentCartQty > 0 && (
              <span className="text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/30">
                ✓ {currentCartQty} already in basket
              </span>
            )}
          </div>

          <h2 className="font-serif font-bold text-2xl text-ink mb-1">
            {language === 'te' && selectedProduct.nameTe ? selectedProduct.nameTe : selectedProduct.name}
          </h2>

          <p className="text-xs text-ink-soft leading-relaxed font-sans mb-3">
            {selectedProduct.description}
          </p>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif font-bold text-2xl text-ink">
              ₹{selectedProduct.price}
            </span>
            {selectedProduct.mrp > selectedProduct.price && (
              <>
                <span className="text-sm text-ink-soft/40 line-through">
                  ₹{selectedProduct.mrp}
                </span>
                <span className="text-xs font-semibold text-kumkum bg-kumkum/10 px-2 py-0.5 rounded-md">
                  Save ₹{selectedProduct.mrp - selectedProduct.price}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Stock Count & Stepper */}
        <div className="bg-cardcream/80 p-4 rounded-xl border border-hairline space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink">Stock Availability:</span>
            <span className={`font-bold ${maxAvailable > 0 ? 'text-forest' : 'text-kumkum'}`}>
              {maxAvailable > 0 ? `${maxAvailable} units in store` : 'Out of stock right now'}
            </span>
          </div>

          {remainingAddable > 0 ? (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-ink-soft font-medium">Add Quantity:</span>
              <div className="flex items-center bg-paper border border-hairline rounded-xl overflow-hidden shadow-inner">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-ink hover:bg-cardcream transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold font-mono text-ink">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(remainingAddable, q + 1))}
                  className="px-3 py-2 text-ink hover:bg-cardcream transition-colors"
                  disabled={qty >= remainingAddable}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : maxAvailable > 0 ? (
            <p className="text-xs text-saffron-base font-semibold">
              All {maxAvailable} available units are already in your cart!
            </p>
          ) : (
            <p className="text-xs text-kumkum font-sans">
              This item is out of stock right now — we'll notify you when it's back in our kirana store.
            </p>
          )}
        </div>

        {/* Delivery Guarantee Pill */}
        <div className="flex items-center justify-around text-[11px] text-ink-soft pt-1">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-forest" /> FREE Delivery over ₹199
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-saffron-base" /> 15-Min Emergency
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" /> Quality Checked
          </span>
        </div>

        {/* Action Button */}
        {remainingAddable > 0 ? (
          <button
            onClick={handleAdd}
            className="w-full py-3.5 bg-saffron-gradient text-ink font-bold rounded-xl text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add {qty} to cart • ₹{selectedProduct.price * qty}</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-kumkum/10 text-kumkum rounded-xl font-semibold text-xs border border-kumkum/20 cursor-not-allowed"
          >
            {maxAvailable > 0 ? 'Max Stock Added in Cart' : 'Currently Unavailable'}
          </button>
        )}

        {/* 6:30 AM Morning Essentials Repeat Delivery Option */}
        {!selectedProduct.isUtility && (
          <button
            type="button"
            onClick={() => {
              openSubscriptionModal(selectedProduct);
              setSelectedProduct(null);
            }}
            className="w-full py-2.5 bg-forest/10 hover:bg-forest/20 text-forest font-bold rounded-xl text-xs border border-forest/25 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'te' ? '6:30 AM ఉదయం డెలివరీకి సబ్‌స్క్రైబ్ చేయండి' : 'Subscribe for 6:30 AM Daily Morning Delivery'}</span>
          </button>
        )}

        {/* Store Manager Direct Delete Action (Admin Only) */}
        {isAdminOrStaff && isManagerMode && !selectedProduct.isUtility && (
          <button
            type="button"
            onClick={() => setProductToDelete(selectedProduct)}
            className="w-full py-2 bg-kumkum/10 hover:bg-kumkum/20 text-kumkum font-bold rounded-xl text-xs border border-kumkum/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఈ సరుకును తొలగించండి (Delete Item)' : 'Delete This Item from Store'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
