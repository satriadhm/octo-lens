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

export function ChartTooltip({ active, payload, label, unit = "M" }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="text-[10px] text-txt-dim font-mono mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-[11px] font-semibold mb-0.5" style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString("id-ID")}
          {unit}
        </div>
      ))}
    </div>
  );
}
