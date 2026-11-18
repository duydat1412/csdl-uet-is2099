import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export interface SceneTransitionProps {
  sceneKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Spatial scene transition inspired by antigravity.google:
 * smooth spring/cubic-bezier elevation and reveal between routes without jarring cuts.
 */
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  sceneKey,
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

  if (prefersReduced || isJsdom) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, y: 12, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, y: -6, scale: 0.996, transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] } }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export interface KineticOrbitalLoaderProps {
  label?: string;
  compact?: boolean;
}

/**
 * Dynamic geometric node orbital graphic (no blank text loading screens).
 */
export const KineticOrbitalLoader: React.FC<KineticOrbitalLoaderProps> = ({
  label = 'Đang đồng bộ không gian học tập...',
  compact = false,
}) => {
  const size = compact ? 42 : 68;
  return (
    <div className="inline-flex flex-col items-center justify-center gap-2.5 select-none">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="28"
          fill="none"
          stroke="var(--accent-border)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="32"
          ry="14"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.2"
          transform="rotate(-28 40 40)"
        />
        <circle cx="40" cy="40" r="6" fill="var(--accent-primary)" />
        <circle cx="68" cy="40" r="4" fill="var(--success-text)" />
        <circle cx="24" cy="17" r="3.5" fill="var(--accent-primary)" opacity="0.7" />
        <circle cx="20" cy="61" r="3.5" fill="var(--warning-text)" opacity="0.8" />
      </motion.svg>
      {label && (
        <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
