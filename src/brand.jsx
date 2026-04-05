/**
 * Taliq Brand Identity — Logo, Icons, Splash Screen
 * طَلِق — Premium English Learning for Arabic Adults 35+
 */

// ===== BRAND COLORS =====
export const BRAND = {
  dark: '#1a1614',
  darkAlt: '#231f1c',
  darkCard: '#2a2421',
  gold: '#e8b84b',
  goldDim: '#c49a38',
  goldGlow: 'rgba(232,184,75,0.15)',
  teal: '#5ec4b6',
  tealDim: '#4db5a5',
  coral: '#e87461',
  coralDim: '#d4634f',
  text: '#f5f0eb',
  textSecondary: '#a89e94',
  textTertiary: '#6d635a',
  border: 'rgba(255,255,255,0.08)',
  borderGold: 'rgba(232,184,75,0.2)',
};

// ===== TALIQ LOGO (SVG) =====
// Minimalist arrow breaking through a vertical barrier
export function TaliqLogo({ size = 48, showText = true, color = BRAND.gold }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? 12 : 0 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Barrier line — vertical, slightly rounded */}
        <rect x="28" y="8" width="3" height="48" rx="1.5" fill={BRAND.textTertiary} opacity="0.4" />
        {/* Breaking effect — gap in barrier */}
        <rect x="28" y="8" width="3" height="18" rx="1.5" fill={BRAND.textTertiary} opacity="0.4" />
        <rect x="28" y="38" width="3" height="18" rx="1.5" fill={BRAND.textTertiary} opacity="0.4" />
        {/* Arrow breaking through — dynamic, forward-moving */}
        <path
          d="M16 32 L38 32 L32 24 L44 32 L32 40 L38 32"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Burst particles after barrier */}
        <circle cx="46" cy="26" r="1.5" fill={color} opacity="0.6" />
        <circle cx="50" cy="32" r="1.5" fill={color} opacity="0.8" />
        <circle cx="46" cy="38" r="1.5" fill={color} opacity="0.6" />
        <circle cx="52" cy="28" r="1" fill={BRAND.teal} opacity="0.5" />
        <circle cx="52" cy="36" r="1" fill={BRAND.teal} opacity="0.5" />
        {/* Glow behind arrow */}
        <circle cx="40" cy="32" r="10" fill={color} opacity="0.06" />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: "'Noto Kufi Arabic', sans-serif",
            fontSize: size * 0.55,
            fontWeight: 800,
            color: color,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>طَلِق</span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: size * 0.2,
            fontWeight: 600,
            color: BRAND.textSecondary,
            letterSpacing: '0.15em',
            marginTop: 2,
          }}>TALIQ</span>
        </div>
      )}
    </div>
  );
}

// ===== APP ICON (for favicon / PWA) =====
export function TaliqAppIcon({ size = 512 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="512" height="512" rx="96" fill={BRAND.dark} />
      {/* Subtle radial glow */}
      <circle cx="256" cy="256" r="180" fill="url(#iconGlow)" />
      <defs>
        <radialGradient id="iconGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={BRAND.gold} stopOpacity="0.08" />
          <stop offset="100%" stopColor={BRAND.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Barrier */}
      <rect x="220" y="80" width="16" height="140" rx="8" fill="#4a3f38" />
      <rect x="220" y="292" width="16" height="140" rx="8" fill="#4a3f38" />
      {/* Arrow */}
      <path
        d="M120 256 L300 256 L260 208 L340 256 L260 304 L300 256"
        stroke={BRAND.gold}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Particles */}
      <circle cx="360" cy="216" r="10" fill={BRAND.gold} opacity="0.6" />
      <circle cx="390" cy="256" r="10" fill={BRAND.gold} opacity="0.8" />
      <circle cx="360" cy="296" r="10" fill={BRAND.gold} opacity="0.6" />
      <circle cx="400" cy="230" r="6" fill={BRAND.teal} opacity="0.5" />
      <circle cx="400" cy="282" r="6" fill={BRAND.teal} opacity="0.5" />
      {/* Arabic text */}
      <text
        x="256" y="430"
        textAnchor="middle"
        fontFamily="'Noto Kufi Arabic', sans-serif"
        fontSize="72"
        fontWeight="800"
        fill={BRAND.gold}
      >طَلِق</text>
    </svg>
  );
}

// ===== CUSTOM ICON SET (10 icons) =====
const iconPath = {
  listen: "M12 3C7 3 3 7 3 12s4 9 9 9c1.5 0 3-.4 4.2-1M17 8v8M21 6v12M14 10v4",
  read: "M4 19.5V5a2 2 0 012-2h8.5L19 7.5V19.5a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 014 19.5zM8 13h8M8 17h5",
  repeat: "M12 3C7 3 3 7 3 12M12 21c5 0 9-4 9-9M9 1l3 2-3 2M15 19l-3 2 3 2",
  remember: "M12 2a7 7 0 017 7c0 3-2 5.5-4 7.5S12 20 12 22c0-2-1-3.5-3-5.5S5 12 5 9a7 7 0 017-7z",
  produce: "M4 20h4L18.5 9.5a2 2 0 00-3-3L5 17v3zM13.5 6.5l3 3",
  apply: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  streak: "M12 2c0 4-6 6-6 10a6 6 0 0012 0c0-4-6-6-6-10z",
  points: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  level: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z",
  achievement: "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M5 20h14M8 20V10h8v10M12 4v2",
};

export function TaliqIcon({ name, size = 24, color = BRAND.gold, strokeWidth = 1.5 }) {
  const d = iconPath[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ===== SPLASH SCREEN =====
export function SplashScreen({ onReady }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: `radial-gradient(ellipse at center, ${BRAND.darkCard} 0%, ${BRAND.dark} 70%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Noto Kufi Arabic', sans-serif",
    }}>
      {/* Gold glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${BRAND.goldGlow} 0%, transparent 70%)`,
        top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
      }} />

      <div style={{ animation: 'fadeUp 0.8s ease-out', position: 'relative' }}>
        <TaliqLogo size={64} />
      </div>

      <p style={{
        color: BRAND.textSecondary,
        fontSize: 14,
        marginTop: 16,
        animation: 'fadeIn 1s 0.3s both',
      }}>تكلّم إنجليزي بثقة</p>

      {/* Spinner */}
      <div style={{
        position: 'absolute', bottom: 60,
        width: 28, height: 28,
        border: `2px solid ${BRAND.textTertiary}`,
        borderTopColor: BRAND.teal,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
