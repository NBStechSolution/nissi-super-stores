import React, { useState, useRef } from 'react';
import { X, Plus, Upload, Sparkles, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/mockData';

export default function QuickAddProductModal() {
  const { isQuickAddOpen, setIsQuickAddOpen, addNewProduct, language } = useStore();

  const fileInputRef = useRef(null);
  const [imageMode, setImageMode] = useState('emoji'); // 'emoji' | 'upload' | 'url'
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  const EMOJI_OPTIONS = ['🌾', '🥛', '🍿', '🧈', '🪔', '🍦', '🥤', '🫙', '☕', '🍪', '🍫', '🍎', '🥦', '🧼', '🍞', '🧺'];

  const initialForm = {
    name: '',
    nameTe: '',
    category: 'grocery',
    price: '',
    mrp: '',
    unit: '1 kg',
    stock: '25',
    lowStockThreshold: '5',
    badge: 'Fresh Arrival',
    description: '',
    image2D: '',
    fallbackEmoji: '🛒',
    imageBg: '#F7F3EB'
  };

  const [formData, setFormData] = useState(initialForm);

  if (!isQuickAddOpen) return null;

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFormError('Image size must be under 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData((prev) => ({ ...prev, image2D: evt.target.result }));
      setFormError('');
    };
    reader.onerror = () => {
      setFormError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Product Name in English is required.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid selling price (₹).');
      return;
    }

    const mrpNum = parseFloat(formData.mrp) || priceNum;
    if (mrpNum < priceNum) {
      setFormError('MRP cannot be lower than the selling price.');
      return;
    }

    const created = addNewProduct({
      name: formData.name.trim(),
      nameTe: formData.nameTe.trim() || formData.name.trim(),
      category: formData.category,
      price: priceNum,
      mrp: mrpNum,
      unit: formData.unit.trim() || '1 Unit',
      stock: parseInt(formData.stock) || 10,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      badge: formData.badge.trim() || 'Fresh Arrival',
      description: formData.description.trim() || `Fresh ${formData.name.trim()} available at Nissi Super Stores.`,
      image2D: formData.image2D.trim(),
      fallbackEmoji: formData.fallbackEmoji || '🛒',
      imageBg: formData.imageBg || '#F7F3EB'
    });

    setSuccessMsg(`"${created.name}" added to store catalogue!`);
    setTimeout(() => {
      setSuccessMsg('');
      setFormData(initialForm);
      setIsQuickAddOpen(false);
    }, 1200);
  };

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setFormError('');
    setSuccessMsg('');
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-paper border border-hairline rounded-t-3xl sm:rounded-crate max-sm:border-b-0 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto safe-area-bottom animate-scale-up"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-forest/10 text-forest rounded-xl">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-ink">
                {language === 'te' ? 'కొత్త సరుకును జోడించండి' : 'Add New Product to Store'}
              </h2>
              <p className="text-[11px] text-ink-soft">
                Live instantly on customer storefront and saved to cloud database
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 bg-cardcream text-ink-soft hover:text-ink rounded-full border border-hairline transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3 bg-kumkum/10 border border-kumkum/30 text-kumkum text-xs font-semibold rounded-xl animate-shake">
            {formError}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-forest/10 border border-forest/30 text-forest text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Titles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Product Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aashirvaad Shudh Chakki Atta (5kg)"
                className="w-full px-3.5 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs sm:text-sm text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                తెలుగు పేరు (Telugu Title - Optional)
              </label>
              <input
                type="text"
                value={formData.nameTe}
                onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
                placeholder="ఉదా: ఆశీర్వాద్ గోధుమ పిండి (5కిలోలు)"
                className="w-full px-3.5 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs sm:text-sm text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Unit / Size *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 500g / 1 Litre / 1 Piece"
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Row 3: Price & MRP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 199"
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                MRP (₹ Cut Price)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="e.g. 230"
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Row 4: Stock & Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Initial Stock Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="25"
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Tag / Badge
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Popular / 100% Pure"
                className="w-full px-3 py-2.5 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Visual Choice: Emoji vs Upload vs URL */}
          <div className="p-3 bg-cardcream/50 rounded-2xl border border-hairline space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink">Product Visual / Icon</label>
              <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-hairline text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageMode('emoji')}
                  className={`px-2 py-0.5 rounded ${imageMode === 'emoji' ? 'bg-forest text-paper' : 'text-ink-soft'}`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2 py-0.5 rounded ${imageMode === 'upload' ? 'bg-forest text-paper' : 'text-ink-soft'}`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2 py-0.5 rounded ${imageMode === 'url' ? 'bg-forest text-paper' : 'text-ink-soft'}`}
                >
                  URL
                </button>
              </div>
            </div>

            {imageMode === 'emoji' && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, fallbackEmoji: emoji, image2D: '' })}
                    className={`w-9 h-9 rounded-xl border text-xl flex items-center justify-center transition-all ${
                      formData.fallbackEmoji === emoji && !formData.image2D
                        ? 'bg-forest/15 border-forest scale-110 shadow-xs'
                        : 'bg-paper border-hairline hover:bg-cardcream'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {imageMode === 'upload' && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-paper border border-dashed border-forest/40 hover:border-forest text-forest font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File from Device (Max 4MB)</span>
                </button>
                {formData.image2D && (
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={formData.image2D}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-hairline shadow-xs"
                    />
                    <span className="text-[11px] text-forest font-semibold">Image loaded successfully</span>
                  </div>
                )}
              </div>
            )}

            {imageMode === 'url' && (
              <div>
                <input
                  type="url"
                  value={formData.image2D}
                  onChange={(e) => setFormData({ ...formData, image2D: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-paper border border-hairline rounded-xl text-xs text-ink focus:outline-none focus:border-forest"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Short Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Freshly sourced directly from trusted millers / distributors."
              className="w-full px-3.5 py-2 bg-cardcream/70 border border-hairline rounded-xl text-xs text-ink focus:outline-none focus:border-forest"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-saffron-gradient text-ink font-bold rounded-xl text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Item to Storefront (₹{formData.price || '0'})</span>
          </button>
        </form>
      </div>
    </div>
  );
}
