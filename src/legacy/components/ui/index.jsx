import React, { useState } from 'react';

// ===== DESIGN TOKENS =====
const colors = {
  accent: '#1d4ed8', accentHover: '#1e40af', accentLight: 'rgba(29,78,216,0.08)',
  success: '#16a34a', successLight: 'rgba(22,163,74,0.08)',
  error: '#dc2626', errorLight: 'rgba(220,38,38,0.06)',
  warn: '#ca8a04', warnLight: 'rgba(202,138,4,0.08)',
  text: '#1c1917', textSec: '#57534e', textTer: '#a8a29e',
  bg: '#f5f3f0', surface: '#fff', border: '#e0ded8', borderLight: '#eae8e4',
  sunken: '#efeee9',
};

const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
  md: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
};

// ===== BUTTON =====
const btnVariants = {
  primary: {
    bg: colors.accent,
    color: '#fff',
    border: 'none',
    shadow: `0 2px 8px rgba(29,78,216,0.35)`,
    hoverBg: colors.accentHover,
    hoverShadow: `0 4px 12px rgba(29,78,216,0.45)`,
    activeBg: '#1e3a8a',
  },
  secondary: {
    bg: '#fff',
    color: colors.accent,
    border: `1.5px solid ${colors.accent}`,
    shadow: shadows.sm,
    hoverBg: colors.accentLight,
    hoverShadow: shadows.md,
    activeBg: 'rgba(29,78,216,0.12)',
  },
  ghost: {
    bg: 'transparent',
    color: colors.textSec,
    border: 'none',
    shadow: 'none',
    hoverBg: colors.accentLight,
    hoverShadow: 'none',
    activeBg: 'rgba(29,78,216,0.12)',
  },
  success: {
    bg: colors.success,
    color: '#fff',
    border: 'none',
    shadow: `0 2px 8px rgba(22,163,74,0.35)`,
    hoverBg: '#15803d',
    hoverShadow: `0 4px 12px rgba(22,163,74,0.45)`,
    activeBg: '#166534',
  },
  danger: {
    bg: colors.error,
    color: '#fff',
    border: 'none',
    shadow: `0 2px 8px rgba(220,38,38,0.35)`,
    hoverBg: '#b91c1c',
    hoverShadow: `0 4px 12px rgba(220,38,38,0.45)`,
    activeBg: '#991b1b',
  },
};

const btnSizes = {
  sm: { height: 36, fontSize: 13, padding: '0 14px', borderRadius: 8 },
  md: { height: 44, fontSize: 15, padding: '0 20px', borderRadius: 10 },
  lg: { height: 52, fontSize: 16, padding: '0 28px', borderRadius: 12 },
};

