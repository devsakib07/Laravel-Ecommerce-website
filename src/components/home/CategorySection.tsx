import React from 'react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight } from 'lucide-react';
import { storage } from '../../services/storage';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categorySlug: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewAll: (categorySlug: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  subtitle,
  categorySlug,
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

  const limit = resp?.product_cols_pc === 6 ? 6 : resp?.product_cols_pc === 5 ? 5 : resp?.product_cols_pc === 4 ? 4 : 3;
  const displayProducts = products.slice(0, limit);

  if (displayProducts.length === 0) return null;

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={() => onViewAll(categorySlug)}
          className="text-xs font-semibold text-emerald-800 hover:text-[#E25C1D] flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <span>VIEW ALL ITEMS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Responsive Product Grid */}
      <div className={`grid ${colsPhone} sm:grid-cols-2 ${colsTab} ${colsPc} gap-3 sm:gap-4`}>
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onQuickView={onQuickView}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>

      {/* Decorative Dots indicator matching screenshot */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        <span className="w-2 h-2 rounded-full bg-[#E25C1D]" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
      </div>
    </section>
  );
};
