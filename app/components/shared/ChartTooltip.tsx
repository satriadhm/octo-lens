"use client";

interface Payload {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: string;
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "M",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-3.5 py-2.5 shadow-md">
      <div className="text-[11px] text-txt-dim font-display font-medium mb-1">
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          className="text-xs font-semibold mb-0.5"
          style={{ color: p.color }}
        >
          {p.name}: {p.value?.toLocaleString("en-US")}
          {unit}
        </div>
      ))}
    </div>
  );
}
