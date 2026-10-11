import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronUp, MessageCircle, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';

interface FloatingQuickCartProps {
  onOpenCart: () => void;
  onNavigateAdmin?: () => void;
}

export const FloatingQuickCart: React.FC<FloatingQuickCartProps> = ({ onOpenCart, onNavigateAdmin }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => storage.isAdminLoggedIn());

  const syncCart = () => {
    const cart = storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.total_price, 0);
    setCartCount(count);
    setCartTotal(total);
  };

  useEffect(() => {
    syncCart();
    let bumpTimer: ReturnType<typeof setTimeout>;
    const handleBump = () => {
      setCartBump(true);
      clearTimeout(bumpTimer);
      bumpTimer = setTimeout(() => setCartBump(false), 500);
    };

    const handleAuthChange = () => {
      setIsAdminLoggedIn(storage.isAdminLoggedIn());
    };

    window.addEventListener('cart-updated', syncCart);
    window.addEventListener('cart-bump', handleBump);
    window.addEventListener('admin-auth-changed', handleAuthChange);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(bumpTimer);
      window.removeEventListener('cart-updated', syncCart);
      window.removeEventListener('cart-bump', handleBump);
      window.removeEventListener('admin-auth-changed', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 0. Floating Admin Dashboard Button on Right Edge (Only visible when authenticated) */}
      {onNavigateAdmin && isAdminLoggedIn && (
        <button
          onClick={onNavigateAdmin}
          className="fixed right-0 top-[38%] -translate-y-1/2 z-40 bg-slate-900 hover:bg-emerald-900 text-white pl-3 pr-2.5 py-2 rounded-l-xl shadow-2xl flex items-center gap-1.5 transition-all duration-300 hover:-translate-x-1 cursor-pointer border-l-2 border-y-2 border-emerald-500/50 select-none group"
          title="Admin Dashboard (এডমিন ড্যাশবোর্ড)"
          aria-label="Admin Dashboard"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-115 transition-transform" />
          <span className="text-[11px] font-bold text-white tracking-wide">
            Admin
          </span>
        </button>
      )}

      {/* 1. Floating Quick Cart Tab on Right Edge matching screenshot */}
      <button
        id="floating-quick-cart-btn"
        onClick={onOpenCart}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#E25C1D] hover:bg-[#c94f17] text-white p-2.5 rounded-l-xl shadow-2xl flex flex-col items-center gap-1 transition-all duration-300 hover:-translate-x-1 cursor-pointer border-l-2 border-y-2 border-white/20 select-none ${
          cartBump
            ? 'scale-115 -translate-x-1.5 ring-4 ring-amber-300 shadow-[0_0_25px_rgba(226,92,29,0.75)]'
            : ''
        }`}
        aria-label="Quick Cart"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-emerald-950 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {cartCount} {cartCount === 1 ? 'Items' : 'Items'}
          </span>
          <span className="text-xs font-extrabold bg-white text-[#E25C1D] px-1.5 py-0.5 rounded text-[11px] mt-0.5 shadow-xs">
            ৳{cartTotal.toLocaleString()}.00
          </span>
        </div>
      </button>

      {/* 2. Floating Bottom Right Buttons matching screenshot */}
      <div className="fixed right-4 bottom-5 z-40 flex flex-col gap-2.5 items-center">
        {/* Quick Admin Dashboard entry (Only when authenticated) */}
        {onNavigateAdmin && isAdminLoggedIn && (
          <button
            onClick={onNavigateAdmin}
            title="Admin Dashboard (এডমিন প্যানেলে প্রবেশ)"
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 border border-emerald-400/40 cursor-pointer group"
            aria-label="Admin Dashboard"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Scroll To Top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            title="Scroll to Top"
            className="w-10 h-10 rounded-full bg-[#E25C1D] hover:bg-[#c94f17] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        {/* Live Chat / Help Bubble */}
        <a
          href="https://wa.me/8809642922922"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat with Support"
          className="w-11 h-11 rounded-full bg-[#E25C1D] hover:bg-[#c94f17] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6 fill-white/20" />
        </a>
      </div>
    </>
  );
};
