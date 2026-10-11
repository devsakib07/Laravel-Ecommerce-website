/**
 * Helper to trigger the flying product animation to the cart
 */
export function triggerFlyToCart(
  imageUrl: string,
  startElementOrRect?: HTMLElement | DOMRect | null
) {
  if (typeof window === 'undefined') return;

  let rect: { x: number; y: number; width: number; height: number };

  if (startElementOrRect instanceof HTMLElement) {
    const r = startElementOrRect.getBoundingClientRect();
    rect = { x: r.left, y: r.top, width: r.width, height: r.height };
  } else if (startElementOrRect && 'left' in startElementOrRect) {
    rect = {
      x: startElementOrRect.left,
      y: startElementOrRect.top,
      width: startElementOrRect.width,
      height: startElementOrRect.height,
    };
  } else {
    // Default fallback position
    rect = {
      x: window.innerWidth / 2 - 35,
      y: window.innerHeight / 2 - 35,
      width: 70,
      height: 70,
    };
  }

  window.dispatchEvent(
    new CustomEvent('fly-to-cart', {
      detail: {
        imageUrl,
        rect,
        id: Math.random().toString(36).substring(2, 9),
      },
    })
  );
}
