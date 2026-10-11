import React, { useState } from 'react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight } from 'lucide-react';
import { storage } from '../../services/storage';

interface JustForYouSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewAll: () => void;
}

export const JustForYouSection: React.FC<JustForYouSectionProps> = ({
  products,
  onProductClick,
  onQuickView,
  onBuyNow,
  onViewAll,
}) => {
  const settings = storage.getSettings();
  const resp = settings.responsive_design;
  const colsPhone = resp?.product_cols_phone === 1 ? 'grid-cols-1' : 'grid-cols-2';
  const colsTab = resp?.product_cols_tab === 2 ? 'md:grid-cols-2' : resp?.product_cols_tab === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  const colsPc = resp?.product_cols_pc === 3 ? 'lg:grid-cols-3' : resp?.product_cols_pc === 4 ? 'lg:grid-cols-4' : resp?.product_cols_pc === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5';

  const [visibleCount, setVisibleCount] = useState(10);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, products.length));
  };

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Just For You
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Handpicked pure & safe daily items tailored for your pantry</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-800 hover:text-[#E25C1D] flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <span>VIEW ALL PRODUCTS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Responsive Product Grid */}
      <div className={`grid ${colsPhone} sm:grid-cols-2 ${colsTab} ${colsPc} gap-3 sm:gap-4`}>
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onQuickView={onQuickView}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-8 py-2.5 rounded-full border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold tracking-wider uppercase transition-all shadow-xs"
          >
            LOAD MORE
          </button>
        </div>
      )}
    </section>
  );
};
