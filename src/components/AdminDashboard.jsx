import React, { useState, useRef } from 'react';
import {
  Package,
  ShoppingBag,
  Truck,
  Store,
  BarChart3,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  FileText,
  X,
  Eye,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Printer,
  Volume2,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
  Megaphone
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { compressImage } from '../utils/imageCompressor';
import { SALES_TREND_DATA, CATEGORIES } from '../data/mockData';

const QUICK_UNITS = ['1 kg', '500 g', '250 g', '100 g', '1 L', '500 ml', '1 Pack', '1 Pc', '6 Pcs'];

export default function AdminDashboard() {
  const {
    isStoreOpen,
    setIsStoreOpen,
    isHolidayClosed,
    setIsHolidayClosed,
    holidayReason,
    setHolidayReason,
    emergencyAvailable,
    setEmergencyAvailable,
    products,
    updateProductStock,
    addNewProduct,
    editProduct,
    deleteProduct,
    duplicateProduct,
    storeAnnouncement,
    setStoreAnnouncement,
    playEmergencyChime,
    resetProductsToDefault,
    orders,
    updateOrderStatus,
    updateOrderPaymentStatus,
    setActiveView,
    setSelectedCategory
  } = useStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [productAddedToast, setProductAddedToast] = useState(null);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [announcementText, setAnnouncementText] = useState(storeAnnouncement?.text || '');
  const [announcementSavedToast, setAnnouncementSavedToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const [imageInputTab, setImageInputTab] = useState('upload'); // 'upload' | 'url'

  const initialFormState = {
    name: '',
    nameTe: '',
    category: 'grocery',
    price: '',
    mrp: '',
    unit: '1 kg',
    stock: '25',
    lowStockThreshold: '5',
    badge: 'New Arrival',
    description: '',
    image2D: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImage(file, 600, 600, 0.82);
      setFormData((prev) => ({ ...prev, image2D: compressed }));
      setFormError('');
    } catch (err) {
      setFormError('Could not process image file.');
      console.warn('Image compression error:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product title in English is required.');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid selling price (e.g. 50).');
      return;
    }
    const mrpNum = parseFloat(formData.mrp) || priceNum;
    if (mrpNum < priceNum) {
      setFormError('MRP cannot be lower than the selling price.');
      return;
    }

    if (editingProduct) {
      await editProduct(editingProduct.id, {
        ...formData,
        price: priceNum,
        mrp: mrpNum,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5
      });
      setProductAddedToast({
        id: editingProduct.id,
        name: formData.name,
        category: formData.category,
        price: priceNum,
        isEdit: true
      });
    } else {
      const created = await addNewProduct({
        ...formData,
        price: priceNum,
        mrp: mrpNum,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5
      });
      setProductAddedToast({
        id: created.id,
        name: created.name,
        category: created.category,
        price: created.price,
        isEdit: false
      });
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setFormError('');
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      nameTe: p.nameTe || '',
      category: p.category || 'grocery',
      price: String(p.price || ''),
      mrp: String(p.mrp || p.price || ''),
      unit: p.unit || '1 kg',
      stock: String(p.stock ?? 20),
      lowStockThreshold: String(p.lowStockThreshold ?? 5),
      badge: p.badge || 'New Arrival',
      description: p.description || '',
      image2D: p.image2D || ''
    });
    setImageInputTab(p.image2D?.startsWith('data:') || !p.image2D ? 'upload' : 'url');
    setIsAddProductOpen(true);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeDeliveriesCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const emergencyOrdersCount = orders.filter((o) => o.isEmergency).length;

  const handleExportCSV = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">

      {/* Top Quick Navigation & Master Return Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-paper p-3.5 rounded-2xl border border-hairline shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 px-4 py-2 bg-forest hover:bg-forest/90 text-paper font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer group"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Customer Storefront</span>
          </button>

          <button
            onClick={() => setActiveView('staff')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cardcream hover:bg-hairline/60 text-ink font-semibold text-xs rounded-xl border border-hairline transition-colors"
            title="Switch to Delivery Staff / Rider View"
          >
            <Truck className="w-3.5 h-3.5 text-forest" />
            <span>Delivery Rider Queue</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              isStoreOpen
                ? 'bg-forest text-paper border-forest'
                : 'bg-kumkum text-paper border-kumkum'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-paper animate-pulse' : 'bg-paper'}`} />
            <span>Store: {isStoreOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <span className="text-[11px] font-semibold text-ink-soft bg-cardcream px-2.5 py-1.5 rounded-xl border border-hairline/80 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span>Admin Control Active</span>
          </span>
        </div>
      </div>

      {/* Admin Title & Master Quick Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cardcream p-5 rounded-crate border border-hairline shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <Store className="w-6 h-6 text-forest" />
            <span>Nissi Store Admin Center</span>
          </h1>
          <p className="text-xs text-ink-soft font-sans mt-0.5">
            Live inventory, emergency order priorities, holiday calendar, and delivery management.
          </p>
        </div>

        {/* Store Master Switches & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData(initialFormState);
              setIsAddProductOpen(true);
            }}
            className="px-3.5 py-2 bg-saffron-gradient text-ink border border-saffron-base/60 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>

          <button
            onClick={playEmergencyChime}
            className="px-3 py-2 bg-paper hover:bg-cardcream text-ink border border-hairline rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Test 15-min emergency order sound alert"
          >
            <Volume2 className="w-3.5 h-3.5 text-kumkum" />
            <span>Test Chime</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-paper text-ink border border-hairline rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-cardcream transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-forest" /> Export CSV
          </button>

          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              isStoreOpen
                ? 'bg-forest text-paper border-forest shadow-sm'
                : 'bg-kumkum text-paper border-kumkum shadow-sm'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isStoreOpen ? 'bg-paper animate-pulse' : 'bg-paper'}`} />
            <span>Store: {isStoreOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <button
            onClick={() => setEmergencyAvailable(!emergencyAvailable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              emergencyAvailable
                ? 'bg-saffron-gradient text-ink border-saffron-base shadow-sm'
                : 'bg-paper text-ink-soft/50 border-hairline'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Emergency 15m: {emergencyAvailable ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Product Added Success Banner */}
      {productAddedToast && (
        <div className="p-4 bg-forest text-paper rounded-2xl text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-paper/20 rounded-xl text-lg">🎉</span>
            <div>
              <p className="font-bold text-sm">Product Added & Synced to Live Website!</p>
              <p className="text-paper/85 text-xs font-normal">
                "{productAddedToast.name}" is now live in the store catalog (₹{productAddedToast.price}). Customers can order it immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory(productAddedToast.category);
                setActiveView('home');
              }}
              className="px-3.5 py-1.5 bg-saffron-gradient text-ink font-bold rounded-xl text-xs flex items-center gap-1 hover:brightness-105 transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View on Storefront →</span>
            </button>
            <button
              onClick={() => setProductAddedToast(null)}
              className="p-1 hover:bg-paper/20 rounded-lg text-paper/80 hover:text-paper"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {downloadNotice && (
        <div className="p-3 bg-forest/10 border border-forest/30 text-forest rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Generating and downloading store ledger report in CSV format...</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Today's Orders */}
        <div className="bg-cardcream p-4 rounded-crate border border-hairline shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-soft font-medium block mb-1">Today's Orders</span>
            <span className="font-serif font-bold text-2xl text-ink">{orders.length}</span>
            <span className="text-[11px] text-forest font-semibold block mt-1">
              {emergencyOrdersCount} Emergency Orders
            </span>
          </div>
          <div className="p-3 bg-forest/10 rounded-2xl text-forest">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Deliveries */}
        <div className="bg-cardcream p-4 rounded-crate border border-hairline shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-soft font-medium block mb-1">Active Deliveries</span>
            <span className="font-serif font-bold text-2xl text-ink">{activeDeliveriesCount}</span>
            <span className="text-[11px] text-saffron-base font-bold block mt-1">
              Riders Dispatched
            </span>
          </div>
          <div className="p-3 bg-saffron-base/20 rounded-2xl text-ink">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Low Stock Count */}
        <div className="bg-cardcream p-4 rounded-crate border border-hairline shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-soft font-medium block mb-1">Low Stock Alert</span>
            <span className="font-serif font-bold text-2xl text-kumkum">{lowStockCount}</span>
            <span className="text-[11px] text-kumkum font-semibold block mt-1">
              Requires Reorder
            </span>
          </div>
          <div className="p-3 bg-kumkum/10 rounded-2xl text-kumkum">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="bg-cardcream p-4 rounded-crate border border-hairline shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-soft font-medium block mb-1">Today's Revenue</span>
            <span className="font-serif font-bold text-2xl text-forest">₹{totalRevenue}</span>
            <span className="text-[11px] text-forest font-semibold block mt-1">
              ₹199 Min Free Delivery Rule
            </span>
          </div>
          <div className="p-3 bg-forest text-paper rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Layout with Left Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Navigation Bar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-cardcream p-3 rounded-crate border border-hairline space-y-1">

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'text-ink-soft hover:bg-paper'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Queue</span>
              {emergencyOrdersCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-kumkum text-paper text-[10px] rounded-full font-bold">
                  {emergencyOrdersCount} Priority
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'text-ink-soft hover:bg-paper'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Live Inventory ({products.length})</span>
              {lowStockCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-saffron-base text-ink text-[10px] rounded-full font-bold">
                  {lowStockCount} Alert
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'text-ink-soft hover:bg-paper'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales Reports & Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'status'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'text-ink-soft hover:bg-paper'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Shop Status & Holidays</span>
            </button>

            <button
              onClick={() => setActiveTab('announcement')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'announcement'
                  ? 'bg-forest text-paper shadow-sm'
                  : 'text-ink-soft hover:bg-paper'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Store Notice & Banner</span>
              {storeAnnouncement?.enabled && (
                <span className="ml-auto w-2 h-2 rounded-full bg-saffron-base animate-pulse" />
              )}
            </button>

          </div>
        </div>

        {/* Tab Panel Content */}
        <div className="lg:col-span-9">

          {/* TAB 1: ORDERS TABLE */}
          {activeTab === 'orders' && (
            <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-ink">Active Customer Orders</h2>
                  <span className="text-xs text-ink-soft">Emergency orders highlighted in red</span>
                </div>
                <span className="text-xs font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-xl">
                  {orders.length} total recorded
                </span>
              </div>

              {/* Order Filters & Search Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: `All (${orders.length})` },
                    { id: 'Placed', label: 'Placed' },
                    { id: 'Confirmed', label: 'Confirmed' },
                    { id: 'Preparing', label: 'Preparing' },
                    { id: 'Packed', label: 'Packed' },
                    { id: 'Out for Delivery', label: 'Out for Delivery' },
                    { id: 'Delivered', label: 'Delivered' }
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setOrderStatusFilter(filterItem.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        orderStatusFilter === filterItem.id
                          ? 'bg-forest text-paper shadow-xs'
                          : 'bg-paper text-ink-soft hover:bg-cardcream border border-hairline'
                      }`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-soft/60" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by customer name, phone, order ID, or address..."
                    className="w-full pl-9 pr-14 py-2 bg-paper rounded-xl text-xs text-ink border border-hairline focus:outline-none focus:border-forest"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper border-b border-hairline text-ink-soft font-semibold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/50">
                    {orders
                      .filter((ord) => {
                        if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
                        if (!orderSearch.trim()) return true;
                        const q = orderSearch.toLowerCase();
                        const idMatch = (ord.id || '').toLowerCase().includes(q);
                        const nameMatch = (ord.customerName || '').toLowerCase().includes(q);
                        const phoneMatch = String(ord.phone || '').includes(q);
                        const addrMatch = (ord.address || ord.deliveryAddress || '').toLowerCase().includes(q);
                        return idMatch || nameMatch || phoneMatch || addrMatch;
                      })
                      .map((ord) => (
                      <tr
                        key={ord.id}
                        className={`transition-colors ${
                          ord.isEmergency
                            ? 'bg-kumkum/10 font-medium'
                            : 'hover:bg-paper/60'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-ink">
                          #{ord.id}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold block text-ink">{ord.customerName || 'Customer'}</span>
                          <span className="text-[10px] text-ink-soft/70 font-mono">{ord.phone || ''}</span>
                        </td>
                        <td className="p-3">
                          {ord.isEmergency ? (
                            <span className="px-2 py-0.5 bg-kumkum text-paper rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-paper" /> Emergency
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-forest/10 text-forest rounded-full text-[10px] font-semibold">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-ink-soft">
                          {(ord.items || []).map((i) => `${i.name || 'Item'}${i.unit ? ` (${i.unit})` : ''}`).join(', ')}
                        </td>
                        <td className="p-3 font-mono font-bold text-forest">
                          ₹{ord.totalAmount}
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="block font-medium text-ink truncate max-w-[130px]">{ord.paymentMethod || 'COD'}</span>
                            {ord.paymentStatus === 'Paid' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                                ✓ Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => updateOrderPaymentStatus(ord.id, 'Paid')}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-ink bg-saffron-base/30 hover:bg-saffron-base/50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                title="Click to mark payment as collected"
                              >
                                <span>{ord.paymentStatus?.includes('Unpaid') ? 'Mark Paid' : ord.paymentStatus || 'Mark Paid'}</span>
                              </button>
                            )}
                            {ord.utr && <span className="block font-mono text-[9px] text-ink-soft truncate">Ref: {ord.utr}</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-paper border border-hairline rounded-lg font-semibold text-ink">
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                              className="p-1.5 bg-paper rounded-lg border border-hairline text-[11px] font-semibold focus:outline-none"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Packed">Packed</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => setPrintOrder(ord)}
                              className="p-1.5 bg-paper hover:bg-cardcream border border-hairline rounded-lg text-ink-soft hover:text-ink transition-colors"
                              title="Print Thermal Packing Slip"
                            >
                              <Printer className="w-3.5 h-3.5 text-forest" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY STOCK MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-ink">Inventory Stock Management</h2>
                  <span className="text-xs text-ink-soft">
                    {products.length} products listed • Live storefront synchronization active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-3.5 py-1.5 bg-forest text-paper rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-forest/90 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Product
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-2.5 py-1.5 bg-paper text-ink-soft hover:text-ink border border-hairline rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Reset to default mock products"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>

              {/* Reset Catalog Warning Modal */}
              {showResetConfirm && (
                <div className="p-3 bg-kumkum/10 border border-kumkum/30 text-kumkum rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Restore default mock catalog and remove added items?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetProductsToDefault();
                        setShowResetConfirm(false);
                      }}
                      className="px-2.5 py-1 bg-kumkum text-paper rounded-lg font-bold"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1 bg-paper text-ink border border-hairline rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: `All Products (${products.length})` },
                  { id: 'grocery', label: 'Grains & Flours' },
                  { id: 'oils', label: 'Oils & Ghee' },
                  { id: 'spices', label: 'Masalas & Spices' },
                  { id: 'dairy', label: 'Dairy & Fresh' },
                  { id: 'beverages', label: 'Beverages' },
                  { id: 'snacks', label: 'Snacks' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setInventoryCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      inventoryCategory === cat.id
                        ? 'bg-forest text-paper shadow-xs'
                        : 'bg-paper text-ink-soft hover:bg-cardcream border border-hairline'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Filter Inventory by Name */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-soft/60" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter inventory by product name or keywords..."
                  className="w-full pl-9 pr-14 py-2 bg-paper rounded-xl text-xs text-ink border border-hairline focus:outline-none focus:border-forest"
                />
                {inventorySearch && (
                  <button
                    onClick={() => setInventorySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products
                  .filter((p) => {
                    if (!p) return false;
                    if (inventoryCategory !== 'all' && p.category !== inventoryCategory) return false;
                    if (!inventorySearch.trim()) return true;
                    const q = inventorySearch.toLowerCase();
                    const nameStr = (p.name || '').toLowerCase();
                    const catStr = (p.category || '').toLowerCase();
                    const nameTeStr = (p.nameTe || '').toLowerCase();
                    return nameStr.includes(q) || catStr.includes(q) || nameTeStr.includes(q);
                  })
                  .map((p) => {
                    let barColor = 'bg-forest';
                    if (p.stock === 0) barColor = 'bg-kumkum';
                    else if (p.stock <= p.lowStockThreshold) barColor = 'bg-saffron-base';

                    const maxVal = Math.max(30, p.stock + 10);
                    const fillPct = Math.min(100, (p.stock / maxVal) * 100);

                    return (
                      <div key={p.id} className="p-4 bg-paper border border-hairline rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-cardcream border border-hairline/70 overflow-hidden flex items-center justify-center shrink-0">
                              {p.image2D ? (
                                <img
                                  src={p.image2D}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <span className="text-xl">{p.fallbackEmoji || '🛒'}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-serif font-semibold text-sm text-ink line-clamp-1">{p.name}</span>
                                {p.stock === 0 ? (
                                  <span className="px-1.5 py-0.5 bg-kumkum/15 text-kumkum text-[9px] font-bold rounded-md">Out of Stock</span>
                                ) : p.stock <= p.lowStockThreshold ? (
                                  <span className="px-1.5 py-0.5 bg-saffron-base/25 text-ink text-[9px] font-bold rounded-md">Low Stock</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-forest/15 text-forest text-[9px] font-bold rounded-md">In Stock</span>
                                )}
                              </div>
                              <span className="text-[10px] text-ink-soft capitalize">
                                ₹{p.price} {p.mrp > p.price && <span className="line-through text-[9px] opacity-70">₹{p.mrp}</span>} • {p.unit} • {p.category}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold shrink-0">{p.stock} units</span>
                        </div>

                        <div className="w-full h-2 bg-hairline/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} transition-all duration-300`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-hairline/40">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-2 py-1 bg-cardcream hover:bg-forest/10 hover:text-forest border border-hairline rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                const cloned = duplicateProduct(p.id);
                                if (cloned) {
                                  setProductAddedToast({
                                    id: cloned.id,
                                    name: cloned.name,
                                    category: cloned.category,
                                    price: cloned.price,
                                    isEdit: false
                                  });
                                }
                              }}
                              className="px-2 py-1 bg-cardcream hover:bg-forest/10 hover:text-forest border border-hairline rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              title="Duplicate / Clone product as a variation"
                            >
                              <Copy className="w-3 h-3" /> Clone
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="px-2 py-1 bg-cardcream hover:bg-kumkum/10 hover:text-kumkum border border-hairline rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateProductStock(p.id, p.stock + 5)}
                              className="px-1.5 py-1 bg-cardcream hover:bg-forest/15 hover:text-forest border border-hairline rounded-md text-[10px] font-bold text-ink transition-colors"
                              title="Add 5 to stock"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => updateProductStock(p.id, p.stock + 10)}
                              className="px-1.5 py-1 bg-cardcream hover:bg-forest/15 hover:text-forest border border-hairline rounded-md text-[10px] font-bold text-ink transition-colors"
                              title="Add 10 to stock"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => updateProductStock(p.id, p.stock - 1)}
                              className="p-1 bg-cardcream hover:bg-hairline/50 rounded-md text-ink"
                              title="Decrease stock by 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={p.stock}
                              onChange={(e) => updateProductStock(p.id, e.target.value)}
                              className="w-11 text-center p-1 bg-cardcream border border-hairline text-xs font-mono font-bold rounded-md"
                            />
                            <button
                              onClick={() => updateProductStock(p.id, p.stock + 1)}
                              className="p-1 bg-cardcream hover:bg-hairline/50 rounded-md text-ink"
                              title="Increase stock by 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: RECHARTS SALES REPORTS & TRENDS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">

              <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-3">
                <h2 className="font-serif font-bold text-lg text-ink">Hourly Sales & Revenue Trend</h2>
                <p className="text-xs text-ink-soft">Real-time revenue performance throughout the day</p>

                <div className="w-full h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SALES_TREND_DATA}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#123027" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#123027" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8CDB8" />
                      <XAxis dataKey="time" stroke="#12231B" fontSize={11} />
                      <YAxis stroke="#12231B" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#F6F7F1', borderColor: '#D8CDB8', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#123027" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-3">
                <h2 className="font-serif font-bold text-lg text-ink">Emergency 15-Min Delivery Breakdown</h2>
                <p className="text-xs text-ink-soft">Emergency vs Total Orders volume by hour</p>

                <div className="w-full h-60 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8CDB8" />
                      <XAxis dataKey="time" stroke="#12231B" fontSize={11} />
                      <YAxis stroke="#12231B" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#F6F7F1', borderColor: '#D8CDB8', borderRadius: '12px' }}
                      />
                      <Bar dataKey="orders" fill="#123027" radius={[6, 6, 0, 0]} name="Total Orders" />
                      <Bar dataKey="emergency" fill="#B23A30" radius={[6, 6, 0, 0]} name="Emergency Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SHOP STATUS & HOLIDAYS */}
          {activeTab === 'status' && (
            <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-6">
              <h2 className="font-serif font-bold text-lg text-ink">Shop Operating Hours & Holiday Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Store Schedule & Holiday Override Panel */}
                <div className="p-4 bg-paper border border-hairline rounded-2xl space-y-3">
                  <h3 className="font-semibold text-ink font-serif text-sm">Holiday & Closure Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-ink">
                      <span>Enable Holiday Closure Override</span>
                      <input
                        type="checkbox"
                        checked={isHolidayClosed}
                        onChange={(e) => setIsHolidayClosed(e.target.checked)}
                        className="accent-kumkum w-4 h-4"
                      />
                    </label>

                    <div>
                      <label className="block font-semibold text-ink-soft mb-1">Temporary Closure Reason</label>
                      <input
                        type="text"
                        value={holidayReason}
                        onChange={(e) => setHolidayReason(e.target.value)}
                        placeholder="e.g. Festival Holiday / Inventory Audit"
                        className="w-full p-2 bg-cardcream rounded-lg border border-hairline text-ink focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center justify-between text-ink">
                        <span>Store Open for Orders</span>
                        <input
                          type="checkbox"
                          checked={isStoreOpen}
                          onChange={(e) => setIsStoreOpen(e.target.checked)}
                          className="accent-forest w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Delivery Staff Assignment */}
                <div className="p-4 bg-paper border border-hairline rounded-2xl space-y-3">
                  <h3 className="font-semibold text-ink font-serif text-sm">Active Delivery Staff (3 On Duty)</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-cardcream rounded-xl">
                      <span>Rider #1: Raju M.</span>
                      <span className="text-forest font-bold">Active (Order #9842)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-cardcream rounded-xl">
                      <span>Rider #2: Srinivas K.</span>
                      <span className="text-forest font-bold">Available</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-cardcream rounded-xl">
                      <span>Rider #3: Mahesh B.</span>
                      <span className="text-forest font-bold">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STORE ANNOUNCEMENT & BANNER */}
          {activeTab === 'announcement' && (
            <div className="bg-cardcream border border-hairline rounded-crate p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-forest" />
                    <span>Store Announcement & Notice Banner</span>
                  </h2>
                  <p className="text-xs text-ink-soft">
                    Broadcast instant updates, seasonal harvest alerts, or festival delivery announcements directly to your customers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStoreAnnouncement((prev) => ({ ...prev, enabled: !prev.enabled }));
                    setAnnouncementSavedToast(true);
                    setTimeout(() => setAnnouncementSavedToast(false), 3000);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    storeAnnouncement?.enabled
                      ? 'bg-forest text-paper border-forest'
                      : 'bg-paper text-ink-soft border-hairline'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${storeAnnouncement?.enabled ? 'bg-paper animate-pulse' : 'bg-kumkum'}`} />
                  <span>Banner: {storeAnnouncement?.enabled ? 'ACTIVE ON SITE' : 'PAUSED'}</span>
                </button>
              </div>

              {announcementSavedToast && (
                <div className="p-3 bg-forest/15 border border-forest/30 text-forest rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Announcement banner updated and synced to live customer storefront!</span>
                </div>
              )}

              {/* Edit Banner Form */}
              <div className="p-4 bg-paper rounded-2xl border border-hairline space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Live Banner Announcement Message
                  </label>
                  <textarea
                    rows={3}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter broadcast message for customers..."
                    className="w-full p-3 bg-cardcream/60 rounded-xl border border-hairline text-ink text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">
                    Quick Suggestion Presets:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '🌾 Fresh organic harvest Sona Masoori Raw Rice arrived today! Order fresh.',
                      '⚡ 15-Minute Emergency Delivery Active across Jubilee Hills & Banjara Hills.',
                      '🎉 Festival Special: Free Delivery on all grocery orders above ₹199!',
                      '🥥 Cold-Pressed Sesame & Groundnut Oil restocked in fresh 1L bottles.',
                      '🌧️ Monsoon Advisory: Delivery riders equipped with waterproof packaging.'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnnouncementText(preset)}
                        className="px-2.5 py-1 bg-cardcream hover:bg-hairline/60 text-ink border border-hairline/80 rounded-lg text-[11px] text-left transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-hairline">
                  <span className="text-[11px] text-ink-soft">
                    Changes immediately reflect on customer homepage upon saving.
                  </span>
                  <button
                    onClick={() => {
                      setStoreAnnouncement({
                        text: announcementText.trim() || 'Welcome to Nissi Super Stores!',
                        enabled: true
                      });
                      setAnnouncementSavedToast(true);
                      setTimeout(() => setAnnouncementSavedToast(false), 3000);
                    }}
                    className="px-4 py-2 bg-forest hover:bg-forest/90 text-paper font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Publish to Storefront</span>
                  </button>
                </div>
              </div>

              {/* Storefront Preview of the Banner */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Customer Storefront Live Preview
                </span>
                <div className="p-3 bg-forest text-paper rounded-2xl text-xs font-medium flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📢</span>
                    <span>{announcementText || 'Store announcement will be displayed here'}</span>
                  </div>
                  <span className="text-[10px] bg-paper/20 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                    Live Banner
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD NEW PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-cardcream border border-hairline rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-paper border-b border-hairline flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-forest/10 text-forest rounded-xl">
                  {editingProduct ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-ink">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Storefront'}
                  </h2>
                  <p className="text-xs text-ink-soft">Instantly visible in search, categories, and customer cart</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                  setFormError('');
                }}
                className="p-2 hover:bg-cardcream rounded-xl text-ink-soft hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form & Live Preview */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {formError && (
                <div className="p-3 bg-kumkum/10 border border-kumkum/30 text-kumkum rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Form Fields Column */}
                <form id="add-product-form" onSubmit={handleCreateProduct} className="lg:col-span-7 space-y-4 text-xs">

                  {/* Product Names (English & Telugu) */}
                  <div className="space-y-3 p-4 bg-paper rounded-2xl border border-hairline">
                    <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-forest" />
                      <span>Product Information</span>
                    </h3>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        Product Name (English) <span className="text-kumkum">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sona Masoori Raw Rice"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-ink-soft mb-1">
                        Telugu Name (తెలుగు పేరు - Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. సోనా మసూరి బియ్యం"
                        value={formData.nameTe}
                        onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
                        className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest"
                      />
                    </div>

                    {/* Category & Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-ink mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest font-medium"
                        >
                          {CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'utilities').map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-ink mb-1">Pack Size / Unit</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 kg, 500 ml, 1 Pack"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>

                    {/* Quick Unit Chips */}
                    <div>
                      <span className="text-[10px] text-ink-soft/80 font-medium">Quick Select Unit:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {QUICK_UNITS.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setFormData({ ...formData, unit: u })}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                              formData.unit === u
                                ? 'bg-forest text-paper border-forest'
                                : 'bg-paper text-ink-soft hover:text-ink border-hairline hover:bg-cardcream'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Stock Card */}
                  <div className="space-y-3 p-4 bg-paper rounded-2xl border border-hairline">
                    <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-forest" />
                      <span>Pricing & Inventory</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ink mb-1">
                          Selling Price (₹) <span className="text-kumkum">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          required
                          placeholder="e.g. 120"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink font-mono font-bold focus:outline-none focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-ink mb-1">MRP (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="e.g. 140"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink font-mono focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>

                    {/* Live Margin / Discount Feedback */}
                    {parseFloat(formData.mrp) > parseFloat(formData.price) && (
                      <div className="p-2 bg-forest/10 border border-forest/20 rounded-xl text-[11px] text-forest font-semibold flex items-center justify-between">
                        <span>Customer Discount:</span>
                        <span>
                          Save ₹{Math.round(parseFloat(formData.mrp) - parseFloat(formData.price))} ({Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}% OFF)
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-ink mb-1">Initial Stock (Units)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink font-mono focus:outline-none focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-ink mb-1">Low Stock Alert Level</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.lowStockThreshold}
                          onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink font-mono focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Photo Upload Section */}
                  <div className="space-y-3 p-4 bg-paper rounded-2xl border border-hairline">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-forest" />
                        <span>Product Photo</span>
                      </h3>

                      {/* Upload Mode Toggle */}
                      <div className="flex items-center gap-1 bg-cardcream p-1 rounded-xl border border-hairline text-[11px]">
                        <button
                          type="button"
                          onClick={() => setImageInputTab('upload')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            imageInputTab === 'upload' ? 'bg-forest text-paper shadow-xs' : 'text-ink-soft hover:text-ink'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputTab('url')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            imageInputTab === 'url' ? 'bg-forest text-paper shadow-xs' : 'text-ink-soft hover:text-ink'
                          }`}
                        >
                          Web URL
                        </button>
                      </div>
                    </div>

                    {imageInputTab === 'upload' ? (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-hairline hover:border-forest rounded-2xl p-4 text-center cursor-pointer bg-cardcream/40 hover:bg-cardcream/80 transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink">Click to upload photo from device / camera</p>
                            <p className="text-[10px] text-ink-soft">Supports PNG, JPG, JPEG, WEBP (Max 5 MB)</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={formData.image2D}
                          onChange={(e) => setFormData({ ...formData, image2D: e.target.value })}
                          className="flex-1 p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest text-[11px]"
                        />
                      </div>
                    )}

                    {formData.image2D && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-forest font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Photo attached
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image2D: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-kumkum hover:underline font-semibold text-[11px]"
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Badge & Description */}
                  <div className="space-y-3 p-4 bg-paper rounded-2xl border border-hairline">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ink mb-1">Badge Tag</label>
                        <select
                          value={formData.badge}
                          onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest font-medium"
                        >
                          <option value="">None</option>
                          <option value="New Arrival">New Arrival</option>
                          <option value="Best Seller">Best Seller</option>
                          <option value="Popular">Popular</option>
                          <option value="Fresh Batch">Fresh Batch</option>
                          <option value="Special Offer">Special Offer</option>
                          <option value="Organic">Organic</option>
                          <option value="Direct from Mill">Direct from Mill</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-ink mb-1">Short Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Fresh farm sourced, premium quality"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-2.5 bg-cardcream/60 rounded-xl border border-hairline text-ink focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>
                  </div>

                </form>

                {/* Right Column: Live Card Preview */}
                <div className="lg:col-span-5 flex flex-col justify-start space-y-3 sticky top-4">
                  <div className="text-center">
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Customer Storefront Preview
                    </span>
                    <p className="text-[11px] text-ink-soft/70">Updates in real time as you fill the form</p>
                  </div>

                  {/* Live Product Card Mockup */}
                  <div className="bg-paper border border-hairline rounded-3xl p-4 shadow-sm space-y-3 max-w-sm mx-auto w-full">
                    {/* Image Area */}
                    <div className="w-full h-44 rounded-2xl bg-cardcream/80 flex items-center justify-center relative overflow-hidden border border-hairline/60">
                      {formData.image2D ? (
                        <img
                          src={formData.image2D}
                          alt={formData.name || 'Preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-5xl">
                            {CATEGORIES.find((c) => c.id === formData.category)?.icon || '🛒'}
                          </span>
                          <p className="text-[10px] text-ink-soft">No photo (Category icon used)</p>
                        </div>
                      )}

                      {/* Badge Tag */}
                      {formData.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-forest text-paper text-[10px] font-bold rounded-full shadow-xs">
                          {formData.badge}
                        </span>
                      )}

                      {/* Discount Tag */}
                      {parseFloat(formData.mrp) > parseFloat(formData.price) && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-saffron-base text-ink text-[10px] font-bold rounded-full shadow-xs">
                          {Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                        {CATEGORIES.find((c) => c.id === formData.category)?.name || formData.category}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-ink line-clamp-1">
                        {formData.name || 'Product Title'}
                      </h3>
                      {formData.nameTe && (
                        <p className="text-[11px] text-ink-soft/80 line-clamp-1">{formData.nameTe}</p>
                      )}
                      <p className="text-[10px] text-ink-soft">{formData.unit || '1 Unit'}</p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-2 border-t border-hairline flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-bold text-base text-ink">
                            ₹{formData.price || '0'}
                          </span>
                          {parseFloat(formData.mrp) > parseFloat(formData.price) && (
                            <span className="font-mono text-xs text-ink-soft line-through">
                              ₹{formData.mrp}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-forest font-semibold">
                          Stock: {formData.stock || 0} units
                        </span>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-saffron-gradient text-ink font-bold text-xs rounded-xl shadow-xs"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-paper border-t border-hairline flex items-center justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                  setFormError('');
                }}
                className="px-4 py-2 bg-cardcream hover:bg-hairline/60 text-ink rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-product-form"
                className="px-5 py-2 bg-forest hover:bg-forest/90 text-paper rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                {editingProduct ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                <span>{editingProduct ? 'Save Product Changes' : 'Add Product to Live Store'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-cardcream border border-hairline rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-kumkum">
              <div className="p-2 bg-kumkum/10 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">Delete Product?</h3>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Are you sure you want to delete <strong className="text-ink">"{productToDelete.name}"</strong>? This item will be permanently removed from the storefront and cart.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 bg-paper border border-hairline rounded-xl text-xs font-semibold text-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-1.5 bg-kumkum text-paper rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT THERMAL PACKING SLIP MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-black border border-hairline rounded-2xl p-6 max-w-md w-full font-mono text-xs space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Thermal Receipt Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
              <img
                src="/logo.jpeg"
                alt="Nissi Logo"
                className="w-12 h-12 rounded-full mx-auto mb-1.5 object-cover ring-1 ring-gray-300"
              />
              <h2 className="font-bold text-base tracking-wider uppercase">NISSI SUPER STORES</h2>
              <p className="text-[10px] text-gray-600">Kirana at Delivery Speed • Hyderabad</p>
              <p className="text-[9px] text-gray-500">GSTIN: 36AABCN1234F1Z8 • FSSAI: 13622011000452</p>
              <p className="text-[10px] font-bold mt-1">ORDER #{printOrder.id} ({printOrder.deliveryType})</p>
            </div>

            {/* Customer Details */}
            <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-gray-400">
              <p><strong>Customer:</strong> {printOrder.customerName}</p>
              <p><strong>Phone:</strong> {printOrder.phone}</p>
              <p><strong>Address:</strong> {printOrder.address}</p>
              <p><strong>Time:</strong> {printOrder.placedAt}</p>
              <p className="text-forest font-bold"><strong>HANDOVER:</strong> Direct Delivery</p>
            </div>

            {/* Itemized Table */}
            <div className="space-y-1 py-1 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between font-bold pb-1">
                <span>ITEM</span>
                <span>QTY x RATE = AMT</span>
              </div>
              {(printOrder.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[200px]">{it.name || 'Item'}{it.unit ? ` (${it.unit})` : ''}</span>
                  <span>{it.quantity || 1} x ₹{it.price || 0} = ₹{(it.quantity || 1) * (it.price || 0)}</span>
                </div>
              ))}
            </div>

            {/* Total Calculations */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{printOrder.subtotal}</span>
              </div>
              {printOrder.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon ({printOrder.appliedCoupon}):</span>
                  <span>-₹{printOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{printOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-400">
                <span>TOTAL PAYABLE:</span>
                <span>₹{printOrder.totalAmount}</span>
              </div>
              <p className="text-[10px] text-gray-600">Payment: {printOrder.paymentMethod || 'COD'}</p>
            </div>

            {/* Simulated Barcode */}
            <div className="text-center pt-2 space-y-1">
              <div className="flex justify-center items-end h-8 gap-0.5">
                {[4, 2, 6, 3, 8, 2, 5, 2, 7, 3, 5, 2, 8, 3, 6, 2, 4, 3, 7, 2, 5, 4, 6].map((h, i) => (
                  <div key={i} className="bg-black w-1" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="text-[9px] text-gray-500 tracking-widest font-mono">*{printOrder.id}*</span>
              <p className="text-[9px] text-gray-500">Thank you for shopping at Nissi Super Stores!</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-300 print:hidden font-sans">
              <button
                onClick={() => setPrintOrder(null)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
