import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const btnRef = useRef(null);

  const handleClick = useCallback((e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    props.onClick?.(e);
  }, [props.onClick, loading, disabled]);

  const sizeClass = size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '';
  const isDisabled = loading || disabled;

  return (
    <motion.button
      ref={btnRef}
      className={`btn btn--${variant} ${sizeClass} ${loading ? 'btn--loading' : ''} ${className}`}
      onClick={handleClick}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={isDisabled}
      style={{
        opacity: isDisabled ? 0.7 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...props.style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn__spinner" />
          <span style={{ opacity: 0.8 }}>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="btn__icon">{icon}</span>}
          {children}
          {iconRight && (
            <motion.span
              className="btn__icon-right"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              {iconRight}
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  );
}
