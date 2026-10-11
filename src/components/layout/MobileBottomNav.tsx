import React, { useState, useEffect } from 'react';
import { Home, Grid, Heart, ShoppingBag, Truck } from 'lucide-react';
import { storage } from '../../services/storage';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string, param?: string) => void;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenCart,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartBump, setCartBump] = useState(false);

  const updateCounts = () => {
    const cart = storage.getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQty);

    const wishlist = storage.getWishlist();
    setWishlistCount(wishlist.length);
  };

  useEffect(() => {
    updateCounts();
    let bumpTimer: ReturnType<typeof setTimeout>;
    const handleBump = () => {
      setCartBump(true);
      clearTimeout(bumpTimer);
      bumpTimer = setTimeout(() => setCartBump(false), 500);
    };

    window.addEventListener('cart-updated', updateCounts);
    window.addEventListener('wishlist-updated', updateCounts);
    window.addEventListener('cart-bump', handleBump);
    return () => {
      clearTimeout(bumpTimer);
      window.removeEventListener('cart-updated', updateCounts);
      window.removeEventListener('wishlist-updated', updateCounts);
      window.removeEventListener('cart-bump', handleBump);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden py-1.5 px-3 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      {/* 1. Home */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          currentRoute === 'home' ? 'text-[#E25C1D]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold leading-none">Home</span>
      </button>

      {/* 2. Shop / Catalog */}
      <button
        onClick={() => onNavigate('shop')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          currentRoute === 'shop' ? 'text-[#E25C1D]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-semibold leading-none">Shop</span>
      </button>

      {/* 3. Wishlist */}
      <button
        onClick={() => onNavigate('wishlist')}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          currentRoute === 'wishlist' ? 'text-[#E25C1D]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#E25C1D] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-xs">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold leading-none">Wishlist</span>
      </button>

      {/* 4. Cart (opens drawer or cart page) */}
      <button
        id="mobile-bottom-cart-btn"
        onClick={onOpenCart}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-2 transition-all duration-300 ${
          cartBump ? 'scale-125 text-[#E25C1D]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${cartBump ? 'scale-115 text-[#E25C1D]' : ''}`} />
          {cartCount > 0 && (
            <span className={`absolute -top-1.5 -right-2 bg-[#E25C1D] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-xs transition-transform duration-300 ${
              cartBump ? 'scale-125 ring-2 ring-orange-300' : ''
            }`}>
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold leading-none">Cart</span>
      </button>

      {/* 5. Track Order */}
      <button
        onClick={() => onNavigate('track-order')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
          currentRoute === 'track-order' ? 'text-[#E25C1D]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Truck className="w-5 h-5" />
        <span className="text-[10px] font-semibold leading-none">Track</span>
      </button>
    </nav>
  );
};
