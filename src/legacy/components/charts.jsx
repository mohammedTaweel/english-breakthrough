import { useState, useEffect } from "react";

// ===== SHARED COLORS =====
const C = {
  green: "#16a34a",
  blue: "#1d4ed8",
  red: "#dc2626",
  textPrimary: "#1c1917",
  textSec: "#57534e",
  textTer: "#a8a29e",
  border: "#e0ded8",
  bg: "#f5f3f0",
  surface: "#fff",
};

function barColor(pct) {
  if (pct >= 80) return C.green;
  if (pct >= 50) return C.blue;
  return C.red;
}

// ===== 1. BarChart — weekly quiz results =====
export function BarChart({ data = [], height = 160 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  if (!data.length) return null;

  const maxVal = Math.max(...data.map(d => d.value), 100);
  const barAreaH = height - 40; // space for labels top/bottom
  const barCount = data.length;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${Math.max(barCount * 48, 200)} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <defs>
          {data.map((d, i) => {
            const c = d.color || barColor(d.value);
            return (
              <linearGradient key={`bg${i}`} id={`bar-g-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity="1" />
                <stop offset="100%" stopColor={c} stopOpacity="0.7" />
              </linearGradient>
            );
          })}
        </defs>
        {/* Subtle grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = 20 + barAreaH - (pct / maxVal) * barAreaH;
          return (
            <line
              key={pct}
              x1="0"
              y1={y}
              x2={barCount * 48}
              y2={y}
              stroke={C.border}
              strokeWidth="0.5"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barW = 24;
          const gap = 48;
          const x = i * gap + (gap - barW) / 2;
          const barH = mounted ? (d.value / maxVal) * barAreaH : 0;
          const y = 20 + barAreaH - barH;
          const c = d.color || barColor(d.value);

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx="4"
                ry="4"
                fill={`url(#bar-g-${i})`}
                style={{ transition: "y 0.6s ease, height 0.6s ease" }}
              />
              {/* Value label above */}
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fill: c,
                  fontFamily: "inherit",
                  opacity: mounted ? 1 : 0,
                  transition: "opacity 0.4s ease 0.3s",
                }}
              >
                {d.value}%
              </text>
              {/* Date label below */}
              <text
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                style={{
                  fontSize: 10,
                  fill: C.textTer,
                  fontFamily: "inherit",
                }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ===== 2. MemoryDonut — recall performance =====
export function MemoryDonut({ remembered = 0, partial = 0, forgot = 0, size = 140 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const total = remembered + partial + forgot;
  if (total === 0) return null;

  const pctRecalled = Math.round((remembered / total) * 100);
  const strokeW = 18;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const segments = [
    { value: remembered, color: C.green, label: "تذكّرتها" },
    { value: partial, color: C.blue, label: "تقريباً" },
    { value: forgot, color: C.red, label: "نسيتها" },
  ].filter(s => s.value > 0);

  let cumulative = 0;
  const arcs = segments.map(seg => {
    const frac = seg.value / total;
    const dashLen = frac * circumference;
    const gapLen = circumference - dashLen;
    const offset = -cumulative * circumference + circumference * 0.25; // rotate to start at top
    cumulative += frac;
    return { ...seg, dashLen, gapLen, offset };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        <defs>
          {arcs.map((a, i) => (
            <linearGradient key={i} id={`donut-g-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={a.color} stopOpacity="1" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0.75" />
            </linearGradient>
          ))}
        </defs>
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={C.bg}
          strokeWidth={strokeW}
        />
        {/* Segments */}
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#donut-g-${i})`}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={mounted ? `${a.dashLen} ${a.gapLen}` : `0 ${circumference}`}
            strokeDashoffset={a.offset}
            style={{
              transition: "stroke-dasharray 0.8s ease",
              transformOrigin: "50% 50%",
            }}
          />
        ))}
        {/* Center text */}
        <text
          x="50%"
          y="46%"
          dominantBaseline="central"
          textAnchor="middle"
          style={{
            fontSize: size * 0.22,
            fontWeight: 800,
            fill: C.textPrimary,
            fontFamily: "inherit",
          }}
        >
          {pctRecalled}%
        </text>
        <text
          x="50%"
          y="64%"
          dominantBaseline="central"
          textAnchor="middle"
          style={{
            fontSize: size * 0.1,
            fill: C.textSec,
            fontFamily: "inherit",
          }}
        >
          تذكّر
        </text>
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textSec }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: s.color,
              flexShrink: 0,
            }} />
            <span style={{ fontWeight: 600 }}>{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 3. TrendLine — progress over time =====
export function TrendLine({ data = [], height = 80 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  if (data.length < 2) return null;

  const padding = { top: 10, right: 20, bottom: 10, left: 20 };
  const w = 300;
  const innerW = w - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerW,
    y: padding.top + innerH - ((d.y - minY) / rangeY) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${points[points.length - 1].x},${height - padding.bottom} L${points[0].x},${height - padding.bottom} Z`;

  const gradId = "trend-fill-" + Math.random().toString(36).slice(2, 8);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity="0.25" />
            <stop offset="100%" stopColor={C.blue} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Subtle grid */}
        {[0, 0.5, 1].map((frac, i) => {
          const y = padding.top + innerH * (1 - frac);
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={w - padding.right}
              y2={y}
              stroke={C.border}
              strokeWidth="0.5"
              strokeDasharray="3,3"
              opacity="0.4"
            />
          );
        })}
        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          opacity={mounted ? 1 : 0}
          style={{ transition: "opacity 0.6s ease" }}
        />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={C.blue}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={mounted ? "none" : `${innerW * 2}`}
          strokeDashoffset={mounted ? "0" : `${innerW * 2}`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={C.surface}
              stroke={C.blue}
              strokeWidth="2"
              opacity={mounted ? 1 : 0}
              style={{ transition: `opacity 0.4s ease ${0.3 + i * 0.1}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ===== 4. SkillRadar — skill breakdown (horizontal bars) =====
const SKILL_LABELS = {
  grammar: "القواعد",
  vocab: "المفردات",
  reading: "القراءة",
  speaking: "المحادثة",
  listening: "الاستماع",
  comprehension: "الفهم",
};

export function SkillRadar({ skills = {} }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const entries = Object.entries(skills).filter(([, v]) => v != null && v.total > 0);
  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map(([key, val]) => {
        const pct = Math.round((val.correct / val.total) * 100);
        const color = pct >= 80 ? C.green : pct >= 50 ? C.blue : C.red;
        const label = SKILL_LABELS[key] || key;

        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Label */}
            <div style={{
              width: 64,
              fontSize: 12,
              fontWeight: 600,
              color: C.textSec,
              textAlign: "right",
              flexShrink: 0,
            }}>
              {label}
            </div>
            {/* Bar track */}
            <div style={{
              flex: 1,
              height: 10,
              borderRadius: 5,
              backgroundColor: C.bg,
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                height: "100%",
                width: mounted ? `${pct}%` : "0%",
                borderRadius: 5,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                transition: "width 0.7s ease",
              }} />
            </div>
            {/* Percentage */}
            <div style={{
              width: 36,
              fontSize: 12,
              fontWeight: 700,
              color: color,
              textAlign: "left",
              fontFamily: "inherit",
              flexShrink: 0,
            }}>
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
