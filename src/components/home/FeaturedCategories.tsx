import React, { useRef } from 'react';
import { Category } from '../../types/ecommerce';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featured = categories.filter(c => c.is_featured);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Featured Categories
        </h2>
        <p className="text-xs text-slate-500 mt-1">Explore our range of 100% natural, farm-fresh pantry essentials</p>
      </div>

      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center z-10 opacity-80 hover:opacity-100 hover:bg-emerald-50 transition-all cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>

        {/* Categories Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth"
        >
          {featured.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="flex flex-col items-center gap-2 group/cat shrink-0 w-24 sm:w-28 text-center cursor-pointer transition-transform hover:-translate-y-1"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/80 group-hover/cat:border-emerald-600 group-hover/cat:shadow-md flex items-center justify-center overflow-hidden transition-all shadow-xs p-1">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name || 'Category'}
                    className="w-full h-full object-cover rounded-xl group-hover/cat:scale-105 transition-transform"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 flex items-center justify-center text-emerald-800 font-black text-base sm:text-lg uppercase">
                    {(cat.name || cat.slug || 'C').slice(0, 2)}
                  </div>
                )}
              </div>
              {(cat.name || cat.name_bn) && (
                <div className="flex flex-col">
                  {cat.name && (
                    <span className="text-xs font-semibold text-slate-800 group-hover/cat:text-emerald-800 transition-colors leading-tight">
                      {cat.name}
                    </span>
                  )}
                  {cat.name_bn && (
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {cat.name_bn}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center z-10 opacity-80 hover:opacity-100 hover:bg-emerald-50 transition-all cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </section>
  );
};
