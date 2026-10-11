import React from 'react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';
import { storage } from '../../services/storage';

interface TopSellingSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const TopSellingSection: React.FC<TopSellingSectionProps> = ({
  products,
  onProductClick,
  onQuickView,
  onBuyNow,
}) => {
  const settings = storage.getSettings();
  const resp = settings.responsive_design;
  const colsPhone = resp?.product_cols_phone === 1 ? 'grid-cols-1' : 'grid-cols-2';
  const colsTab = resp?.product_cols_tab === 2 ? 'md:grid-cols-2' : resp?.product_cols_tab === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  const colsPc = resp?.product_cols_pc === 3 ? 'lg:grid-cols-3' : resp?.product_cols_pc === 4 ? 'lg:grid-cols-4' : resp?.product_cols_pc === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5';

  const limit = resp?.product_cols_pc === 6 ? 6 : resp?.product_cols_pc === 5 ? 5 : resp?.product_cols_pc === 3 ? 3 : 4;
  const topSelling = products.filter(p => p.is_best_selling).slice(0, limit);

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Top Selling Products
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Our customers most cherished organic and daily pantry favorites
        </p>
      </div>

      <div className={`grid ${colsPhone} sm:grid-cols-2 ${colsTab} ${colsPc} gap-3 sm:gap-4`}>
        {topSelling.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onQuickView={onQuickView}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </section>
  );
};
