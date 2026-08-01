import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

/**
 * WovenSilkTransition — KalaConnect Signature Handcrafted Page Transition
 *
 * Simulates traditional Indian Handloom silk weaving.
 * When navigating, 30+ glowing warp & weft silk threads curve across the screen,
 * weaving the new page into existence over 800ms.
 */
export default function WovenSilkTransition({ children }) {
  const location = useLocation();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isInitialRender = useRef(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    // Skip on initial page load
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsTransitioning(true);

    // Match screen dimensions
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Generate 36 silk threads (18 warp vertical/curved, 18 weft horizontal/curved)
    const threads = [];
    const threadCount = 36;
    const colors = [
      '#F0C060', // Bright Gold
      '#C9A66B', // Raw Silk Gold
      '#FAF8F5', // Soft Ivory
      '#8B5E3C', // Terracotta Clay
      '#DFC49B', // Muted Amber
    ];

    for (let i = 0; i < threadCount; i++) {
      const isHorizontal = i % 2 === 0;
      threads.push({
        isHorizontal,
        offset: (i / threadCount) * (isHorizontal ? height : width),
        amplitude: 40 + Math.random() * 60,
        wavelength: 0.003 + Math.random() * 0.003,
        thickness: 1.5 + Math.random() * 2.5,
        color: colors[i % colors.length],
        alpha: 0.7 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.8,
      });
    }

    // Animation progress object for GSAP
    const progressObj = { progress: 0, threadCover: 0 };

    // GSAP Timeline (800ms signature duration)
    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        ctx.clearRect(0, 0, width, height);
      },
    });

    tl.to(progressObj, {
      progress: 1,
      threadCover: 1,
      duration: 0.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        ctx.clearRect(0, 0, width, height);

        const p = progressObj.progress;
        // Wave sweep across screen
        const sweepX = width * p * 1.4 - width * 0.2;

        threads.forEach((t) => {
          ctx.beginPath();
          ctx.lineWidth = t.thickness;
          ctx.strokeStyle = t.color;
          ctx.globalAlpha = Math.sin(p * Math.PI) * t.alpha;

          if (t.isHorizontal) {
            // Horizontal Weft Thread (waves horizontally from left to sweep position)
            const startY = t.offset;
            const endX = Math.min(width, Math.max(0, sweepX + (Math.random() - 0.5) * 100));

            ctx.moveTo(0, startY);
            for (let x = 0; x < endX; x += 15) {
              const y = startY + Math.sin(x * t.wavelength + t.phase + p * 10) * t.amplitude * (1 - p * 0.5);
              ctx.lineTo(x, y);
            }
          } else {
            // Vertical Warp Thread (waves vertically across the current sweep zone)
            const startX = t.offset;
            ctx.moveTo(startX, 0);
            for (let y = 0; y < height; y += 15) {
              const x = startX + Math.sin(y * t.wavelength + t.phase + p * 10) * t.amplitude * (1 - p * 0.5);
              if (x < sweepX) {
                ctx.lineTo(x, y);
              }
            }
          }
          ctx.stroke();

          // Add glowing nodes at thread intersections
          if (p > 0.2 && p < 0.8 && Math.random() > 0.6) {
            ctx.fillStyle = t.color;
            ctx.globalAlpha = (1 - Math.abs(p - 0.5) * 2) * 0.8;
            ctx.beginPath();
            ctx.arc(
              Math.min(width, Math.max(0, sweepX + (Math.random() - 0.5) * 80)),
              t.offset,
              2 + Math.random() * 2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        });
      },
    });

    animationRef.current = tl;

    return () => {
      if (animationRef.current) animationRef.current.kill();
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Handcrafted Woven Canvas Layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          display: isTransitioning ? 'block' : 'none',
        }}
      />
      {children}
    </div>
  );
}
