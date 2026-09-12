import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, TELUGU_TRANSLATIONS } from '../data/mockData';
import { ADMIN_PHONE, ADMIN_SECURITY_PIN, PAYMENT_CONFIG } from '../data/paymentConfig';
import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  updateOrderPaymentInSupabase,
  subscribeToOrders,
  subscribeToProducts
} from '../lib/supabaseSync';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const [session] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse user session:', e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(session));
  const [userPhone, setUserPhone] = useState(session?.phone || '');
  const [userName, setUserName] = useState(session?.name || '');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');
  const [pendingCartAction, setPendingCartAction] = useState(null);

  // Strip non-digits and leading country code (91) if 12 digits so phone always normalizes to 10-digit format
  const rawDigits = (userPhone || '').replace(/\D/g, '');
  const cleanPhone = rawDigits.length === 12 && rawDigits.startsWith('91')
    ? rawDigits.slice(2)
    : rawDigits;

  // Purge legacy manager mode from localStorage to prevent normal user contamination
  useEffect(() => {
    try {
      localStorage.removeItem('nissi_manager_mode');
    } catch {}
  }, []);

  // Secure Admin / Staff Authentication Session (sessionStorage: per-tab/session isolation)
  const [adminAuthSession, setAdminAuthSession] = useState(() => {
    try {
      return sessionStorage.getItem('nissi_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Strict role isolation: Admin privileges ONLY if logged in with ADMIN_PHONE or verified with Admin PIN
  const isAdminOrStaff = Boolean(
    (isLoggedIn && cleanPhone === ADMIN_PHONE) ||
    adminAuthSession === true
  );

  // Manager mode (catalogue editing/deletion buttons on storefront) is strictly restricted to authenticated admins
  const [isManagerMode, setIsManagerMode] = useState(false);

  const toggleManagerMode = (overrideVal) => {
    if (!isAdminOrStaff) {
      setIsManagerMode(false);
      return false;
    }
    setIsManagerMode((prev) => (typeof overrideVal === 'boolean' ? overrideVal : !prev));
    return true;
  };

  const authenticateAdmin = (pin) => {
    const cleanPin = String(pin || '').trim();
    if (cleanPin === ADMIN_SECURITY_PIN) {
      setAdminAuthSession(true);
      try {
        sessionStorage.setItem('nissi_admin_auth', 'true');
      } catch {}
      return { success: true };
    }
    return { success: false, message: 'Incorrect Admin PIN. Access restricted to store owner.' };
  };

  const revokeAdminAuth = () => {
    setAdminAuthSession(false);
    setIsManagerMode(false);
    try {
      sessionStorage.removeItem('nissi_admin_auth');
    } catch {}
    setActiveView((curr) => (curr === 'admin' || curr === 'staff' ? 'home' : curr));
  };

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse saved addresses:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nissi_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.warn('Failed to persist saved addresses to localStorage:', e);
    }
  }, [savedAddresses]);

  const [favorites, setFavorites] = useState(['prod-1', 'prod-3']);

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [utilityType, setUtilityType] = useState('electricity');

  const openUtilityModal = (type = 'electricity') => {
    setUtilityType(type);
    setIsUtilityModalOpen(true);
  };

  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isHolidayClosed, setIsHolidayClosed] = useState(false);
  const [holidayReason, setHolidayReason] = useState('Ganesh Chaturthi Store Override');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [staffAvailable, setStaffAvailable] = useState(true);
  const [normalWindow] = useState('Normal 2:15–5:15 PM');

  const [activeView, setActiveView] = useState('home');
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_products_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge any legacy coconut entries from localStorage cache
          const cleaned = parsed
            .filter((p) => p && p.category !== 'coconut' && !p.name?.toLowerCase().includes('coconut'))
            .map((p) => (p.id === 'prod-4' && p.category === 'coconut' ? INITIAL_PRODUCTS.find((ip) => ip.id === 'prod-4') : p));
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved products from localStorage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Persistent shopping cart synced with localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_cart_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item) => item && item.category !== 'coconut' && !item.name?.toLowerCase().includes('coconut')
          );
        }
      }
    } catch (e) {
      console.warn('Could not parse saved cart from localStorage:', e);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('nissi_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart to localStorage:', e);
    }
  }, [cart]);

  // Daily Essentials Morning Subscriptions (e.g. Milk, Curd, Pooja items)
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_subscriptions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse subscriptions from localStorage:', e);
    }
    return [
      {
        id: 'sub-1',
        productId: 'prod-3',
        productName: 'Heritage Special Toned Milk',
        productNameTe: 'హెరిటేజ్ స్పెషల్ టోన్డ్ మిల్క్ (500మి.లీ)',
        unit: '500 ml Packet',
        price: 32,
        quantity: 2,
        frequency: 'Daily',
        deliveryTime: '06:30 AM',
        status: 'Active',
        address: 'Doorstep Delivery',
        nextDelivery: 'Tomorrow, 6:30 AM',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionTargetProduct, setSubscriptionTargetProduct] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('nissi_subscriptions_v1', JSON.stringify(subscriptions));
    } catch (e) {
      console.warn('Could not persist subscriptions to localStorage:', e);
    }
  }, [subscriptions]);

  const openSubscriptionModal = (product = null) => {
    setSubscriptionTargetProduct(product);
    setIsSubscriptionModalOpen(true);
  };

  const addSubscription = ({ product, quantity = 1, frequency = 'Daily', deliveryTime = '06:30 AM', address = '' }) => {
    if (!product) return null;
    const newSub = {
      id: `sub-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productNameTe: product.nameTe || product.name,
      unit: product.unit,
      price: product.price,
      quantity,
      frequency,
      deliveryTime,
      status: 'Active',
      address: address || savedAddresses[0]?.address || 'Doorstep Delivery',
      nextDelivery: 'Tomorrow, 6:30 AM',
      createdAt: new Date().toISOString()
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    return newSub;
  };

  const toggleSubscriptionStatus = (subId) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s))
    );
  };

  const cancelSubscription = (subId) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
  };

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse saved orders from localStorage:', e);
    }
    return INITIAL_ORDERS;
  });
  const [activeOrderId, setActiveOrderId] = useState('ORD-9842');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [storeAnnouncement, setStoreAnnouncementState] = useState(() => {
    try {
      const saved = localStorage.getItem('nissi_announcement');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved announcement:', e);
    }
    return {
      text: '🌾 Fresh organic harvest arrived! Express delivery available across Jubilee Hills & Banjara Hills.',
      enabled: true
    };
  });

  const setStoreAnnouncement = (newVal) => {
    setStoreAnnouncementState((prev) => {
      const nextVal = typeof newVal === 'function' ? newVal(prev) : newVal;
      try {
        localStorage.setItem('nissi_announcement', JSON.stringify(nextVal));
      } catch (e) {
        console.warn('Failed to save announcement to localStorage:', e);
      }
      return nextVal;
    });
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const MIN_ORDER_FREE_DELIVERY = 199;
  const BELOW_THRESHOLD_DELIVERY_FEE = 10;

  // Promotional Coupons
  const PROMO_COUPONS = {
    FIRST50: { code: 'FIRST50', type: 'flat', value: 50, minOrder: 199, desc: '₹50 OFF on orders over ₹199' },
    NISSI10: { code: 'NISSI10', type: 'percent', value: 10, maxDiscount: 100, minOrder: 99, desc: '10% OFF on your order' },
    UGADI20: { code: 'UGADI20', type: 'flat', value: 30, minOrder: 149, desc: 'Festival ₹30 Special Discount' }
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = (rawCode) => {
    const code = (rawCode || '').trim().toUpperCase();
    setCouponError('');
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return false;
    }
    const coupon = PROMO_COUPONS[code];
    if (!coupon) {
      setCouponError(`Coupon code "${code}" is invalid.`);
      return false;
    }
    if (cartSubtotal < coupon.minOrder) {
      setCouponError(`Minimum order amount of ₹${coupon.minOrder} required for ${code}.`);
      return false;
    }
    let discount = 0;
    if (coupon.type === 'flat') {
      discount = Math.min(coupon.value, cartSubtotal);
    } else if (coupon.type === 'percent') {
      discount = Math.min(Math.round((cartSubtotal * coupon.value) / 100), coupon.maxDiscount || 100);
    }
    setAppliedCoupon({ code: coupon.code, discount, desc: coupon.desc });
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const deliveryFee = cartSubtotal > 0 && cartSubtotal < MIN_ORDER_FREE_DELIVERY ? BELOW_THRESHOLD_DELIVERY_FEE : 0;
  const amountNeededForFreeDelivery = Math.max(0, MIN_ORDER_FREE_DELIVERY - cartSubtotal);
  const grandTotal = discountedSubtotal + deliveryFee;

  // Language translation helper with fallback string
  const t = (key, fallbackText) => {
    if (language === 'te' && TELUGU_TRANSLATIONS[key]) {
      return TELUGU_TRANSLATIONS[key];
    }
    return fallbackText || key;
  };

  const addToCart = (product, qty = 1) => {
    if (!isLoggedIn) {
      setLoginPromptMessage('Please sign in with your mobile number to add items to your cart and place orders.');
      setPendingCartAction({ product, qty });
      setIsLoginOpen(true);
      return false;
    }

    if (product.stock <= 0) return false;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { ...product, quantity: Math.min(qty, product.stock) }];
    });
    setIsCartOpen(true);
    return true;
  };

  const updateCartQuantity = (productId, delta) => {
    if (!isLoggedIn) {
      setLoginPromptMessage('Please sign in to update your cart.');
      setIsLoginOpen(true);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: Math.min(nextQty, product.stock) };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const loginDirect = (phone, name = 'Valued Customer') => {
    const rawDigitsOnly = String(phone || '').replace(/\D/g, '');
    const cleanP = rawDigitsOnly.length === 12 && rawDigitsOnly.startsWith('91')
      ? rawDigitsOnly.slice(2)
      : rawDigitsOnly;
    const cleanN = String(name || '').trim() || 'Valued Customer';

    setUserPhone(cleanP);
    setUserName(cleanN);
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    setLoginPromptMessage('');

    try {
      localStorage.setItem('nissi_user_session', JSON.stringify({
        phone: cleanP,
        name: cleanN
      }));
    } catch (e) {
      console.warn('Failed to persist user session:', e);
    }

    // Automatically fulfill pending item addition right after sign-in
    if (pendingCartAction?.product) {
      const { product, qty } = pendingCartAction;
      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === product.id);
        if (existing) {
          const newQty = Math.min(existing.quantity + (qty || 1), product.stock);
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: newQty } : item
          );
        }
        return [...prevCart, { ...product, quantity: Math.min(qty || 1, product.stock) }];
      });
      setPendingCartAction(null);
      setIsCartOpen(true);
    }
  };

  // Backward compatibility alias
  const loginWithOtp = loginDirect;

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone('');
    setUserName('');
    setPendingCartAction(null);
    setLoginPromptMessage('');
    clearCart();
    try {
      localStorage.removeItem('nissi_user_session');
    } catch (e) {
      console.warn('Failed to clear user session:', e);
    }
    revokeAdminAuth();
    setActiveView((curr) => (curr === 'admin' || curr === 'staff' ? 'home' : curr));
  };

  const addNewProduct = async (productData) => {
    const newId = `prod-${Date.now()}`;
    const newProduct = {
      id: newId,
      name: productData.name?.trim() || 'New Kirana Item',
      nameTe: productData.nameTe?.trim() || productData.name?.trim() || '',
      category: productData.category || 'grocery',
      price: Math.max(0, Number(productData.price) || 0),
      mrp: Math.max(0, Number(productData.mrp) || Number(productData.price) || 0),
      unit: productData.unit?.trim() || '1 Unit',
      stock: Math.max(0, parseInt(productData.stock) || 0),
      lowStockThreshold: Math.max(1, parseInt(productData.lowStockThreshold) || 5),
      badge: productData.badge?.trim() || 'New Arrival',
      description: productData.description?.trim() || 'Freshly stocked at Nissi Super Stores.',
      image2D: productData.image2D?.trim() || '',
      fallbackEmoji: productData.fallbackEmoji?.trim() || '🛒',
      imageBg: productData.imageBg || '#F7F3EB'
    };

    setProducts((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newId)];
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save products to localStorage:', e);
      }
      return updated;
    });

    // Sync to Supabase database so live website updates immediately
    await saveProductToSupabase(newProduct).catch((err) =>
      console.warn('Could not sync new product to Supabase:', err)
    );

    return newProduct;
  };

  const resetProductsToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    try {
      localStorage.removeItem('nissi_products_v1');
    } catch (e) {
      console.warn('Failed to reset products in localStorage:', e);
    }
  };

  const updateProductStock = (productId, newStock) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const stockVal = Math.max(0, parseInt(newStock) || 0);
          const updatedProd = { ...p, stock: stockVal };
          saveProductToSupabase(updatedProd).catch(() => {});
          return updatedProd;
        }
        return p;
      });
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update stock in localStorage:', e);
      }
      return updated;
    });
  };

  const editProduct = async (productId, updatedData) => {
    let savedTarget = null;
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const updatedProd = {
            ...p,
            ...updatedData,
            price: Math.max(0, Number(updatedData.price) || p.price),
            mrp: Math.max(0, Number(updatedData.mrp) || p.mrp),
            stock: Math.max(0, parseInt(updatedData.stock) ?? p.stock),
            lowStockThreshold: Math.max(1, parseInt(updatedData.lowStockThreshold) ?? p.lowStockThreshold)
          };
          savedTarget = updatedProd;
          return updatedProd;
        }
        return p;
      });
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update product in localStorage:', e);
      }
      return updated;
    });

    if (savedTarget) {
      await saveProductToSupabase(savedTarget).catch(() => {});
    }
  };

  const deleteProduct = async (productId) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to delete product from localStorage:', e);
      }
      return updated;
    });
    setCart((prev) => prev.filter((i) => i.id !== productId));
    await deleteProductFromSupabase(productId).catch((err) =>
      console.warn('Could not delete product from Supabase:', err)
    );
  };

  const duplicateProduct = (productId) => {
    const existing = products.find((p) => p.id === productId);
    if (!existing) return null;
    const cloned = {
      ...existing,
      id: Date.now(),
      name: `${existing.name} (Copy)`,
      stock: existing.stock || 10
    };
    setProducts((prev) => {
      const updated = [cloned, ...prev];
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save duplicated product in localStorage:', e);
      }
      return updated;
    });
    return cloned;
  };

  const playEmergencyChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(587.33, now, 0.15); // D5
      playTone(880.00, now + 0.18, 0.25); // A5
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const verifyAndDeliverOrder = (orderId, paymentMethodCollected = 'Doorstep UPI') => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.status === 'Delivered') return { success: true, message: 'Order already delivered.' };

    const doorstepRef = `DOORSTEP-${Date.now().toString().slice(-6)}`;

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? {
        ...ord,
        status: 'Delivered',
        paymentStatus: 'Paid',
        paymentMethod: ord.paymentMethod || paymentMethodCollected,
        utr: ord.utr || doorstepRef,
        deliveredAt: 'Just now',
        paidAt: ord.paidAt || 'Just now'
      } : ord))
    );

    // Sync delivery status & payment to Supabase
    updateOrderStatusInSupabase(orderId, 'Delivered');
    updateOrderPaymentInSupabase(orderId, 'Paid', doorstepRef);

    return { success: true, message: 'Order successfully marked as delivered and payment collected!' };
  };

  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.name || userName,
      phone: orderData.phone || userPhone,
      address: orderData.address,
      items: [...cart],
      subtotal: cartSubtotal,
      discountAmount: discountAmount,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      deliveryFee: deliveryFee,
      totalAmount: grandTotal,
      deliveryType: orderData.deliveryType,
      status: 'Placed',
      placedAt: 'Just now',
      deliveryWindow: orderData.deliveryType === 'Emergency' ? 'Within 15 Mins' : '2:15 PM – 5:15 PM',
      isEmergency: orderData.deliveryType === 'Emergency',
      paymentMethod: orderData.paymentMethod || 'Doorstep UPI Scanner',
      paymentStatus: orderData.paymentStatus || 'Unpaid (Collect at Doorstep)',
      upiId: orderData.upiId || PAYMENT_CONFIG?.upiId || 'abicharan07@axl',
      utr: orderData.utr || '',
      paymentProof: orderData.paymentProof || null,
      paidAt: null,
      assignedRider: 'Raju M. (+91 91234 56789)'
    };

    if (orderData.deliveryType === 'Emergency') {
      playEmergencyChime();
    }

    setProducts((prev) => {
      const updated = prev.map((prod) => {
        const inCart = cart.find((item) => item.id === prod.id);
        if (inCart) {
          return { ...prod, stock: Math.max(0, prod.stock - inCart.quantity) };
        }
        return prod;
      });
      try {
        localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to deduct order stock in localStorage:', e);
      }
      return updated;
    });

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('nissi_orders_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save orders to localStorage:', e);
      }
      return updated;
    });
    setActiveOrderId(newOrder.id);
    clearCart();
    removeCoupon();
    setActiveView('tracking');

    // Auto-save delivery address to customer profile savedAddresses if not already present
    if (orderData.address && orderData.address.trim().length > 5) {
      const cleanAddr = orderData.address.trim();
      setSavedAddresses((prev) => {
        const alreadyExists = prev.some((a) => a.address.toLowerCase() === cleanAddr.toLowerCase());
        if (!alreadyExists) {
          const newSaved = [
            ...prev,
            { id: `addr-${Date.now()}`, tag: prev.length === 0 ? 'Home' : `Address ${prev.length + 1}`, address: cleanAddr }
          ];
          try {
            localStorage.setItem('nissi_saved_addresses', JSON.stringify(newSaved));
          } catch {}
          return newSaved;
        }
        return prev;
      });
    }

    // Sync to Supabase cloud if configured
    saveOrderToSupabase(newOrder);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
      try {
        localStorage.setItem('nissi_orders_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update orders in localStorage:', e);
      }
      return updated;
    });

    // Sync status change to Supabase
    updateOrderStatusInSupabase(orderId, newStatus);
  };

  const updateOrderPaymentStatus = (orderId, newStatus, newUtr = '') => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentStatus: newStatus,
            utr: newUtr || ord.utr,
            paidAt: newStatus === 'Paid' ? (ord.paidAt || 'Just now') : ord.paidAt
          };
        }
        return ord;
      });
      try {
        localStorage.setItem('nissi_orders_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save payment status to localStorage:', e);
      }
      return updated;
    });

    // Sync payment status to Supabase
    updateOrderPaymentInSupabase(orderId, newStatus, newUtr);
  };

  // Supabase Initial Products Fetch & Realtime Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchProductsFromSupabase().then((remoteProducts) => {
      if (remoteProducts && remoteProducts.length > 0) {
        setProducts((prev) => {
          const remoteIds = new Set(remoteProducts.map((p) => p.id));
          // Preserve any locally created products that aren't yet in Supabase
          const localOnly = prev.filter((p) => p && !remoteIds.has(p.id));
          // Sync any unsynced local products to Supabase in background
          localOnly.forEach((localProd) => {
            saveProductToSupabase(localProd).catch(() => {});
          });
          const merged = [...remoteProducts, ...localOnly];
          try {
            localStorage.setItem('nissi_products_v1', JSON.stringify(merged));
          } catch (e) {
            console.warn('Could not cache remote products:', e);
          }
          return merged;
        });
      }
    });

    const unsubscribeProducts = subscribeToProducts((payload) => {
      if (payload?.eventType === 'DELETE' && payload?.old?.id) {
        const deletedId = String(payload.old.id);
        setProducts((prev) => {
          const updated = prev.filter((p) => p.id !== deletedId);
          try {
            localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
        setCart((prev) => prev.filter((i) => i.id !== deletedId));
        return;
      }

      if (payload?.new) {
        const row = payload.new;
        const mappedProd = {
          id: row.id,
          name: row.name,
          nameTe: row.name_te || row.nameTe || row.name,
          category: row.category,
          price: Number(row.price),
          mrp: Number(row.mrp || row.price),
          unit: row.unit,
          stock: Number(row.stock),
          lowStockThreshold: Number(row.low_stock_threshold || row.lowStockThreshold || 5),
          badge: row.badge || '',
          description: row.description || '',
          image2D: row.image_2d || row.image2D || '',
          fallbackEmoji: row.fallback_emoji || row.fallbackEmoji || '🛒',
          imageBg: row.image_bg || row.imageBg || '#F5F5F0'
        };

        setProducts((prev) => {
          const exists = prev.some((p) => p.id === mappedProd.id);
          const updated = exists
            ? prev.map((p) => (p.id === mappedProd.id ? { ...p, ...mappedProd } : p))
            : [mappedProd, ...prev];
          try {
            localStorage.setItem('nissi_products_v1', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
      }
    });

    fetchOrdersFromSupabase().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders((prev) => {
          const remoteIds = new Set(remoteOrders.map((o) => o.id));
          const localOnly = prev.filter((o) => !remoteIds.has(o.id));
          const merged = [...remoteOrders, ...localOnly];
          try {
            localStorage.setItem('nissi_orders_v1', JSON.stringify(merged));
          } catch (e) {
            console.warn('Could not cache merged orders:', e);
          }
          return merged;
        });
      }
    });

    const unsubscribe = subscribeToOrders((payload) => {
      if (payload?.eventType === 'DELETE' && payload?.old?.id) {
        setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        return;
      }

      if (payload?.new) {
        const updatedRow = payload.new;
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === updatedRow.id);
          if (exists) {
            return prev.map((o) =>
              o.id === updatedRow.id
                ? {
                    ...o,
                    status: updatedRow.status || o.status,
                    paymentStatus: updatedRow.payment_status || o.paymentStatus,
                    utr: updatedRow.utr || o.utr,
                    assignedRider: updatedRow.assigned_rider || o.assignedRider
                  }
                : o
            );
          } else {
            const mappedNewOrder = {
              id: updatedRow.id,
              customerName: updatedRow.customer_name,
              phone: updatedRow.phone,
              address: updatedRow.address,
              items: updatedRow.items || [],
              subtotal: Number(updatedRow.subtotal || 0),
              discountAmount: Number(updatedRow.discount_amount || 0),
              appliedCoupon: updatedRow.applied_coupon,
              deliveryFee: Number(updatedRow.delivery_fee || 0),
              totalAmount: Number(updatedRow.total_amount || 0),
              deliveryType: updatedRow.delivery_type,
              status: updatedRow.status || 'Placed',
              deliveryWindow: updatedRow.delivery_window || 'Within 15 Mins',
              isEmergency: Boolean(updatedRow.is_emergency),
              paymentMethod: updatedRow.payment_method || 'COD',
              paymentStatus: updatedRow.payment_status || 'Unpaid',
              upiId: updatedRow.upi_id || 'abicharan07@axl',
              utr: updatedRow.utr || '',
              assignedRider: updatedRow.assigned_rider || 'Raju M. (+91 91234 56789)'
            };
            return [mappedNewOrder, ...prev];
          }
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubscribeProducts === 'function') unsubscribeProducts();
    };
  }, []);

  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  return (
    <StoreContext.Provider
      value={{
        isSupabaseConfigured,
        language,
        setLanguage,
        t,
        isLoggedIn,
        userPhone,
        userName,
        isAdminOrStaff,
        isLoginOpen,
        setIsLoginOpen,
        loginPromptMessage,
        setLoginPromptMessage,
        loginDirect,
        loginWithOtp,
        logout,
        savedAddresses,
        setSavedAddresses,
        favorites,
        toggleFavorite,
        isUtilityModalOpen,
        setIsUtilityModalOpen,
        utilityType,
        openUtilityModal,
        isStoreOpen,
        setIsStoreOpen,
        isHolidayClosed,
        setIsHolidayClosed,
        holidayReason,
        setHolidayReason,
        emergencyAvailable,
        setEmergencyAvailable,
        staffAvailable,
        setStaffAvailable,
        normalWindow,
        activeView,
        setActiveView,
        products,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        deliveryFee,
        MIN_ORDER_FREE_DELIVERY,
        amountNeededForFreeDelivery,
        grandTotal,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        discountAmount,
        discountedSubtotal,
        PROMO_COUPONS,
        orders,
        activeOrderId,
        setActiveOrderId,
        activeOrder,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        updateProductStock,
        addNewProduct,
        editProduct,
        deleteProduct,
        duplicateProduct,
        storeAnnouncement,
        setStoreAnnouncement,
        verifyAndDeliverOrder,
        playEmergencyChime,
        resetProductsToDefault,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        PAYMENT_CONFIG,
        subscriptions,
        setSubscriptions,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        subscriptionTargetProduct,
        setSubscriptionTargetProduct,
        openSubscriptionModal,
        addSubscription,
        toggleSubscriptionStatus,
        cancelSubscription,
        isManagerMode,
        toggleManagerMode,
        isQuickAddOpen,
        setIsQuickAddOpen,
        productToDelete,
        setProductToDelete,
        adminAuthSession,
        authenticateAdmin,
        revokeAdminAuth,
        ADMIN_SECURITY_PIN
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    return {
      products: [],
      cart: [],
      orders: [],
      subscriptions: [],
      favorites: [],
      savedAddresses: [],
      isStoreOpen: true,
      t: (_k, fb) => fb || '',
      PAYMENT_CONFIG: PAYMENT_CONFIG || { upiId: 'abicharan07@axl', payeeName: 'Nissi Super Stores', qrCodeUrl: '/payment-qr.jpeg' },
      openSubscriptionModal: () => {},
      addSubscription: () => {},
      toggleSubscriptionStatus: () => {},
      cancelSubscription: () => {},
      isManagerMode: false,
      toggleManagerMode: () => {},
      isQuickAddOpen: false,
      setIsQuickAddOpen: () => {},
      productToDelete: null,
      setProductToDelete: () => {}
    };
  }
  return context;
};

