import React, { useState } from 'react';
import { Product } from '../../types/ecommerce';
import { X, ShoppingCart, Check, Star, ShieldCheck, Heart } from 'lucide-react';
import { storage } from '../../services/storage';
import { triggerFlyToCart } from '../../utils/flyToCart';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
  onNavigateToProduct: (slug: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onBuyNow,
  onNavigateToProduct,
}) => {
  if (!product) return null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(() => storage.isInWishlist(product.id));

  // Determine current price based on selected variant
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : product.sale_price;
  const regularPrice = selectedVariant?.regular_price || product.regular_price;

  const handleAddToCart = (e?: React.MouseEvent) => {
    const imgEl = document.getElementById('quickview-modal-image') || (e?.currentTarget as HTMLElement);
    triggerFlyToCart(product.image, imgEl);

    storage.addToCart(
      product,
      quantity,
      selectedVariant?.id,
      selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNowClick = () => {
    storage.addToCart(
      product,
      quantity,
      selectedVariant?.id,
      selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined
    );
    onClose();
    onBuyNow(product);
  };

  const handleWishlistToggle = () => {
    const newState = storage.toggleWishlist(product.id);
    setIsInWishlist(newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Left */}
        <div className="md:w-1/2 bg-[#FAF9F6] p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
          <img
            id="quickview-modal-image"
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-64 md:h-72 object-contain"
          />
          {product.discount_percent > 0 && (
            <span className="absolute top-4 left-4 bg-[#E25C1D] text-white text-xs font-bold px-2 py-0.5 rounded shadow">
              {product.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Product Details Right */}
        <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-emerald-800 font-semibold">{product.category_name}</span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
            <p className="text-xs text-slate-500">{product.name_bn}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-slate-700">{product.rating}</span>
              <span className="text-slate-400">({product.reviews_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 py-1">
              <span className="text-2xl font-black text-slate-900">
                ৳{currentPrice.toLocaleString()}
              </span>
              {regularPrice > currentPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ৳{regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              {product.short_description}
            </p>

            {/* Variants if any */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Choose Variant / Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedVariantId === v.id
                          ? 'border-[#E25C1D] bg-orange-50 text-[#E25C1D]'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.attribute_value} - ৳{v.price.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-lg border transition-colors ${
                  isInWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:text-rose-600'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  added
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-emerald-700 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="w-full py-2.5 px-3 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center"
              >
                <span>Buy Now</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateToProduct(product.slug);
              }}
              className="text-xs text-center text-slate-500 hover:text-emerald-800 underline mt-1"
            >
              View Full Product Details & Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
