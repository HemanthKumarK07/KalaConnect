import React from 'react';
import './Logo.css';

const Logo = ({
  variant = 'horizontal', // 'horizontal', 'stacked', 'icon', 'wordmark'
  theme = 'light', // 'light', 'dark', 'monochrome'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  animated = false,
  className = ''
}) => {
  // Pixel-based sizes — carefully tuned per context
  const sizeMap = {
    sm:  { icon: 34, fontSize: '1.15rem', gap: 8  },
    md:  { icon: 36, fontSize: '1.25rem', gap: 8  },
    lg:  { icon: 52, fontSize: '1.625rem', gap: 10 },
    xl:  { icon: 72, fontSize: '2.25rem', gap: 12 },
  };

  const s = sizeMap[size] || sizeMap.md;

  // Brand colors
  const colors = theme === 'monochrome'
    ? { primary: 'currentColor', secondary: 'currentColor', accent: 'currentColor' }
    : { primary: '#8B5E3C', secondary: '#C97A40', accent: '#D9A441' };

  const textColor = theme === 'dark'
    ? '#fff'
    : theme === 'monochrome'
      ? 'currentColor'
      : 'var(--color-text-primary, #1c1c1c)';

  // The Icon — minimalist geometric lotus / weave knot
  const Icon = () => (
    <svg
      className={`logo-icon ${animated ? 'logo-icon-animated' : ''}`}
      width={s.icon}
      height={s.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Center Petal / Loop */}
      <path
        d="M 50 15 C 70 40 70 65 50 90 C 30 65 30 40 50 15 Z"
        stroke={colors.primary}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-path-primary"
      />
      {/* Left Petal / Loop */}
      <path
        d="M 50 90 C 20 85 5 50 15 25 C 30 40 40 60 50 90"
        stroke={colors.secondary}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-path-secondary"
      />
      {/* Right Petal / Loop */}
      <path
        d="M 50 90 C 80 85 95 50 85 25 C 70 40 60 60 50 90"
        stroke={colors.accent}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-path-accent"
      />
    </svg>
  );

  const Wordmark = () => (
    <span
      className="logo-wordmark"
      style={{
        fontFamily: 'var(--font-heading, "Playfair Display", serif)',
        fontWeight: 700,
        fontSize: s.fontSize,
        letterSpacing: '-0.02em',
        color: textColor,
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
      }}
    >
      Kala<span style={{ color: theme === 'monochrome' ? 'inherit' : colors.primary }}>Connect</span>
    </span>
  );

  const containerBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  };

  if (variant === 'icon') {
    return (
      <div className={`${animated ? 'logo-container-animated' : ''} ${className}`} style={containerBase}>
        <Icon />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`${animated ? 'logo-container-animated' : ''} ${className}`} style={containerBase}>
        <Wordmark />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`${animated ? 'logo-container-animated' : ''} ${className}`}
        style={{ ...containerBase, flexDirection: 'column', gap: s.gap }}
      >
        <Icon />
        <Wordmark />
      </div>
    );
  }

  // Horizontal (default)
  return (
    <div
      className={`${animated ? 'logo-container-animated' : ''} ${className}`}
      style={{ ...containerBase, gap: s.gap }}
    >
      <Icon />
      <Wordmark />
    </div>
  );
};

export default Logo;
