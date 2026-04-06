// Inline SVG illustrations for English Breakthrough app
// Clean, minimal, modern line art style
// Color palette: accent=#1d4ed8, success=#16a34a, text=#1c1917, bg=#f5f3f0

const C = {
  accent: "#1d4ed8",
  success: "#16a34a",
  text: "#1c1917",
  bg: "#f5f3f0",
  light: "#93c5fd",
  muted: "#a8a29e",
};

export function IllustrationOnboard({ size = 200 }) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 240 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sunrise / light rays behind */}
      <circle cx="120" cy="170" r="60" fill={C.light} opacity="0.15" />
      {[-40, -20, 0, 20, 40].map((angle, i) => (
        <line
          key={i}
          x1="120"
          y1="130"
          x2={120 + Math.sin((angle * Math.PI) / 180) * 70}
          y2={130 - Math.cos((angle * Math.PI) / 180) * 70}
          stroke={C.accent}
          strokeWidth="1.5"
          opacity="0.3"
          strokeLinecap="round"
        />
      ))}

      {/* Broken wall — left portion */}
      <rect x="30" y="70" width="16" height="110" rx="2" fill={C.muted} opacity="0.4" />
      <rect x="46" y="85" width="16" height="95" rx="2" fill={C.muted} opacity="0.35" />
      <rect x="62" y="100" width="12" height="80" rx="2" fill={C.muted} opacity="0.3" />

      {/* Broken wall — right portion */}
      <rect x="162" y="100" width="12" height="80" rx="2" fill={C.muted} opacity="0.3" />
      <rect x="178" y="85" width="16" height="95" rx="2" fill={C.muted} opacity="0.35" />
      <rect x="198" y="70" width="16" height="110" rx="2" fill={C.muted} opacity="0.4" />

      {/* Falling fragments */}
      <rect x="78" y="115" width="8" height="12" rx="1" fill={C.muted} opacity="0.35" transform="rotate(15 82 121)" />
      <rect x="148" y="108" width="10" height="8" rx="1" fill={C.muted} opacity="0.3" transform="rotate(-20 153 112)" />
      <rect x="85" y="140" width="6" height="9" rx="1" fill={C.muted} opacity="0.25" transform="rotate(30 88 144)" />
      <rect x="152" y="135" width="7" height="10" rx="1" fill={C.muted} opacity="0.25" transform="rotate(-10 155 140)" />

      {/* Person — head */}
      <circle cx="120" cy="95" r="14" stroke={C.accent} strokeWidth="2" fill="none" />

      {/* Person — body */}
      <line x1="120" y1="109" x2="120" y2="148" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />

      {/* Person — arms (reaching forward triumphantly) */}
      <line x1="120" y1="122" x2="100" y2="135" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="122" x2="142" y2="112" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />

      {/* Person — legs (walking stride) */}
      <line x1="120" y1="148" x2="108" y2="175" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="148" x2="134" y2="175" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />

      {/* Ground line */}
      <line x1="20" y1="180" x2="220" y2="180" stroke={C.muted} strokeWidth="1" opacity="0.4" strokeDasharray="4 4" />
    </svg>
  );
}

