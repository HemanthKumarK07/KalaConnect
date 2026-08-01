import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const variants = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  'scale': {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  'blur-in': {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

export default function SectionReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.7,
  threshold = 0.15,
  className = '',
  staggerChildren = false,
  staggerDelay = 0.1,
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const containerVariants = staggerChildren
    ? {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }
    : variants[animation] || variants['fade-up'];

  const itemVariants = staggerChildren
    ? variants[animation] || variants['fade-up']
    : undefined;

  if (staggerChildren) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                transition={{
                  duration,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {child}
              </motion.div>
            ))
          : children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
