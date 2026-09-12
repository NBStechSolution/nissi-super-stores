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
 * Save new order to Supabase 'orders' table
 */
export async function saveOrderToSupabase(order) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const row = {
      id: order.id,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items,
      subtotal: order.subtotal,
      discount_amount: order.discountAmount,
      applied_coupon: order.appliedCoupon,
      delivery_fee: order.deliveryFee,
      total_amount: order.totalAmount,
      delivery_type: order.deliveryType,
      status: order.status,
      delivery_window: order.deliveryWindow,
      is_emergency: order.isEmergency,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      upi_id: order.upiId,
      utr: order.utr || '',
      payment_proof: order.paymentProof || null,
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
