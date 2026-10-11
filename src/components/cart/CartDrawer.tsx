import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { storage } from '../../services/storage';
import { CartItem } from '../../types/ecommerce';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onViewCartPage: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onCheckout,
  onViewCartPage,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const settings = storage.getSettings();

  const syncCart = () => {
    setCart(storage.getCart());
  };

  useEffect(() => {
    syncCart();
    window.addEventListener('cart-updated', syncCart);
    return () => window.removeEventListener('cart-updated', syncCart);
  }, []);

  const handleUpdateQty = (itemId: string, delta: number) => {
    storage.updateCartQuantity(itemId, delta);
  };

  const handleRemove = (itemId: string) => {
    storage.removeFromCart(itemId);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const freeThreshold = settings.free_delivery_threshold;
  const remainingForFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

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

  const grandTotal = Math.max(0, subtotal - couponDiscount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#0D3823] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-wide">
              Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-xs">
          {remainingForFreeDelivery > 0 ? (
            <p className="text-emerald-900 font-medium">
              Add <span className="font-bold text-[#E25C1D]">৳{remainingForFreeDelivery.toLocaleString()}</span> more for <span className="font-bold text-emerald-800">FREE DELIVERY</span> in Bangladesh!
            </p>
          ) : (
            <p className="text-emerald-800 font-bold flex items-center gap-1">
              <span>🎉 Congratulations! You unlocked FREE Delivery!</span>
            </p>
          )}
          <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                🛒
              </div>
              <p className="font-semibold text-slate-700 text-base">Your cart is empty</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our hand-harvested honey, mustard oils, organic ghee and fresh dates to begin.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-contain rounded-md bg-[#FAF9F6] border border-slate-100 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                  {item.variant_label && (
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      {item.variant_label}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-slate-900 mt-1">
                    ৳{item.unit_price.toLocaleString()}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-slate-200 rounded bg-slate-50">
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
                    <span className="text-xs font-bold text-slate-800 ml-auto">
                      ৳{item.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-[#FAF9F6] space-y-3">
            {/* Coupon Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. NATURAL10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full h-8 pl-7 pr-2 text-xs border border-slate-300 rounded uppercase font-mono outline-none focus:border-[#E25C1D]"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
              <button
                type="submit"
                className="px-3 h-8 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
              >
                Apply
              </button>
            </form>

            {couponMsg && (
              <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                {couponMsg.text}
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- ৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Delivery Charge</span>
                <span>Calculated at checkout (৳70/৳130)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-base text-[#E25C1D]">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onViewCartPage();
                }}
                className="w-full py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold text-center transition-colors bg-white"
              >
                View Cart Page
              </button>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-2.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
