import { motion } from 'framer-motion';
import './SkeletonLoader.css';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array(count).fill(0);

  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-card">
            <motion.div 
              className="skeleton-img"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="skeleton-content">
              <motion.div className="skeleton-text skeleton-title" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <motion.div className="skeleton-text skeleton-subtitle" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className={`skeleton-base ${type}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