export function IllustrationListen({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="70" cy="80" r="22" stroke={C.accent} strokeWidth="2" fill="none" />

      {/* Headphone band */}
      <path
        d="M48 75 Q48 50 70 48 Q92 50 92 75"
        stroke={C.accent}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left ear cup */}
      <rect x="40" y="70" width="10" height="18" rx="4" fill={C.accent} opacity="0.2" stroke={C.accent} strokeWidth="1.5" />

      {/* Right ear cup */}
      <rect x="90" y="70" width="10" height="18" rx="4" fill={C.accent} opacity="0.2" stroke={C.accent} strokeWidth="1.5" />

      {/* Sound waves */}
      <path
        d="M108 72 Q116 80 108 88"
        stroke={C.accent}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M116 65 Q128 80 116 95"
        stroke={C.accent}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M124 58 Q140 80 124 102"
        stroke={C.accent}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Small music notes */}
      <circle cx="132" cy="68" r="2.5" fill={C.accent} opacity="0.4" />
      <line x1="134.5" y1="68" x2="134.5" y2="58" stroke={C.accent} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export function IllustrationSpeak({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="60" cy="100" r="22" stroke={C.accent} strokeWidth="2" fill="none" />

      {/* Neck + shoulders hint */}
      <line x1="60" y1="122" x2="60" y2="135" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 145 Q60 132 80 145" stroke={C.accent} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Speech bubble 1 — large */}
      <rect x="88" y="55" width="50" height="28" rx="10" stroke={C.accent} strokeWidth="1.5" fill={C.accent} opacity="0.1" />
      <rect x="88" y="55" width="50" height="28" rx="10" stroke={C.accent} strokeWidth="1.5" fill="none" />
      {/* Bubble tail */}
      <path d="M92 83 L85 92 L98 83" fill={C.accent} opacity="0.1" stroke={C.accent} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Text lines inside */}
      <line x1="96" y1="66" x2="126" y2="66" stroke={C.accent} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="96" y1="74" x2="118" y2="74" stroke={C.accent} strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />

      {/* Speech bubble 2 — small */}
      <rect x="100" y="28" width="34" height="20" rx="8" stroke={C.success} strokeWidth="1.5" fill={C.success} opacity="0.08" />
      <rect x="100" y="28" width="34" height="20" rx="8" stroke={C.success} strokeWidth="1.5" fill="none" />
      <line x1="108" y1="38" x2="126" y2="38" stroke={C.success} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />

      {/* Speech bubble 3 — tiny circle */}
      <circle cx="142" cy="95" r="10" stroke={C.accent} strokeWidth="1.5" fill={C.accent} opacity="0.06" />
      <circle cx="142" cy="95" r="10" stroke={C.accent} strokeWidth="1.5" fill="none" opacity="0.6" />
      <line x1="136" y1="95" x2="148" y2="95" stroke={C.accent} strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationSuccess({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Radiating lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1={80 + Math.cos((angle * Math.PI) / 180) * 42}
          y1={70 + Math.sin((angle * Math.PI) / 180) * 42}
          x2={80 + Math.cos((angle * Math.PI) / 180) * 55}
          y2={70 + Math.sin((angle * Math.PI) / 180) * 55}
          stroke={C.accent}
          strokeWidth="1.5"
          opacity="0.3"
          strokeLinecap="round"
        />
      ))}

      {/* Trophy cup */}
      <path
        d="M60 50 L60 85 Q60 100 80 105 Q100 100 100 85 L100 50 Z"
        stroke={C.accent}
        strokeWidth="2"
        fill={C.accent}
        opacity="0.1"
      />
      <path
        d="M60 50 L60 85 Q60 100 80 105 Q100 100 100 85 L100 50"
        stroke={C.accent}
        strokeWidth="2"
        fill="none"
      />

      {/* Trophy rim */}
      <line x1="56" y1="50" x2="104" y2="50" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />

      {/* Left handle */}
      <path d="M60 58 Q45 58 45 72 Q45 82 58 82" stroke={C.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Right handle */}
      <path d="M100 58 Q115 58 115 72 Q115 82 102 82" stroke={C.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Trophy stem + base */}
      <line x1="80" y1="105" x2="80" y2="118" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
      <rect x="64" y="118" width="32" height="6" rx="2" stroke={C.accent} strokeWidth="1.5" fill={C.accent} opacity="0.15" />
      <rect x="64" y="118" width="32" height="6" rx="2" stroke={C.accent} strokeWidth="1.5" fill="none" />

      {/* Star on trophy */}
      <polygon
        points="80,60 83,70 93,70 85,76 88,86 80,80 72,86 75,76 67,70 77,70"
        fill={C.success}
        opacity="0.5"
      />

      {/* Small celebration dots */}
      <circle cx="40" cy="40" r="2" fill={C.success} opacity="0.5" />
      <circle cx="125" cy="35" r="2.5" fill={C.accent} opacity="0.4" />
      <circle cx="35" cy="90" r="1.5" fill={C.accent} opacity="0.3" />
      <circle cx="130" cy="100" r="2" fill={C.success} opacity="0.4" />
    </svg>
  );
}

