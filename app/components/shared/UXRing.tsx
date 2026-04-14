"use client";

interface UXRingProps {
  score: number;
  size?: number;
}

export function UXRing({ score, size = 56 }: UXRingProps) {
  const color = score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-surface-dim)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ transform: `rotate(90deg) translate(0px, -${size}px)` }}
        fill={color}
        fontSize={14}
        fontWeight={800}
        fontFamily="monospace"
      >
        {score}
      </text>
    </svg>
  );
}
