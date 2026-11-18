import React from 'react';
import LiquidGlass from '@nkzw/liquid-glass';
import { Glass, KonstaProvider } from 'konsta/react';

function canRunLiquidGlassShader(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (/jsdom/i.test(navigator.userAgent)) {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('2d'));
  } catch {
    return false;
  }
}

export interface HubKonstaShellProps {
  isDark: boolean;
  children: React.ReactNode;
}

/**
 * Wraps the multi-course workspace in Konsta's iOS provider + drifting spatial ambient orbs
 * so translucent glass layers refract real depth without harsh neon edges.
 */
export const HubKonstaShell: React.FC<HubKonstaShellProps> = ({ isDark, children }) => {
  return (
    <KonstaProvider theme="ios" dark={isDark} iosHoverHighlight>
      <div
        className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Spatial iOS Ambient Gradient Orbs behind translucent glass */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        >
          <div
            className="hub-ambient-orb-a absolute -top-28 -left-24 h-[460px] w-[460px] rounded-full opacity-55 blur-[110px]"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(37,99,235,0.28) 0%, rgba(15,23,42,0) 70%)'
                : 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(238,243,250,0) 70%)',
            }}
          />
          <div
            className="hub-ambient-orb-b absolute top-1/3 -right-28 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, rgba(15,23,42,0) 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(238,243,250,0) 70%)',
            }}
          />
          <div
            className="absolute -bottom-36 left-1/3 h-[420px] w-[560px] rounded-full opacity-40 blur-[110px]"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(15,23,42,0) 72%)'
                : 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(238,243,250,0) 72%)',
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen w-full flex flex-col">
          {children}
        </div>
      </div>
    </KonstaProvider>
  );
};

export interface IosGlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Interactive iOS Translucent Glass panel powered by Konsta UI v5 `<Glass>`
 * reinforced with hairline specular borders.
 */
export const IosGlassSurface: React.FC<IosGlassSurfaceProps> = ({
  children,
  className = '',
  highlight = true,
  style,
  onClick,
}) => {
  return (
    <Glass
      highlight={highlight}
      onClick={onClick}
      className={`rounded-2xl border transition-all ${className}`}
      style={{
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--glass-specular), var(--shadow-md)',
        ...style,
      }}
    >
      {children}
    </Glass>
  );
};

export interface ReadingGlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * High-clarity iOS frosted glass container designed specifically for KaTeX math,
 * relational schemas, and dense Vietnamese academic explanations.
 */
export const ReadingGlassPanel: React.FC<ReadingGlassPanelProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`ios-frosted-panel rounded-2xl ${className}`} style={style}>
      {children}
    </div>
  );
};

export interface LiquidGlassPillProps {
  children: React.ReactNode;
  isDark?: boolean;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

/**
 * Real optical refraction Liquid Glass pill powered by `@nkzw/liquid-glass` when
 * running in a 2D-canvas browser, with an inline sizer so its centered transform aligns in flow.
 */
export const LiquidGlassPill: React.FC<LiquidGlassPillProps> = ({
  children,
  isDark = false,
  className = '',
  onClick,
  ariaLabel,
}) => {
  const useShader = canRunLiquidGlassShader();

  if (!useShader) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ios-frosted-strong text-xs font-semibold cursor-pointer transition-transform active:scale-95 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center rounded-full cursor-pointer group ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full ios-frosted-strong pointer-events-none"
      />
      {/* Invisible in-flow sizer keeps exact pill dimensions aligned with centered LiquidGlass */}
      <span
        aria-hidden="true"
        className="invisible inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold whitespace-nowrap select-none pointer-events-none"
      >
        {children}
      </span>

      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
        }}
      >
        <LiquidGlass
          mode="standard"
          overLight={false}
          borderRadius={999}
          padding="6px 16px"
          displacementScale={22}
          blurAmount={0.08}
          saturation={145}
          aberrationIntensity={1.2}
          elasticity={0.2}
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            {children}
          </span>
        </LiquidGlass>
      </span>
    </button>
  );
};