export function IllustrationEmpty({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Open book — left page */}
      <path
        d="M80 45 Q60 40 35 45 L35 120 Q60 115 80 120 Z"
        stroke={C.muted}
        strokeWidth="1.5"
        fill={C.muted}
        opacity="0.06"
      />
      <path
        d="M80 45 Q60 40 35 45 L35 120 Q60 115 80 120"
        stroke={C.muted}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Open book — right page */}
      <path
        d="M80 45 Q100 40 125 45 L125 120 Q100 115 80 120 Z"
        stroke={C.muted}
        strokeWidth="1.5"
        fill={C.muted}
        opacity="0.06"
      />
      <path
        d="M80 45 Q100 40 125 45 L125 120 Q100 115 80 120"
        stroke={C.muted}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Spine */}
      <line x1="80" y1="45" x2="80" y2="120" stroke={C.muted} strokeWidth="1.5" />

      {/* Dotted placeholder lines — left page */}
      <line x1="45" y1="60" x2="72" y2="58" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" strokeLinecap="round" />
      <line x1="45" y1="70" x2="72" y2="68" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.35" strokeLinecap="round" />
      <line x1="45" y1="80" x2="68" y2="78" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" strokeLinecap="round" />
      <line x1="45" y1="90" x2="72" y2="88" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.25" strokeLinecap="round" />
      <line x1="45" y1="100" x2="65" y2="98" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.2" strokeLinecap="round" />

      {/* Dotted placeholder lines — right page */}
      <line x1="88" y1="58" x2="115" y2="60" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" strokeLinecap="round" />
      <line x1="88" y1="68" x2="115" y2="70" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.35" strokeLinecap="round" />
      <line x1="88" y1="78" x2="112" y2="80" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" strokeLinecap="round" />
      <line x1="88" y1="88" x2="115" y2="90" stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.25" strokeLinecap="round" />

      {/* Small question mark above book */}
      <text x="80" y="35" textAnchor="middle" fontSize="16" fill={C.muted} opacity="0.4" fontFamily="sans-serif">?</text>
    </svg>
  );
}

export function IllustrationProgress({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines */}
      <line x1="30" y1="130" x2="140" y2="130" stroke={C.muted} strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="130" x2="30" y2="30" stroke={C.muted} strokeWidth="1" opacity="0.3" />

      {/* Upward trend line */}
      <polyline
        points="35,120 55,110 75,95 95,70 115,45"
        stroke={C.accent}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area fill under trend */}
      <polygon
        points="35,120 55,110 75,95 95,70 115,45 115,130 35,130"
        fill={C.accent}
        opacity="0.06"
      />

      {/* Data points */}
      <circle cx="35" cy="120" r="3" fill={C.accent} opacity="0.5" />
      <circle cx="55" cy="110" r="3" fill={C.accent} opacity="0.5" />
      <circle cx="75" cy="95" r="3" fill={C.accent} opacity="0.6" />
      <circle cx="95" cy="70" r="3" fill={C.accent} opacity="0.7" />
      <circle cx="115" cy="45" r="4" fill={C.success} />

      {/* Arrow at the end */}
      <path d="M112 38 L115 45 L122 42" stroke={C.success} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Person at peak */}
      <circle cx="115" cy="28" r="7" stroke={C.accent} strokeWidth="1.5" fill="none" />
      {/* Raised arms */}
      <line x1="108" y1="22" x2="115" y2="28" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="122" y1="22" x2="115" y2="28" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />

      {/* Small percentage label */}
      <text x="130" y="48" fontSize="10" fill={C.success} fontFamily="sans-serif" fontWeight="bold" opacity="0.7">+</text>
    </svg>
  );
}

