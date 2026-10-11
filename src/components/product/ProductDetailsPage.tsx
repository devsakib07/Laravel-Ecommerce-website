import React, { useState, useEffect } from 'react';
import { Product, Review } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  ShoppingCart,
  Heart,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowLeft,
  Clock,
  Flame,
  Sparkles,
  MessageCircle,
  Plus,
  Camera,
  Layers,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { triggerFlyToCart } from '../../utils/flyToCart';
import { pixelTracking } from '../../services/pixelTracking';

interface ProductDetailsPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onBuyNow: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  allProducts,
  onBack,
  onBuyNow,
  onSelectProduct,
  onQuickView,
}) => {
  const settings = storage.getSettings();
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(() => storage.isInWishlist(product.id));
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'nutrition' | 'reviews'>('desc');

  // Bundle offer selection
  const complementaryProduct = allProducts.find((p) => p.id !== product.id && p.sale_price > 0) || allProducts[0];
  const [bundleIncludeComplementary, setBundleIncludeComplementary] = useState(true);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Reviews state with photo support
  const [reviews, setReviews] = useState<Review[]>(() => storage.getReviews(product.id));
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Track recently viewed
  useEffect(() => {
    storage.addRecentlyViewed(product.id);
  }, [product.id]);

  // Variant calculations
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : product.sale_price;
  const regularPrice = selectedVariant?.regular_price || product.regular_price;

  // Bundle calculations
  const bundleDiscount = 150;
  const bundleOriginalTotal = currentPrice + (complementaryProduct ? complementaryProduct.sale_price : 0);
  const bundleOfferTotal = Math.max(0, bundleOriginalTotal - bundleDiscount);

  const handleAddToCart = (e?: React.MouseEvent) => {
    const imgEl = document.getElementById('pdp-main-image') || (e?.currentTarget as HTMLElement);
    triggerFlyToCart(product.image, imgEl);

    storage.addToCart(
      product,
      quantity,
      selectedVariant?.id,
      selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined
    );
    pixelTracking.trackAddToCart(product, quantity, selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleAddBundleToCart = () => {
    storage.addToCart(product, 1, selectedVariant?.id);
    if (complementaryProduct && bundleIncludeComplementary) {
      storage.addToCart(complementaryProduct, 1);
    }
    pixelTracking.trackAddToCart(product, 2);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  const handleBuyNowClick = () => {
    storage.addToCart(
      product,
      quantity,
      selectedVariant?.id,
      selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined
    );
    pixelTracking.trackAddToCart(product, quantity, selectedVariant ? `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}` : undefined);
    onBuyNow(product);
  };

  const handleWhatsAppOrder = () => {
    const phone = settings.whatsapp_number || settings.phone || '01712345678';
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '880');
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি আপনার ওয়েবসাইট থেকে এই পণ্যটি অর্ডার করতে চাই:\n\n` +
      `📦 পণ্য: ${product.name}\n` +
      `🔢 পরিমাণ: ${quantity} টি\n` +
      `💰 মোট মূল্য: ৳${(currentPrice * quantity).toLocaleString()}\n\n` +
      `দয়া করে আমার অর্ডারটি কনফার্ম করুন।`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleWishlistToggle = () => {
    const newState = storage.toggleWishlist(product.id);
    setIsInWishlist(newState);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const created = storage.addReview({
      product_id: product.id,
      customer_name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewText.trim(),
      photos: newReviewPhoto.trim() ? [newReviewPhoto.trim()] : undefined,
      is_verified: true,
    });

    setReviews([created, ...reviews]);
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewPhoto('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  // Related products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.is_best_selling))
    .slice(0, 5);

  // Recently viewed products
  const recentlyViewedIds = storage.getRecentlyViewed();
  const recentlyViewedProducts = allProducts
    .filter((p) => p.id !== product.id && recentlyViewedIds.includes(p.id))
    .slice(0, 5);

  return (
    <div className="max-w-[1360px] mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-200">
        {/* Left: Images (5 columns on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl bg-[#FAF9F6] border border-slate-200/80 p-8 flex items-center justify-center overflow-hidden">
            <img
              id="pdp-main-image"
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-[#E25C1D] text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                {product.discount_percent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right: Purchase Module & Info (7 columns on lg) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-emerald-800">{product.category_name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {product.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600">{product.name_bn}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-800 text-sm">{product.rating.toFixed(1)}</span>
              <span className="text-slate-500">({reviews.length} Verified Customer Reviews)</span>
            </div>
          </div>

          {/* Flash Sale Urgency & Stock Countdown */}
          {settings.flash_sale_enabled !== false && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#E25C1D] text-white">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                  </span>
                  <span className="font-bold text-slate-900">
                    {settings.flash_sale_title || 'স্পেশাল উইকেন্ড মেগা ফ্ল্যাশ সেল (সীমিত সময়)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#E25C1D]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>অফার শেষ: 02h 45m 18s</span>
                </div>
              </div>

              {/* Stock Meter */}
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600 animate-bounce" />
                    মাত্র ৪টি স্টকে অবশিষ্ট আছে!
                  </span>
                  <span className="text-slate-500 font-medium">ইতিমধ্যে ৯২% বিক্রি হয়েছে</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/70">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              ৳{currentPrice.toLocaleString()}
            </span>
            {regularPrice > currentPrice && (
              <span className="text-base text-slate-400 line-through">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-slate-500 ml-auto">
              Net Weight: <strong className="text-slate-800">{product.weight}</strong>
            </span>
          </div>

          {/* Volume Tiered Discount: Buy More, Save More */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              বেশি কিনলে বিশেষ ছাড় (Buy More, Save More):
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setQuantity(1)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  quantity === 1
                    ? 'border-[#E25C1D] bg-orange-50/70 ring-2 ring-orange-200 text-slate-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500">১ পিস</div>
                <div className="font-extrabold text-xs">৳{currentPrice.toLocaleString()}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">রেগুলার মূল্য</div>
              </button>

              <button
                type="button"
                onClick={() => setQuantity(2)}
                className={`p-2.5 rounded-xl border text-center relative transition-all cursor-pointer ${
                  quantity === 2
                    ? 'border-[#E25C1D] bg-orange-50/70 ring-2 ring-orange-200 text-slate-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#E25C1D] text-white text-[8px] font-black rounded-full uppercase">
                  জনপ্রিয়
                </span>
                <div className="text-[11px] font-semibold text-slate-500">২ পিস</div>
                <div className="font-extrabold text-xs">৳{(currentPrice * 2 - 100).toLocaleString()}</div>
                <div className="text-[9px] text-emerald-600 font-bold mt-0.5">Save ৳১০০</div>
              </button>

              <button
                type="button"
                onClick={() => setQuantity(3)}
                className={`p-2.5 rounded-xl border text-center relative transition-all cursor-pointer ${
                  quantity === 3
                    ? 'border-[#E25C1D] bg-orange-50/70 ring-2 ring-orange-200 text-slate-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-black rounded-full uppercase">
                  সেরা অফার
                </span>
                <div className="text-[11px] font-semibold text-slate-500">৩ পিস</div>
                <div className="font-extrabold text-xs">৳{(currentPrice * 3 - 250).toLocaleString()}</div>
                <div className="text-[9px] text-emerald-600 font-bold mt-0.5">Save ৳২৫০</div>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-800 block">
                Select Pack / Weight:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariantId === v.id
                        ? 'border-[#E25C1D] bg-orange-50 text-[#E25C1D] ring-2 ring-orange-200'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span>{v.attribute_value}</span>
                    <span className="ml-1.5 opacity-80">(৳{v.price.toLocaleString()})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleWishlistToggle}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isInWishlist
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-300 text-slate-600 hover:text-rose-600 bg-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  added
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-emerald-800 text-emerald-800 hover:bg-emerald-50 bg-white'
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
                    <span>Add to Cart (৳{(currentPrice * quantity).toLocaleString()})</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="py-3.5 px-4 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-lg hover:shadow-orange-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buy Now Directly</span>
              </button>

              {/* Direct Order Via WhatsApp Button */}
              {settings.whatsapp_order_enabled !== false && (
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="col-span-1 sm:col-span-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>📱 হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন (Order via WhatsApp)</span>
                </button>
              )}
            </div>

            {/* Frequently Bought Together Bundle Box */}
            {complementaryProduct && settings.bundle_offers_enabled !== false && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/60 border border-emerald-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Frequently Bought Together (একসাথে কিনুন ও বিশেষ ছাড় পান)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                    Save ৳{bundleDiscount}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  {/* Pair previews */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                      <div className="text-[11px] font-bold text-slate-800 max-w-[100px] truncate">
                        {product.name}
                      </div>
                    </div>

                    <span className="text-sm font-bold text-slate-400">+</span>

                    <label className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bundleIncludeComplementary}
                        onChange={(e) => setBundleIncludeComplementary(e.target.checked)}
                        className="accent-emerald-700 w-3.5 h-3.5"
                      />
                      <img
                        src={complementaryProduct.image}
                        alt={complementaryProduct.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                      <div className="text-[11px] font-bold text-slate-800 max-w-[100px] truncate">
                        {complementaryProduct.name}
                      </div>
                    </label>
                  </div>

                  {/* Bundle Price & Add CTA */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        ৳{bundleIncludeComplementary ? bundleOfferTotal.toLocaleString() : currentPrice.toLocaleString()}
                      </div>
                      {bundleIncludeComplementary && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ৳{bundleOriginalTotal.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleAddBundleToCart}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      {bundleAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>বান্ডেল যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>বান্ডেল কার্টে নিন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Pure & Lab Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Free Delivery Above ৳2500</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Easy 7 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Nutrition, Verified Reviews */}
      <div className="py-12">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'desc'
                ? 'border-[#E25C1D] text-[#E25C1D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-[#E25C1D] text-[#E25C1D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'nutrition'
                ? 'border-[#E25C1D] text-[#E25C1D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nutrition & Ingredients
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-[#E25C1D] text-[#E25C1D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
              <p>{product.full_description}</p>
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 mt-4">
                <h4 className="font-bold text-emerald-950 mb-1">Our Purity Commitment</h4>
                <p className="text-xs text-emerald-900">
                  We guarantee 100% authenticity for this product. Sourced directly from verified native farmers and licensed beekeepers/artisans without chemical refining, bleach, artificial flavors or heat treatment.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-white rounded-lg border border-slate-200/80 flex justify-between">
                  <span className="font-semibold text-slate-500">{key}:</span>
                  <span className="font-bold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4 max-w-2xl text-xs">
              {product.ingredients && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">Ingredients:</h4>
                  <p className="text-slate-600">{product.ingredients}</p>
                </div>
              )}
              {product.nutrition && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 mb-2">Nutritional Values (Approx):</h4>
                  {Object.entries(product.nutrition).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-100 last:border-b-0">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-bold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4 max-w-3xl">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{rev.customer_name}</span>
                        {rev.is_verified && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.created_at}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                    {/* Customer Photo Attachment */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {rev.photos.map((p, pIdx) => (
                          <img
                            key={pIdx}
                            src={p}
                            alt="Customer upload"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Review Form */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 max-w-xl space-y-4 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm">Write a Verified Review (ছবি সহ রিভিউ দিন)</h3>
                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                    Thank you! Your review has been added and published.
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asif Mahmud"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience regarding purity, taste, and packaging..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  {/* Customer Photo URL */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Product Photo URL (ঐচ্ছিক - পণ্যের ছবি)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newReviewPhoto}
                      onChange={(e) => setNewReviewPhoto(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Shelf */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
            Related Products You May Love
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onProductClick={onSelectProduct}
                onQuickView={onQuickView}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products Shelf */}
      {recentlyViewedProducts.length > 0 && (
        <div className="pt-10 mt-10 border-t border-slate-200 pb-16 md:pb-0">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recently Viewed Products (আপনি সম্প্রতি এগুলো দেখেছেন)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {recentlyViewedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onProductClick={onSelectProduct}
                onQuickView={onQuickView}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for Mobile Screen (Fast Order & WhatsApp) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-slate-50 shrink-0 p-0.5"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
            <p className="text-xs font-black text-[#E25C1D]">৳{currentPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleWhatsAppOrder}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
            title="WhatsApp এ অর্ডার করুন"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
          </button>

          <button
            onClick={handleAddToCart}
            className="px-3 py-2 rounded-xl border border-emerald-800 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors"
          >
            {added ? 'যোগ হয়েছে!' : 'কার্ট'}
          </button>

          <button
            onClick={handleBuyNowClick}
            className="px-3.5 py-2 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs shadow-md transition-colors"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
};
