import React from 'react';
import { Brand } from '../../types/ecommerce';
import { ArrowRight } from 'lucide-react';

interface BrandSliderProps {
  brands: Brand[];
  onSelectBrand: (brandSlug: string) => void;
}

export const BrandSlider: React.FC<BrandSliderProps> = ({ brands, onSelectBrand }) => {
  return (
    <section className="max-w-[1360px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Our Brands</h2>
          <p className="text-xs text-slate-500">Trusted certified partner producers and heritage brands</p>
        </div>
        <button
          onClick={() => onSelectBrand('')}
          className="text-xs font-semibold text-emerald-800 hover:text-[#E25C1D] flex items-center gap-1 transition-colors"
        >
          <span>SEE ALL</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(brand.slug)}
            className="flex items-center justify-center p-4 h-20 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all text-slate-800 hover:text-emerald-800 font-bold text-sm tracking-wide group"
          >
            <span className="group-hover:scale-105 transition-transform duration-200">
              {brand.logo}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