export function Button({ children, variant = 'primary', size = 'md', full, className, style: styleProp, disabled, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const v = btnVariants[variant] || btnVariants.primary;
  const s = btnSizes[size] || btnSizes.md;

  const bg = disabled ? colors.border : active ? v.activeBg : hovered ? v.hoverBg : v.bg;
  const boxShadow = disabled ? 'none' : hovered ? v.hoverShadow : v.shadow;

  return (
    <button
      className={className}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        outline: 'none',
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
        background: bg,
        color: disabled ? colors.textTer : v.color,
        border: v.border,
        boxShadow,
        height: s.height,
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: s.borderRadius,
        ...styleProp,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ===== CARD =====
const cardVariants = {
  default: { bg: colors.surface, border: 'none', shadow: shadows.md },
  accent: { bg: `linear-gradient(135deg, ${colors.accentLight}, rgba(29,78,216,0.03))`, border: `1px solid rgba(29,78,216,0.15)`, shadow: shadows.sm },
  success: { bg: `linear-gradient(135deg, ${colors.successLight}, rgba(22,163,74,0.03))`, border: `1px solid rgba(22,163,74,0.15)`, shadow: shadows.sm },
  warn: { bg: `linear-gradient(135deg, ${colors.warnLight}, rgba(202,138,4,0.03))`, border: `1px solid rgba(202,138,4,0.15)`, shadow: shadows.sm },
  flat: { bg: colors.surface, border: `1px solid ${colors.border}`, shadow: 'none' },
};

const cardPadding = { sm: 12, md: 16, lg: 24 };

export function Card({ children, variant = 'default', padding = 'lg', hover, className, style: styleProp, ...props }) {
  const [hovered, setHovered] = useState(false);
  const v = cardVariants[variant] || cardVariants.default;
  const pad = cardPadding[padding] || cardPadding.lg;

  const isGradient = v.bg.startsWith('linear');

  return (
    <div
      className={className}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
      style={{
        borderRadius: 14,
        padding: pad,
        border: v.border,
        boxShadow: hovered && hover ? shadows.lg : v.shadow,
        transform: hovered && hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        ...(isGradient ? { background: v.bg } : { backgroundColor: v.bg }),
        ...styleProp,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ===== BADGE =====
const badgeVariants = {
  default: { bg: colors.accentLight, color: colors.accent },
  success: { bg: colors.successLight, color: colors.success },
  warn: { bg: colors.warnLight, color: colors.warn },
  error: { bg: colors.errorLight, color: colors.error },
};

export function Badge({ children, variant = 'default' }) {
  const v = badgeVariants[variant] || badgeVariants.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '20px',
      backgroundColor: v.bg,
      color: v.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// ===== PROGRESS RING =====
export function ProgressRing({ percent = 0, size = 60, strokeWidth = 4, color = '#1d4ed8' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.borderLight}
        strokeWidth={strokeWidth}
      />
      {/* Foreground arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.6s ease',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      {/* Center text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        style={{
          fontSize: size * 0.24,
          fontWeight: 700,
          fill: colors.text,
          fontFamily: 'inherit',
        }}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

// ===== PROGRESS BAR =====
export function ProgressBar({ percent = 0, height = 8, color, showLabel }) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const gradient = color || `linear-gradient(90deg, ${colors.accent}, #3b82f6)`;
  const isColor = color && !color.includes('gradient');

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        height,
        borderRadius: height / 2,
        backgroundColor: colors.sunken,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${clampedPercent}%`,
          borderRadius: height / 2,
          background: isColor ? color : gradient,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {showLabel && (
        <div style={{
          fontSize: 12,
          color: colors.textSec,
          marginTop: 4,
          textAlign: 'right',
          fontWeight: 600,
        }}>
          {Math.round(clampedPercent)}%
        </div>
      )}
    </div>
  );
}

// ===== STAT CARD =====
export function StatCard({ value, label, trend }) {
  const trendColor = trend > 0 ? colors.success : trend < 0 ? colors.error : colors.textTer;
  const trendArrow = trend > 0 ? '\u2191' : trend < 0 ? '\u2193' : '';

  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: '0 16px 16px',
      boxShadow: shadows.sm,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top gradient bar */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${colors.accent}, #3b82f6)`,
        margin: '0 -16px 14px',
      }} />
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: colors.text,
        lineHeight: 1.2,
      }}>
        {value}
        {trend !== undefined && trend !== 0 && (
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: trendColor,
            marginLeft: 6,
            verticalAlign: 'middle',
          }}>
            {trendArrow} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{
        fontSize: 13,
        color: colors.textSec,
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

// ===== SECTION TITLE =====
export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.textTer,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

// ===== WEEK PROGRESS =====
export function WeekProgress({ current = 1, total = 12 }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      {Array.from({ length: total }, (_, i) => {
        const week = i + 1;
        const completed = week < current;
        const isCurrent = week === current;

        return (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              transition: 'all 0.3s ease',
              ...(completed ? {
                backgroundColor: colors.accent,
                color: '#fff',
              } : isCurrent ? {
                backgroundColor: 'transparent',
                color: colors.accent,
                border: `2px solid ${colors.accent}`,
                boxShadow: `0 0 0 4px rgba(29,78,216,0.15)`,
              } : {
                backgroundColor: colors.sunken,
                color: colors.textTer,
              }),
            }}
          >
            {completed ? (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : week}
          </div>
        );
      })}
    </div>
  );
}

// ===== EMPTY STATE =====
export function EmptyState({ title, description }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: colors.sunken,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.textTer} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
      </div>
      {title && (
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: colors.textSec,
          marginBottom: 6,
        }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{
          fontSize: 14,
          color: colors.textTer,
          maxWidth: 280,
          lineHeight: 1.5,
        }}>
          {description}
        </div>
      )}
    </div>
  );
}

// ===== TOAST =====
export function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-100px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.35s ease',
      backgroundColor: colors.surface,
      color: colors.text,
      padding: '12px 24px',
      borderRadius: 12,
      boxShadow: shadows.lg,
      fontSize: 14,
      fontWeight: 500,
      zIndex: 10000,
      pointerEvents: visible ? 'auto' : 'none',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}
