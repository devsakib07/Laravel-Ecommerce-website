import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

interface WishlistPageProps {
  allProducts: Product[];
  onBackToShop: () => void;
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  allProducts,
  onBackToShop,
  onProductClick,
  onQuickView,
  onBuyNow,
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => storage.getWishlist());

  const sync = () => {
    setWishlistIds(storage.getWishlist());
  };

  useEffect(() => {
    sync();
    window.addEventListener('wishlist-updated', sync);
    return () => window.removeEventListener('wishlist-updated', sync);
  }, []);

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-[1360px] mx-auto px-4 py-8">
      <button
        onClick={onBackToShop}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Saved Wishlist ({wishlistProducts.length})
        </h1>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            ❤️
          </div>
          <h2 className="text-base font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-xs text-slate-500">
            Save items you like to quickly add them to your cart later.
          </p>
          <button
            onClick={onBackToShop}
            className="px-5 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              onQuickView={onQuickView}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
