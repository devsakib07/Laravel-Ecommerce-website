import React from 'react';
import middleCookingBannerImg from '../../assets/images/middle_cooking_banner_1790515572020.jpg';
import { ArrowRight, Sparkles } from 'lucide-react';
import { storage } from '../../services/storage';

interface MiddlePromoBannerProps {
  onNavigate: (route: string, param?: string) => void;
}

export const MiddlePromoBanner: React.FC<MiddlePromoBannerProps> = ({ onNavigate }) => {
  const settings = storage.getSettings();
  const resp = settings.responsive_design;

  const showPhone = resp?.show_promo_banner_phone ?? true;
  const showTab = resp?.show_promo_banner_tab ?? true;
  const showPc = resp?.show_promo_banner_pc ?? true;

  const visibilityClass = [
    showPhone ? 'block' : 'hidden',
    showTab ? 'md:block' : 'md:hidden',
    showPc ? 'lg:block' : 'lg:hidden',
  ].join(' ');

  const heightPhone = resp?.promo_banner_height_phone || 160;
  const heightTab = resp?.promo_banner_height_tab || 220;
  const heightPc = resp?.promo_banner_height_pc || 280;

  return (
    <section className={`${visibilityClass} max-w-[1360px] mx-auto px-4 py-6`}>
      <style>{`
        .site-middle-promo {
          min-height: ${heightPhone}px !important;
        }
        @media (min-width: 768px) {
          .site-middle-promo { min-height: ${heightTab}px !important; }
        }
        @media (min-width: 1024px) {
          .site-middle-promo { min-height: ${heightPc}px !important; }
        }
      `}</style>
      <div
        onClick={() => onNavigate('shop', 'category=oil-and-ghee')}
        className="site-middle-promo relative rounded-2xl overflow-hidden shadow-sm bg-amber-950 flex items-center group cursor-pointer"
      >
        <img
          src={middleCookingBannerImg}
          alt="খাবারে স্বাদ এবং প্রশান্তি"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 p-5 sm:p-10 md:p-12 max-w-xl text-white space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded bg-amber-500/80 text-amber-950 text-[11px] sm:text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্বস্তি ও বিশুদ্ধতা</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            খাবারে স্বাদ এবং প্রশান্তি
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-md">
            প্রাকৃতিক উপায়ে প্রস্তুত গাওয়া ঘি, দেশি কাঠের ঘানির সরিষার তেল ও বাছাইকৃত পাহাড়ি মশলা আপনার রান্নায় এনে দেবে আসল স্বাদ।
          </p>

          <div className="pt-1 sm:pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('shop', 'category=oil-and-ghee');
              }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Cooking Essentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
