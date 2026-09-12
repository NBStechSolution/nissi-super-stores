import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Fetch products from Supabase 'products' table if configured
 */
export async function fetchProductsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase products fetch warning:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        nameTe: row.name_te || row.nameTe,
        category: row.category,
        price: Number(row.price),
        mrp: Number(row.mrp || row.price),
        unit: row.unit,
        stock: Number(row.stock),
        lowStockThreshold: Number(row.low_stock_threshold || row.lowStockThreshold || 5),
        badge: row.badge,
        description: row.description,
        image2D: row.image_2d || row.image2D,
        fallbackEmoji: row.fallback_emoji || row.fallbackEmoji || '🛒',
        imageBg: row.image_bg || row.imageBg || '#F5F5F0'
      }));
    }
  } catch (err) {
    console.warn('Supabase products fetch error:', err);
  }
  return null;
}

/**
 * Save or update product in Supabase 'products' table
 */
export async function saveProductToSupabase(product) {
  if (!isSupabaseConfigured || !supabase || !product) return false;
  try {
    const row = {
      id: String(product.id),
      name: product.name || 'New Product',
      name_te: product.nameTe || product.name || '',
      category: product.category || 'grocery',
      price: Number(product.price) || 0,
      mrp: Number(product.mrp || product.price) || 0,
      unit: product.unit || '1 Unit',
      stock: Number(product.stock) || 0,
      low_stock_threshold: Number(product.lowStockThreshold) || 5,
      badge: product.badge || '',
      description: product.description || '',
      image_2d: product.image2D || '',
      fallback_emoji: product.fallbackEmoji || '🛒',
      image_bg: product.imageBg || '#F5F5F0'
    };

    const { error } = await supabase.from('products').upsert(row);
    if (error) {
      console.warn('Supabase product save warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase product save error:', err);
    return false;
  }
}

/**
 * Delete product from Supabase 'products' table
 */
export async function deleteProductFromSupabase(productId) {
  if (!isSupabaseConfigured || !supabase || !productId) return false;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', String(productId));

    if (error) {
      console.warn('Supabase product delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase product delete error:', err);
    return false;
  }
}

/**
 * Fetch all orders from Supabase 'orders' table
 */
export async function fetchOrdersFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase orders fetch warning:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        address: row.address,
        items: row.items || [],
        subtotal: Number(row.subtotal || 0),
        discountAmount: Number(row.discount_amount || 0),
        appliedCoupon: row.applied_coupon,
        deliveryFee: Number(row.delivery_fee || 0),
        totalAmount: Number(row.total_amount || 0),
        deliveryType: row.delivery_type,
        status: row.status,
        placedAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        deliveryWindow: row.delivery_window || 'Within 15 Mins',
        isEmergency: Boolean(row.is_emergency),
        paymentMethod: row.payment_method || 'COD',
        paymentStatus: row.payment_status || 'Unpaid',
        upiId: row.upi_id || 'abicharan07@axl',
        utr: row.utr || '',
        paymentProof: row.payment_proof || null,
        assignedRider: row.assigned_rider || 'Raju M. (+91 91234 56789)',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }
    return [];
  } catch (err) {
    console.warn('Supabase orders fetch error:', err);
    return null;
  }
}

/**
 * Save new order to Supabase 'orders' table
 */
export async function saveOrderToSupabase(order) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    let paymentProof = order.paymentProof || null;
    // Guard against oversized base64 payloads breaking Supabase REST limits
    if (typeof paymentProof === 'string' && paymentProof.length > 800000) {
      console.warn('Payment proof image is large; saving order record without inline payload');
      paymentProof = null;
    }

    const row = {
      id: order.id,
      customer_name: order.customerName || 'Customer',
      phone: order.phone || '',
      address: order.address || '',
      items: order.items || [],
      subtotal: Number(order.subtotal || 0),
      discount_amount: Number(order.discountAmount || 0),
      applied_coupon: order.appliedCoupon || null,
      delivery_fee: Number(order.deliveryFee || 0),
      total_amount: Number(order.totalAmount || 0),
      delivery_type: order.deliveryType || 'Standard',
      status: order.status || 'Placed',
      delivery_window: order.deliveryWindow || 'Within 15 Mins',
      is_emergency: Boolean(order.isEmergency),
      payment_method: order.paymentMethod || 'COD',
      payment_status: order.paymentStatus || 'Unpaid',
      upi_id: order.upiId || 'abicharan07@axl',
      utr: order.utr || '',
      payment_proof: paymentProof,
      assigned_rider: order.assignedRider || 'Raju M. (+91 91234 56789)',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('orders').upsert(row);
    if (error) {
      console.warn('Supabase saveOrder error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveOrder exception:', err);
    return false;
  }
}

/**
 * Update order status in Supabase
 */
export async function updateOrderStatusInSupabase(orderId, status) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.warn('Supabase updateOrderStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateOrderStatus exception:', err);
    return false;
  }
}

/**
 * Update order payment status in Supabase
 */
export async function updateOrderPaymentInSupabase(orderId, paymentStatus, utr = '') {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const updatePayload = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };
    if (utr) updatePayload.utr = utr;

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.warn('Supabase updateOrderPayment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateOrderPayment exception:', err);
    return false;
  }
}

/**
 * Subscribe to realtime order updates
 */
export function subscribeToOrders(onUpdate) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (onUpdate) onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime subscription failed:', err);
    return () => {};
  }
}

/**
 * Subscribe to realtime product updates (inserts, updates, deletes)
 */
export function subscribeToProducts(onUpdate) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (onUpdate) onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime products subscription failed:', err);
    return () => {};
  }
}
