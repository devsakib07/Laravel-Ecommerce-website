import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { CartItem } from '../../types/ecommerce';
import { Trash2, ArrowRight, ArrowLeft, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CartPageProps {
  onBackToShop: () => void;
  onProceedToCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onBackToShop,
  onProceedToCheckout,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => storage.getCart());
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const settings = storage.getSettings();

  const sync = () => {
    setCart(storage.getCart());
  };

  useEffect(() => {
    sync();
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);

  const handleUpdateQty = (itemId: string, delta: number) => {
    storage.updateCartQuantity(itemId, delta);
  };

  const handleRemove = (itemId: string) => {
    storage.removeFromCart(itemId);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const freeThreshold = settings.free_delivery_threshold;
  const isFreeDelivery = subtotal >= freeThreshold;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = storage.validateCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedCoupon(couponCode.toUpperCase().trim());
      setCouponDiscount(res.discount);
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const estimatedTotal = Math.max(0, subtotal - couponDiscount);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your cart is currently empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Before checkout, explore our natural honey, organic cold-pressed oils, and dates.
        </p>
        <button
          onClick={onBackToShop}
          className="px-6 py-2.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <button
        onClick={onBackToShop}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
        Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list (8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 grid grid-cols-12">
            <span className="col-span-6">Product</span>
            <span className="col-span-2 text-center">Price</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-slate-100 p-4">
            {cart.map((item) => (
              <div key={item.id} className="py-4 grid grid-cols-12 items-center gap-3">
                <div className="col-span-6 flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain rounded bg-slate-50 border border-slate-100 p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h3>
                    {item.variant_label && (
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        {item.variant_label}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-center text-xs font-medium text-slate-700">
                  ৳{item.unit_price.toLocaleString()}
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center border border-slate-300 rounded bg-slate-50">
                    <button
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-right text-xs font-bold text-slate-900">
                  ৳{item.total_price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Coupon (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Cart Summary
            </h2>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Apply Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. NATURAL10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono uppercase outline-none focus:border-[#E25C1D]"
                />
                <button
                  type="submit"
                  className="px-3.5 h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </p>
              )}
            </form>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- ৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-700">
                  {isFreeDelivery ? 'FREE' : '৳70 / ৳130 (At Checkout)'}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-lg text-[#E25C1D]">৳{estimatedTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
