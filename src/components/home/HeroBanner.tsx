import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner } from '../../types/ecommerce';
import { storage } from '../../services/storage';

interface HeroBannerProps {
  banners: Banner[];
  onNavigate: (route: string, param?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onNavigate }) => {
  const mainBanners = banners.filter(b => b.position === 'hero_main' || b.position === 'middle_promo');
  const sideBanner = banners.find(b => b.position === 'hero_side') || banners[0];
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = storage.getSettings();
  const resp = settings.responsive_design;

  const heroHeightPhone = resp?.hero_height_phone || 220;
  const heroHeightTab = resp?.hero_height_tab || 340;
  const heroHeightPc = resp?.hero_height_pc || 440;

  const heroTitleSizePhone = resp?.hero_title_size_phone || 20;
  const heroTitleSizeTab = resp?.hero_title_size_tab || 26;
  const heroTitleSizePc = resp?.hero_title_size_pc || 34;

  const showSideBannerPhone = resp?.show_side_banner_phone ?? false;
  const showSideBannerTab = resp?.show_side_banner_tab ?? true;
  const showSideBannerPc = resp?.show_side_banner_pc ?? true;

  const sideBannerVisibilityClass = [
    showSideBannerPhone ? 'block' : 'hidden',
    showSideBannerTab ? 'md:block' : 'md:hidden',
    showSideBannerPc ? 'lg:block' : 'lg:hidden',
  ].join(' ');

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? mainBanners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === mainBanners.length - 1 ? 0 : prev + 1));
  };

  const activeBanner = mainBanners[currentSlide] || mainBanners[0];

  return (
    <section className="max-w-[1360px] mx-auto px-4 pt-4 pb-6">
      <style>{`
        .site-hero-slider {
          min-height: ${heroHeightPhone}px !important;
        }
        .site-hero-title {
          font-size: ${heroTitleSizePhone}px !important;
        }
        @media (min-width: 768px) {
          .site-hero-slider { min-height: ${heroHeightTab}px !important; }
          .site-hero-title { font-size: ${heroTitleSizeTab}px !important; }
        }
        @media (min-width: 1024px) {
          .site-hero-slider { min-height: ${heroHeightPc}px !important; }
          .site-hero-title { font-size: ${heroTitleSizePc}px !important; }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Large Banner (8 columns if side banner visible on PC, else full 12 columns) */}
        <div className={`${showSideBannerPc ? 'lg:col-span-8' : 'lg:col-span-12'} relative rounded-xl overflow-hidden bg-slate-900 site-hero-slider shadow-sm flex items-center group`}>
          <picture className="absolute inset-0 w-full h-full">
            {activeBanner.image_mobile && (
              <source media="(max-width: 767px)" srcSet={activeBanner.image_mobile} />
            )}
            <img
              src={activeBanner.image_desktop}
              alt={activeBanner.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
            />
          </picture>
          {/* Subtle gradient overlay to keep text crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

          {/* Text Content */}
          <div className="relative z-10 p-5 sm:p-8 md:p-10 max-w-xl text-white space-y-2 sm:space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded bg-emerald-800/80 text-emerald-200 text-[10px] sm:text-xs font-semibold backdrop-blur-xs tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              100% Pure Organic & Safe
            </span>

            <h1 className="site-hero-title font-extrabold text-white leading-tight tracking-tight text-balance">
              {activeBanner.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
              {activeBanner.subtitle}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white font-semibold text-xs sm:text-sm shadow-lg hover:shadow-orange-900/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{activeBanner.button_text || 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Arrow Controls */}
          {mainBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow cursor-pointer"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow cursor-pointer"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {mainBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx ? 'w-6 bg-[#E25C1D]' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side Promo Banner (Responsive visibility and column width) */}
        {sideBanner && (
          <div
            className={`${sideBannerVisibilityClass} lg:col-span-4 relative rounded-xl overflow-hidden bg-amber-950 min-h-[200px] sm:min-h-[260px] lg:min-h-full shadow-sm flex items-end group cursor-pointer`}
            onClick={() => onNavigate('shop', 'category=honey')}
          >
            <img
              src={sideBanner.image_desktop}
              alt={sideBanner.title}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            <div className="relative z-10 p-5 sm:p-6 text-white space-y-1.5 sm:space-y-2 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Special Collection
              </span>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold leading-snug">
                {sideBanner.title}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-2">
                {sideBanner.subtitle}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                <span>Order Pure Honey</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
