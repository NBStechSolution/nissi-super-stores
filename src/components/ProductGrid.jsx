import React, { useState } from 'react';
import { Search, Plus, Minus, Heart, Zap, Mic, Trash2, Settings } from 'lucide-react';
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
    language,
    setIsQuickAddOpen,
    setProductToDelete,
    isManagerMode,
    toggleManagerMode,
    isAdminOrStaff
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
    if (!prod) return false;
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesCategory;

    const nameStr = (prod.name || '').toLowerCase();
    const nameTeStr = (prod.nameTe || '').toLowerCase();
    const descStr = (prod.description || '').toLowerCase();
    const matchesSearch = nameStr.includes(q) || nameTeStr.includes(q) || descStr.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Search Bar & Grid Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-cardcream/80 p-3 sm:p-4 rounded-2xl sm:rounded-crate border border-hairline shadow-xs">
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', language === 'te' ? 'సరుకులు వెతకండి (బియ్యం, పాలు, స్నాక్స్)...' : 'Search products (rice, milk, snacks)...')}
              className="w-full pl-10 pr-16 py-2.5 bg-paper rounded-xl text-xs sm:text-sm font-sans text-ink placeholder:text-ink-soft/50 border border-hairline focus:outline-none focus:border-forest shadow-inner"
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

          {/* Store Manager Controls (Strictly Authorized Store Owner / Admin Only) */}
          {isAdminOrStaff && (
            <>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="px-3 py-2.5 bg-forest text-paper hover:bg-forest/90 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-xs active:scale-95 cursor-pointer"
                title="Add New Product to Storefront"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{language === 'te' ? 'సరుకు జోడించు' : 'Add Item'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleManagerMode()}
                className={`px-2.5 py-2.5 rounded-xl transition-all flex items-center gap-1 text-xs font-bold shrink-0 border cursor-pointer ${
                  isManagerMode
                    ? 'bg-saffron-base/20 border-saffron-base text-ink ring-2 ring-saffron-base/30'
                    : 'bg-paper border-hairline text-ink-soft hover:text-ink'
                }`}
                title="Toggle Store Manager Mode to Delete or Add items"
              >
                <Settings className={`w-3.5 h-3.5 ${isManagerMode ? 'text-forest animate-spin-slow' : 'text-ink-soft'}`} />
                <span className="hidden md:inline">{isManagerMode ? 'Manager Mode: ON' : 'Manage'}</span>
              </button>
            </>
          )}
        </div>
        <div className="text-xs text-ink-soft font-medium px-1 sm:px-2 shrink-0 flex items-center gap-2">
          <span>Showing <span className="text-forest font-bold">{filteredProducts.length}</span> fresh items</span>
          {isAdminOrStaff && isManagerMode && (
            <span className="text-[10px] bg-forest/15 text-forest font-bold px-2 py-0.5 rounded-full border border-forest/20">
              ● Edit & Delete Enabled
            </span>
          )}
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

      {/* Product Cards Grid: 2-column on mobile, responsive up to 4-column on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
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
            stockBadgeText = `${product.stock} left`;
            stockBadgeStyle = 'bg-saffron-base/20 text-ink font-bold border-saffron-base/40';
          }

          return (
            <div
              key={product.id}
              className="group relative bg-cardcream border border-hairline rounded-2xl sm:rounded-crate p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-crate-hover hover:-translate-y-0.5"
            >
              <div>
                {/* Top Badge Rail & Favorite Button */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-colors ${stockBadgeStyle}`}
                    >
                      {stockBadgeText}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-kumkum text-paper shadow-2xs">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isAdminOrStaff && isManagerMode && !product.isUtility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductToDelete(product);
                        }}
                        className="p-1.5 bg-kumkum/10 hover:bg-kumkum/25 text-kumkum rounded-full border border-kumkum/30 transition-colors cursor-pointer"
                        title="Delete Product from Store"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                      className="p-1.5 bg-paper/90 rounded-full border border-hairline text-ink-soft hover:text-kumkum transition-colors shrink-0"
                      title="Toggle Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-kumkum text-kumkum' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2D High-Res Product Image Container - h-36 on mobile for clear visibility */}
                <div
                  onClick={() => {
                    if (product.isUtility) {
                      openUtilityModal(product.utilityType);
                    } else {
                      setSelectedProduct(product);
                    }
                  }}
                  className="w-full h-36 sm:h-44 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 mb-2 sm:mb-3 cursor-pointer relative overflow-hidden transition-transform group-hover:scale-[1.02] border border-hairline/40 shadow-xs"
                  style={{ backgroundColor: product.imageBg || '#F5F5F0' }}
                >
                  {product.image2D && !isImgFailed ? (
                    <img
                      src={product.image2D}
                      alt={product.name}
                      onError={() => handleImageError(product.id)}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-4xl sm:text-6xl drop-shadow-sm select-none">
                      {product.fallbackEmoji || '🌾'}
                    </div>
                  )}

                  {product.isUtility && (
                    <div className="absolute inset-0 bg-ink/30 backdrop-blur-xs flex items-center justify-center text-paper font-bold text-[10px] sm:text-xs p-1 text-center">
                      <span>Pay Bill / Recharge</span>
                    </div>
                  )}
                </div>

                {/* Product Title & Unit */}
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-serif font-bold text-sm sm:text-base text-ink mb-0.5 group-hover:text-forest transition-colors cursor-pointer line-clamp-1"
                >
                  {language === 'te' && product.nameTe ? product.nameTe : product.name}
                </h3>
                <span className="text-[11px] sm:text-xs text-ink-soft font-sans font-medium block mb-1">
                  {product.unit}
                </span>
                <p className="hidden sm:block text-xs text-ink-soft font-sans mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Cart Stepper Actions */}
              <div className="pt-2 border-t border-hairline/60 flex items-center justify-between gap-1.5 mt-1">
                <div>
                  {product.isUtility ? (
                    <span className="font-serif font-bold text-xs sm:text-sm text-forest">0% Fee</span>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 leading-tight">
                      <span className="font-serif font-bold text-base sm:text-lg text-ink">
                        ₹{product.price}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[10px] sm:text-xs text-ink-soft/40 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Quantity Controls / Add Button */}
                {product.isUtility ? (
                  <button
                    onClick={() => openUtilityModal(product.utilityType)}
                    className="px-3 sm:px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-forest text-paper hover:bg-forest-soft transition-all flex items-center gap-1 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-saffron-highlight" /> Pay
                  </button>
                ) : isOutOfStock ? (
                  <button
                    disabled
                    className="px-2.5 sm:px-3 py-2 min-h-[38px] bg-kumkum/10 text-kumkum opacity-60 rounded-xl text-[11px] sm:text-xs font-semibold border border-kumkum/20 cursor-not-allowed shrink-0"
                  >
                    {t('outOfStock', 'Sold Out')}
                  </button>
                ) : cartQty > 0 ? (
                  <div className="flex items-center bg-forest text-paper rounded-xl shadow-xs overflow-hidden p-0.5 border border-hairline shrink-0 min-h-[38px]">
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="p-2 sm:p-1.5 hover:bg-forest-soft active:scale-95 transition-all min-w-[32px] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 sm:px-2 text-xs font-bold font-mono min-w-[18px] text-center">
                      {cartQty}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="p-2 sm:p-1.5 hover:bg-forest-soft active:scale-95 transition-all min-w-[32px] flex items-center justify-center"
                      disabled={cartQty >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!isStoreOpen}
                    className={`px-3 sm:px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95 shrink-0 ${
                      isStoreOpen
                        ? 'bg-saffron-gradient hover:brightness-105 text-ink'
                        : 'bg-ink/10 text-ink-soft/40 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('addToCart', 'ADD')}</span>
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
