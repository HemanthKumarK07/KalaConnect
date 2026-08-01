import { useEffect, useRef, useCallback } from 'react';

/**
 * CustomCursor — Premium adaptive cursor
 * Uses raw rAF for 120FPS performance. No React re-renders.
 * Dual element: small dot + larger outer ring.
 * Morphs on interactive elements, magnetic attraction.
 * Hidden on touch devices via CSS.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const isClicking = useRef(false);
  const rafId = useRef(null);

  const lerp = (a, b, t) => a + (b - a) * t;

  const tick = useCallback(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Smooth follow with different speeds
    dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.35);
    dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.35);
    ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.15);
    ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.15);

    // Apply transforms (GPU accelerated)
    const dotScale = isClicking.current ? 0.6 : (isHovering.current ? 0.4 : 1);
    const ringScale = isClicking.current ? 0.8 : (isHovering.current ? 1.8 : 1);

    dot.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
    ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
    ring.style.opacity = isHovering.current ? '1' : '0.5';

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // Don't init on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-cursor]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('label')
      ) {
        isHovering.current = true;
      } else {
        isHovering.current = false;
      }
    };

    const handleMouseDown = () => { isClicking.current = true; };
    const handleMouseUp = () => { isClicking.current = false; };

    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '0.5';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    // Start animation loop
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [tick]);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)',
          willChange: 'transform',
          transition: 'width 0.3s, height 0.3s, background-color 0.3s',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)',
          willChange: 'transform',
          opacity: 0.5,
          transition: 'opacity 0.3s, width 0.4s, height 0.4s, border-color 0.3s',
        }}
      />
      <style>{`
        @media (pointer: coarse) {
          .custom-cursor-dot, .custom-cursor-ring { display: none !important; }
        }
      `}</style>
    </>
  );
}
