import React, { useState } from 'react';
import { Product } from '../../types/ecommerce';
import { ShoppingCart, Heart, Check, Eye } from 'lucide-react';
import { storage } from '../../services/storage';
import { triggerFlyToCart } from '../../utils/flyToCart';
import { pixelTracking } from '../../services/pixelTracking';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onProductClick,
}) => {
  const [isInWishlist, setIsInWishlist] = useState(() => storage.isInWishlist(product.id));
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = storage.toggleWishlist(product.id);
    setIsInWishlist(newState);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      // Variation product: Navigate to single product page
      if (onProductClick) {
        onProductClick(product);
      }
    } else {
      // Simple product: Trigger flying product animation to the cart
      const cardEl = (e.currentTarget.closest('.group') as HTMLElement) || (e.currentTarget as HTMLElement);
      const imgEl = cardEl.querySelector('img');
      const startRect = imgEl ? imgEl.getBoundingClientRect() : cardEl.getBoundingClientRect();
      triggerFlyToCart(product.image, startRect);

      storage.addToCart(product, 1);
      pixelTracking.trackAddToCart(product, 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  return (
    <div
      onClick={() => onProductClick?.(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 hover:border-[#E25C1D]/40 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden p-3 h-full justify-between"
    >
      {/* Top Badges (Best Selling or Offered Items) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {product.is_best_selling ? (
          <span className="bg-[#E25C1D] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs">
            Best Selling
          </span>
        ) : product.discount_percent > 0 ? (
          <span className="bg-[#E25C1D] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs">
            Offered Items
          </span>
        ) : null}
      </div>

      {/* Top Right Action Cluster: Wishlist & Quick View */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleWishlistToggle}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
            isInWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/95 text-slate-400 hover:text-rose-600 border border-slate-200 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleQuickViewClick}
          title="Quick View Product"
          aria-label="Quick View"
          className="w-7 h-7 rounded-full bg-white/95 hover:bg-[#E25C1D] text-slate-500 hover:text-white border border-slate-200 flex items-center justify-center transition-colors shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Image Area (Clean - no hover overlay button) */}
      <div className="relative w-full aspect-square bg-[#FAF9F6] rounded-lg overflow-hidden flex items-center justify-center mb-2.5 p-2 border border-slate-100/60">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 line-clamp-2 min-h-[2.3rem] leading-snug group-hover:text-[#E25C1D] transition-colors mb-1">
          {product.name}
        </h3>

        {/* Price in Bold Orange */}
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-sm sm:text-base font-extrabold text-[#E25C1D] tracking-tight">
            ৳{product.sale_price.toLocaleString()}
          </span>
          {product.regular_price > product.sale_price && (
            <span className="text-[11px] text-slate-400 line-through">
              ৳{product.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Full-width Action Button: 'Select' for variation products, 'Add To Cart' for simple products */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleActionClick}
            disabled={product.stock_status === 'out_of_stock'}
            className={`w-full py-2 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              addedAnimation
                ? 'bg-[#E25C1D] text-white border-[#E25C1D]'
                : 'border-[#E25C1D] text-[#E25C1D] hover:bg-[#E25C1D] hover:text-white bg-white shadow-2xs'
            }`}
          >
            {hasVariants ? (
              <span>Select</span>
            ) : addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add To Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
