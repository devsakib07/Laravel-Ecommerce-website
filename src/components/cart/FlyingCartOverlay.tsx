import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  controlX: number;
  controlY: number;
  startTime: number;
  duration: number;
}

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

export const FlyingCartOverlay: React.FC = () => {
  const [displayItems, setDisplayItems] = useState<FlyingItem[]>([]);
  const [displaySparkles, setDisplaySparkles] = useState<SparkleParticle[]>([]);
  const [, setTick] = useState(0);

  const itemsRef = useRef<FlyingItem[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef(false);

  // Target the floating quick cart on the right side
  const getCartTargetCoordinates = (): { x: number; y: number } => {
    // 1. Primary target: Floating Quick Cart Tab on the right side
    const floatingCart = document.getElementById('floating-quick-cart-btn');
    if (floatingCart) {
      const r = floatingCart.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        // Land directly inside the floating cart button on the right edge
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };
      }
    }

    // 2. Fallback: Right edge centered vertically where the floating cart sits
    return {
      x: window.innerWidth - 30,
      y: window.innerHeight / 2,
    };
  };

  const startLoopIfNeeded = () => {
    if (isLoopRunningRef.current) return;
    isLoopRunningRef.current = true;

    const loop = (now: number) => {
      const currentItems = itemsRef.current;
      const remainingItems: FlyingItem[] = [];
      const finishedItems: FlyingItem[] = [];

      for (const item of currentItems) {
        const elapsed = now - item.startTime;
        if (elapsed < item.duration) {
          remainingItems.push(item);
        } else {
          finishedItems.push(item);
        }
      }

      let sparklesChanged = false;

      // Handle items that finished their flight
      if (finishedItems.length > 0) {
        itemsRef.current = remainingItems;
        setDisplayItems([...remainingItems]);

        // Add arrival sparkles
        for (const f of finishedItems) {
          sparklesRef.current.push({
            id: Math.random().toString(36).substring(2, 9),
            x: f.targetX,
            y: f.targetY,
            createdAt: now,
          });
        }
        sparklesChanged = true;

        // Dispatch cart-bump safely in the next macrotask turn
        // to avoid updating Header or other components during React rendering
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cart-bump'));
        }, 0);
      }

      // Expire old sparkles (> 600ms)
      const prevSparkleCount = sparklesRef.current.length;
      sparklesRef.current = sparklesRef.current.filter((s) => now - s.createdAt < 600);
      if (sparklesChanged || sparklesRef.current.length !== prevSparkleCount) {
        setDisplaySparkles([...sparklesRef.current]);
      }

      // Keep animation running if there are active flying items or sparkles
      if (itemsRef.current.length > 0 || sparklesRef.current.length > 0) {
        setTick(now);
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        isLoopRunningRef.current = false;
        animFrameRef.current = null;
        setDisplayItems([]);
        setDisplaySparkles([]);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleFlyToCart = (e: Event) => {
      const customEvent = e as CustomEvent<{
        imageUrl: string;
        rect: { x: number; y: number; width: number; height: number };
        id: string;
      }>;
      const { imageUrl, rect, id } = customEvent.detail;

      // Start position (center of the product item/image)
      const startX = rect.x + rect.width / 2;
      const startY = rect.y + rect.height / 2;

      // Target cart location (floating right quick-cart button)
      const { x: targetX, y: targetY } = getCartTargetCoordinates();

      // Quadratic bezier control point for natural upward arc
      const deltaX = targetX - startX;
      const controlX = startX + deltaX * 0.45;
      // Arc upward before descending to the cart
      const controlY = Math.min(startY, targetY) - Math.max(120, Math.abs(deltaX) * 0.22);

      const newItem: FlyingItem = {
        id,
        imageUrl,
        startX,
        startY,
        targetX,
        targetY,
        controlX,
        controlY,
        startTime: performance.now(),
        duration: 750, // 750ms flight
      };

      itemsRef.current.push(newItem);
      setDisplayItems([...itemsRef.current]);
      startLoopIfNeeded();
    };

    window.addEventListener('fly-to-cart', handleFlyToCart);
    return () => {
      window.removeEventListener('fly-to-cart', handleFlyToCart);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      isLoopRunningRef.current = false;
    };
  }, []);

  if (displayItems.length === 0 && displaySparkles.length === 0) {
    return null;
  }

  const now = performance.now();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Flying Product Items */}
      {displayItems.map((item) => {
        const elapsed = Math.max(0, now - item.startTime);
        const t = Math.min(1, elapsed / item.duration);

        // Quad bezier position: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
        const oneMinusT = 1 - t;
        const currentX =
          oneMinusT * oneMinusT * item.startX +
          2 * oneMinusT * t * item.controlX +
          t * t * item.targetX;
        const currentY =
          oneMinusT * oneMinusT * item.startY +
          2 * oneMinusT * t * item.controlY +
          t * t * item.targetY;

        // Scale: Starts at 1.0, pops up to 1.15 in first 20%, then shrinks into the cart (0.2)
        const scale =
          t < 0.2
            ? 1 + (t / 0.2) * 0.15
            : Math.max(0.18, 1.15 - ((t - 0.2) / 0.8) * 0.97);

        // Rotation: Spins gently along the path
        const rotation = t * 360 * (item.targetX > item.startX ? 1 : -1);

        // Opacity: Remains solid, then quickly fades right as it drops into the cart
        const opacity = t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;

        return (
          <div
            key={item.id}
            style={{
              transform: `translate3d(${currentX - 32}px, ${currentY - 32}px, 0) scale(${scale}) rotate(${rotation}deg)`,
              opacity,
              willChange: 'transform, opacity',
            }}
            className="absolute top-0 left-0 w-16 h-16 rounded-2xl bg-white border-2 border-[#E25C1D] shadow-[0_8px_25px_rgba(226,92,29,0.45)] p-1.5 flex items-center justify-center transition-none"
          >
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
            {/* Pulsing glow ring */}
            <div className="absolute -inset-1 rounded-2xl bg-[#E25C1D]/25 blur-xs -z-10 animate-pulse" />
          </div>
        );
      })}

      {/* 2. Sparkle Burst upon arrival at Cart */}
      {displaySparkles.map((s) => {
        const age = now - s.createdAt;
        const progress = Math.min(1, age / 600);
        const scale = 1 + progress * 0.8;
        const opacity = 1 - progress;

        return (
          <div
            key={s.id}
            style={{
              left: `${s.x - 20}px`,
              top: `${s.y - 20}px`,
              transform: `scale(${scale})`,
              opacity,
            }}
            className="absolute pointer-events-none flex items-center justify-center"
          >
            <div className="relative">
              <Sparkles className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div className="absolute inset-0 rounded-full bg-orange-400/40 blur-md animate-ping" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
