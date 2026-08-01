import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import './FloatingTooltip.css';

export default function FloatingTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState(''); // 'play' or 'view'
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Only enable on fine pointer devices (desktops)
    const mediaQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      if (!wrapperRef.current) return;
      // Instant native DOM update for zero lag
      wrapperRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !target.closest) return;

      const cursorTarget = target.closest('[data-cursor]');
      if (cursorTarget) {
        const val = cursorTarget.getAttribute('data-cursor');
        if (val === 'play') {
          setType('play');
          setLabel('Play');
        } else if (val === 'view') {
          setType('view');
          setLabel('View');
        } else if (val === 'learn') {
          setType('view');
          setLabel('Learn');
        } else {
          setType('');
          setLabel(val);
        }
        setIsVisible(true);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target || !target.closest) return;

      const cursorTarget = target.closest('[data-cursor]');
      if (cursorTarget) {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div className="floating-tooltip-wrapper" ref={wrapperRef}>
      <div className={`floating-tooltip ${isVisible ? 'is-visible' : ''}`}>
        {type === 'play' && <Play size={12} fill="currentColor" />}
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
