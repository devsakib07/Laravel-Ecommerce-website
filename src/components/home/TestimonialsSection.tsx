import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../../types/ecommerce';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2, MessageSquarePlus } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  // Only display active testimonials
  const activeTestimonials = testimonials.filter(t => t.status !== 'inactive');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive itemsPerView calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = activeTestimonials.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Reset or adjust currentIndex if maxIndex shrinks
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  // Autoplay functionality with smooth interval
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (activeTestimonials.length === 0) {
    return null;
  }

  // Calculate slide percentage width based on visible items
  const itemWidthPercent = 100 / itemsPerView;

  return (
    <section className="max-w-[1360px] mx-auto px-4 py-12 md:py-16">
      {/* Header with Title and Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>১০০% খাঁটি ও সন্তুষ্ট গ্রাহক প্রতিক্রিয়া</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Our Valued Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real feedback from health-conscious families across Bangladesh
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        {maxIndex > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              aria-label="Previous reviews"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 flex items-center justify-center shadow-xs transition-all hover:border-[#E25C1D] hover:text-[#E25C1D]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next reviews"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 flex items-center justify-center shadow-xs transition-all hover:border-[#E25C1D] hover:text-[#E25C1D]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Track Container */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * itemWidthPercent}%)`,
          }}
        >
          {activeTestimonials.map((item) => (
            <div
              key={item.id}
              className="px-2.5 shrink-0"
              style={{ width: `${itemWidthPercent}%` }}
            >
              <div className="h-full p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group hover:border-emerald-300">
                {/* Decorative Quote Icon Background */}
                <div className="absolute top-4 right-4 text-slate-100 group-hover:text-emerald-50 transition-colors pointer-events-none">
                  <Quote className="w-10 h-10 rotate-180" />
                </div>

                <div className="relative z-10">
                  {/* Star Rating & Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6 line-clamp-4">
                    "{item.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 relative z-10">
                  {item.customer_photo ? (
                    <img
                      src={item.customer_photo}
                      alt={item.customer_name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-200 shrink-0 shadow-xs"
                      onError={(e) => {
                        // Fallback to avatar if image fails to load
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Fallback avatar if no photo */}
                  {!item.customer_photo && (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold text-sm shrink-0 shadow-xs">
                      {item.customer_name.trim().slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.customer_name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {item.customer_role || 'Verified Customer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {[...Array(maxIndex + 1)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to review slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                currentIndex === idx
                  ? 'w-7 h-2.5 bg-[#E25C1D]'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