export function IllustrationMeeting({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Table */}
      <ellipse cx="80" cy="115" rx="55" ry="14" stroke={C.muted} strokeWidth="1.5" fill={C.muted} opacity="0.08" />
      <ellipse cx="80" cy="115" rx="55" ry="14" stroke={C.muted} strokeWidth="1.5" fill="none" />

      {/* Person 1 — left */}
      <circle cx="40" cy="80" r="10" stroke={C.accent} strokeWidth="1.5" fill="none" />
      <line x1="40" y1="90" x2="40" y2="108" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />

      {/* Person 2 — center */}
      <circle cx="80" cy="72" r="11" stroke={C.accent} strokeWidth="2" fill="none" />
      <line x1="80" y1="83" x2="80" y2="102" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />

      {/* Person 3 — right */}
      <circle cx="120" cy="80" r="10" stroke={C.accent} strokeWidth="1.5" fill="none" />
      <line x1="120" y1="90" x2="120" y2="108" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />

      {/* Speech bubble from center person */}
      <rect x="92" y="42" width="36" height="20" rx="8" stroke={C.accent} strokeWidth="1.5" fill={C.accent} opacity="0.08" />
      <rect x="92" y="42" width="36" height="20" rx="8" stroke={C.accent} strokeWidth="1.5" fill="none" />
      <path d="M96 62 L92 68 L102 62" stroke={C.accent} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="100" y1="50" x2="120" y2="50" stroke={C.accent} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <line x1="100" y1="56" x2="114" y2="56" stroke={C.accent} strokeWidth="1" opacity="0.3" strokeLinecap="round" />

      {/* Small speech indicator from left person */}
      <circle cx="28" cy="68" r="3" stroke={C.success} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="24" cy="62" r="2" stroke={C.success} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

export function IllustrationTravel({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe circle */}
      <circle cx="80" cy="85" r="40" stroke={C.accent} strokeWidth="2" fill={C.accent} opacity="0.05" />
      <circle cx="80" cy="85" r="40" stroke={C.accent} strokeWidth="2" fill="none" />

      {/* Globe latitude lines */}
      <ellipse cx="80" cy="85" rx="40" ry="15" stroke={C.accent} strokeWidth="1" opacity="0.25" fill="none" />
      <ellipse cx="80" cy="85" rx="40" ry="30" stroke={C.accent} strokeWidth="1" opacity="0.2" fill="none" />

      {/* Globe longitude line (center vertical) */}
      <ellipse cx="80" cy="85" rx="15" ry="40" stroke={C.accent} strokeWidth="1" opacity="0.25" fill="none" />

      {/* Airplane trail — dashed arc circling the globe */}
      <path
        d="M50 55 Q30 30 80 28 Q140 28 135 70 Q130 100 100 110"
        stroke={C.accent}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Airplane — simple triangle/arrow shape */}
      <g transform="translate(48, 57) rotate(-40)">
        <path
          d="M0 0 L-6 3 L-2 0 L-6 -3 Z"
          fill={C.accent}
          opacity="0.8"
        />
        {/* Tail */}
        <line x1="-6" y1="0" x2="-10" y2="0" stroke={C.accent} strokeWidth="1.5" opacity="0.6" />
        <path d="M-10 0 L-12 -2 M-10 0 L-12 2" stroke={C.accent} strokeWidth="1" opacity="0.6" />
      </g>

      {/* Small location pin */}
      <g transform="translate(100, 105)">
        <path
          d="M0 -8 Q-5 -8 -5 -4 Q-5 0 0 6 Q5 0 5 -4 Q5 -8 0 -8 Z"
          stroke={C.success}
          strokeWidth="1.5"
          fill={C.success}
          opacity="0.3"
        />
        <circle cx="0" cy="-4" r="1.5" fill={C.success} opacity="0.6" />
      </g>
    </svg>
  );
}
