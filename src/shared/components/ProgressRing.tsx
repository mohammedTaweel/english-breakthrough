import type { ReactNode } from 'react';

type ProgressRingProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: ReactNode;
};

export function ProgressRing({
  percent,
  size = 56,
  strokeWidth = 4,
  color = 'var(--c-accent)',
  children,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ display: 'block' }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--c-border)"
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
          transition: `stroke-dashoffset var(--dur-slow, 400ms) var(--ease, ease)`,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      {/* Center content */}
      <foreignObject x={0} y={0} width={size} height={size}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.24,
            fontWeight: 700,
            color: 'var(--c-text)',
            fontFamily: 'inherit',
          }}
        >
          {children ?? `${Math.round(clamped)}%`}
        </div>
      </foreignObject>
    </svg>
  );
}
