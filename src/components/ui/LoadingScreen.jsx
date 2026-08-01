import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingScreen — Cinematic entry sequence
 * Animated KalaConnect brand mark with radial glow,
 * smooth percentage counter, and elegant crossfade exit.
 */
export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100 over ~2.2 seconds
    let start = null;
    const duration = 2200;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        // Small delay before exit
        setTimeout(() => onComplete?.(), 300);
      }
    }

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--color-bg)',
        cursor: 'auto',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,166,107,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
      >
        {/* Spinning accent ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: 'var(--color-accent)',
            borderRightColor: 'rgba(201,166,107,0.3)',
            margin: '0 auto var(--space-8)',
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 500,
            letterSpacing: 'var(--tracking-wider)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)',
          }}
        >
          KALA<span style={{ color: 'var(--color-accent)' }}>CONNECT</span>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '11px',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-10)',
          }}
        >
          Digital Craftsmanship
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: 120,
            height: 1,
            background: 'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'var(--color-accent)',
              borderRadius: 'var(--radius-full)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
