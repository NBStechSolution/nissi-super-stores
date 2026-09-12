import React from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function DeleteConfirmationModal() {
  const { productToDelete, setProductToDelete, deleteProduct, setSelectedProduct, language } = useStore();

  if (!productToDelete) return null;

  const handleConfirm = () => {
    deleteProduct(productToDelete.id);
    setSelectedProduct(null);
    setProductToDelete(null);
  };

  return (
    <div
      onClick={() => setProductToDelete(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border border-hairline rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up"
      >
        <div className="flex items-center gap-3 text-kumkum">
          <div className="p-2.5 bg-kumkum/10 rounded-xl border border-kumkum/20">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              {language === 'te' ? 'సరుకును తొలగించాలా?' : 'Delete Item from Store?'}
            </h3>
            <span className="text-[10px] text-kumkum font-bold uppercase tracking-wide">
              Permanent Deletion
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-soft leading-relaxed">
          {language === 'te' ? (
            <>
              మీరు <strong className="text-ink">"{productToDelete.name}"</strong> ను స్టోర్ నుండి శాశ్వతంగా తొలగించాలనుకుంటున్నారా? ఇది కస్టమర్ స్టోర్‌ఫ్రంట్ మరియు డేటాబేస్ నుండి తొలగించబడుతుంది.
            </>
          ) : (
            <>
              Are you sure you want to delete <strong className="text-ink">"{productToDelete.name}"</strong>? This item will be permanently removed from the storefront, database, and all shopping baskets.
            </>
          )}
        </p>

        <div className="p-2.5 bg-cardcream rounded-xl border border-hairline flex items-center gap-2 text-xs">
          <span className="text-2xl">{productToDelete.fallbackEmoji || '🧺'}</span>
          <div className="min-w-0">
            <div className="font-bold text-ink truncate">{productToDelete.name}</div>
            <div className="text-[11px] text-ink-soft font-mono">
              ₹{productToDelete.price} • {productToDelete.unit}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setProductToDelete(null)}
            className="px-4 py-2 bg-cardcream hover:bg-paper border border-hairline rounded-xl text-xs font-semibold text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-kumkum hover:bg-kumkum/90 text-paper rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
