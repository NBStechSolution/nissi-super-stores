import React, { useState } from 'react';
import { Search, Plus, Minus, Heart, Zap, Mic } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductGrid() {
  const {
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    cart,
    updateCartQuantity,
    setSelectedProduct,
    isStoreOpen,
    favorites,
    toggleFavorite,
    openUtilityModal,
    t,
    language
  } = useStore();

  const [failedImages, setFailedImages] = useState({});
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'te' 
        ? 'మీ బ్రౌజర్‌లో వాయిస్ సెర్చ్ అందుబాటులో లేదు. దయచేసి Chrome లేదా Edge వాడండి.' 
        : 'Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          // Clean trailing periods or commas commonly returned by speech-to-text
          const cleaned = transcript.replace(/[.,!?]+$/, '').trim();
          setSearchQuery(cleaned);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsListening(false);
    }
  };

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.nameTe && prod.nameTe.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Search Bar & Grid Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-cardcream/80 p-4 rounded-crate border border-hairline shadow-xs">
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search raw rice, toor dal, fresh milk, snacks, pickles...')}
              className="w-full pl-10 pr-16 py-2.5 bg-paper rounded-xl text-xs font-sans text-ink placeholder:text-ink-soft/50 border border-hairline focus:outline-none focus:border-forest shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bilingual Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            title={language === 'te' ? 'వాయిస్ సెర్చ్ (మాట్లాడండి)' : 'Voice Search (Speak now)'}
            className={`px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-xs ${
              isListening
                ? 'bg-kumkum text-white animate-pulse ring-2 ring-kumkum/40'
                : 'bg-paper hover:bg-saffron-base/20 text-ink border border-hairline hover:border-saffron-base'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <Mic className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-[11px] font-mono tracking-tight">
                  {language === 'te' ? 'వింటున్నాము...' : 'Listening...'}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-forest" />
                <span className="hidden sm:inline text-[11px]">
                  {language === 'te' ? 'వాయిస్' : 'Voice'} ({language === 'te' ? 'TE' : 'EN'})
                </span>
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-ink-soft font-medium px-2 shrink-0">
          Showing <span className="text-forest font-bold">{filteredProducts.length}</span> fresh items
        </div>
      </div>

      {/* Empty Search Result */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-cardcream/40 rounded-crate border border-dashed border-hairline p-8 animate-fade-in">
          <div className="text-4xl mb-3">🧺</div>
          <h3 className="text-base font-serif font-semibold text-ink mb-1">
            {searchQuery
              ? `No products found matching "${searchQuery}"`
              : selectedCategory !== 'all'
              ? `No products found in category "${selectedCategory}"`
              : 'No products available right now'}
          </h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            Try searching another category like Grocery, Snacks, Milk, Pickles, Pooja items or Utility Bills.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-saffron-gradient text-ink rounded-xl text-xs font-bold shadow-sm"
              >
                Clear Search
              </button>
            )}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-paper border border-hairline hover:border-forest text-ink rounded-xl text-xs font-bold shadow-sm"
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Cards Grid with Large 2D Images & Fallback Handling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id);
          const cartQty = cartItem ? cartItem.quantity : 0;
          const isFav = favorites.includes(product.id);
          const isImgFailed = failedImages[product.id];
          const discountPct =
            product.mrp && product.mrp > product.price
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
              : 0;

          let stockBadgeText = t('inStock', 'In Stock');
          let stockBadgeStyle = 'bg-forest/10 text-forest border-forest/30';
          let isOutOfStock = false;

          if (product.stock === 0) {
            stockBadgeText = t('outOfStock', 'Out of Stock');
            stockBadgeStyle = 'bg-kumkum/10 text-kumkum border-kumkum/30';
            isOutOfStock = true;
          } else if (product.stock <= product.lowStockThreshold) {
            stockBadgeText = `${t('lowStock', 'Low Stock')} (${product.stock})`;
            stockBadgeStyle = 'bg-saffron-base/20 text-ink font-bold border-saffron-base/40';
          }

          return (
            <div
              key={product.id}
              className="group relative bg-cardcream border border-hairline rounded-crate p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-crate-hover hover:-translate-y-1"
            >
              <div>
                {/* Top Badge Rail & Favorite Button */}
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors duration-300 ${stockBadgeStyle}`}
                    >
                      {stockBadgeText}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-kumkum text-paper shadow-2xs">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="p-1.5 bg-paper/90 rounded-full border border-hairline text-ink-soft hover:text-kumkum transition-colors shrink-0"
                    title="Toggle Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-kumkum text-kumkum' : ''}`} />
                  </button>
                </div>

                {/* Large 2D High-Res Product Image Container */}
                <div
                  onClick={() => {
                    if (product.isUtility) {
                      openUtilityModal(product.utilityType);
                    } else {
                      setSelectedProduct(product);
                    }
                  }}
                  className="w-full h-48 rounded-2xl flex items-center justify-center p-3 mb-3 cursor-pointer relative overflow-hidden transition-transform group-hover:scale-[1.02] border border-hairline/40 shadow-xs"
                  style={{ backgroundColor: product.imageBg || '#F5F5F0' }}
                >
                  {product.image2D && !isImgFailed ? (
                    <img
                      src={product.image2D}
                      alt={product.name}
                      onError={() => handleImageError(product.id)}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-6xl drop-shadow-sm select-none">
                      {product.fallbackEmoji || '🌾'}
                    </div>
                  )}

                  {product.isUtility && (
                    <div className="absolute inset-0 bg-ink/30 backdrop-blur-xs flex items-center justify-center text-paper font-bold text-xs p-2 text-center">
                      <span>Click to Pay Bill / Recharge</span>
                    </div>
                  )}
                </div>

                {/* Product Title (English / Telugu) & Description */}
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-serif font-bold text-base text-ink mb-1 group-hover:text-forest transition-colors cursor-pointer line-clamp-1"
                >
                  {language === 'te' && product.nameTe ? product.nameTe : product.name}
                </h3>
                <p className="text-xs text-ink-soft font-sans mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Cart Actions */}
              <div className="pt-3 border-t border-hairline/70 flex items-center justify-between gap-2 mt-2">
                <div>
                  {product.isUtility ? (
                    <span className="font-serif font-bold text-sm text-forest">0% Fee</span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif font-bold text-lg text-ink">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-ink-soft/40 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-soft block">
                        {product.unit}
                      </span>
                    </>
                  )}
                </div>

                {/* Cart Quantity Controls / Add Button */}
                {product.isUtility ? (
                  <button
                    onClick={() => openUtilityModal(product.utilityType)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-forest text-paper hover:bg-forest-soft transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-saffron-highlight" /> Pay Now
                  </button>
                ) : isOutOfStock ? (
                  <button
                    disabled
                    className="px-3 py-2 bg-kumkum/10 text-kumkum opacity-60 rounded-xl text-xs font-semibold border border-kumkum/20 cursor-not-allowed"
                  >
                    {t('outOfStock', 'Out of Stock')}
                  </button>
                ) : cartQty > 0 ? (
                  <div className="flex items-center bg-forest text-paper rounded-xl shadow-sm overflow-hidden p-0.5 border border-hairline">
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="p-1.5 hover:bg-forest-soft transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold font-mono">
                      {cartQty}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="p-1.5 hover:bg-forest-soft transition-colors"
                      disabled={cartQty >= product.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!isStoreOpen}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      isStoreOpen
                        ? 'bg-saffron-gradient hover:brightness-105 text-ink'
                        : 'bg-ink/10 text-ink-soft/40 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('addToCart', 'Add to cart')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
