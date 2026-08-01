import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children, title, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const sizeStyles = {
    sm: { maxWidth: '440px' },
    md: { maxWidth: '640px' },
    lg: { maxWidth: '900px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-container" style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-6)',
        }}>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'relative',
              width: '100%',
              ...sizeStyles[size],
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-5) var(--space-6)',
                borderBottom: '1px solid var(--color-border-light)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 600,
                  fontSize: 'var(--text-lg)',
                }}>{title}</h3>
                <button onClick={onClose} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-tertiary)', cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                  onMouseEnter={e => {
                    e.target.style.background = 'var(--color-surface-hover)';
                    e.target.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--color-text-tertiary)';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div style={{ padding: 'var(--space-6)', maxHeight: '70vh', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
