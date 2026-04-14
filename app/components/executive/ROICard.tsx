"use client";

import type { App, ROIResult } from "@/app/lib/types";
import { idr } from "@/app/lib/calculators";
import { Badge } from "@/app/components/shared/Card";

interface ROICardProps {
  app: App;
  roi: ROIResult;
  onSelect: (app: App) => void;
  selected: boolean;
}

export function ROICard({ app, roi, onSelect, selected }: ROICardProps) {
  return (
    <div
      onClick={() => onSelect(app)}
      className="rounded-[10px] px-3.5 py-3 cursor-pointer transition-all duration-150"
      style={{
        background: selected ? roi.bg : "var(--color-surface)",
        border: `1px solid ${selected ? roi.color + "60" : "var(--color-border)"}`,
        borderTop: `3px solid ${roi.color}`,
        boxShadow: selected
          ? `0 2px 12px ${roi.color}25`
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[11px] font-bold text-txt mb-0.5">{app.name}</div>
          <div className="text-[9px] text-txt-dim font-mono">
            {app.type} &middot; {app.team}
          </div>
        </div>
        <Badge color={roi.color} bg={roi.bg}>
          {roi.label}
        </Badge>
      </div>
      <div
        className="text-[28px] font-extrabold font-mono leading-none mb-1"
        style={{ color: roi.color }}
      >
        {roi.pct > 0 ? "+" : ""}
        {roi.pct}%
      </div>
      <div className="flex justify-between items-center">
        <div className="text-[10px] text-txt-muted">Net: {idr(roi.netValue)}</div>
        <div
          className="text-[10px]"
          style={{ color: roi.trend >= 0 ? "var(--color-green)" : "var(--color-red)" }}
        >
          {roi.trend >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(roi.trend)}% vs lalu
        </div>
      </div>
    </div>
  );
}
