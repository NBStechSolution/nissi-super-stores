import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { useStore } from '../context/StoreContext';

export default function CategoryRail() {
  const { selectedCategory, setSelectedCategory, products, language, t } = useStore();

  const TELUGU_CAT_NAMES = {
    all: 'అన్నీ',
    grocery: 'కిరాణా & బియ్యం',
    milk: 'పాలు & డైరీ',
    snacks: 'స్నాక్స్',
    drinks: 'కూల్ డ్రింక్స్',
    icecreams: 'ఐస్ క్రీమ్స్',
    pooja: 'పూజా సామాగ్రి',
    pickles: 'పచ్చళ్ళు',
    utility: 'బిల్లులు & రీఛార్జ్'
  };

  return (
    <div id="category-rail-section" className="w-full mb-4 sm:mb-6 scroll-mt-20">
      <div className="hidden sm:flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-serif font-semibold text-ink">
          {t('exploreCategories', language === 'te' ? 'విభాగాలు' : 'Explore Categories')}
        </h2>
        <span className="text-xs text-ink-soft font-sans">
          {language === 'te' ? 'తాజా సరుకులు అందుబాటులో ఉన్నాయి' : 'Fresh daily inventory'}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? products.length
              : products.filter((p) => p && p.category === cat.id).length;

          const catTitle =
            language === 'te' && TELUGU_CAT_NAMES[cat.id]
              ? TELUGU_CAT_NAMES[cat.id]
              : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border min-h-[38px] active:scale-95 ${
                isSelected
                  ? 'bg-saffron-gradient text-ink border-saffron-base shadow-md ring-2 ring-saffron-base/50 scale-[1.02]'
                  : 'bg-cardcream text-ink-soft border-hairline hover:bg-paper hover:border-forest/40'
              }`}
            >
              <span className="text-lg sm:text-base leading-none">{cat.icon}</span>
              <span>{catTitle}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isSelected
                    ? 'bg-ink/15 text-ink'
                    : 'bg-paper text-ink-soft/70 border border-hairline/40'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
