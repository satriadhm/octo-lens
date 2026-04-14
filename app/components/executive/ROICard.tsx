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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(app);
        }
      }}
      role="button"
      tabIndex={0}
      className="rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand/40 focus-visible:outline-offset-2"
      style={{
        background: selected ? roi.bg : "var(--color-surface)",
        border: `1px solid ${selected ? roi.color + "40" : "var(--color-border)"}`,
      }}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <div className="text-xs font-semibold text-txt mb-0.5">
            {app.name}
          </div>
          <div className="text-[11px] text-txt-dim">
            {app.type} &middot; {app.team}
          </div>
        </div>
        <Badge color={roi.color} bg={roi.bg}>
          {roi.label}
        </Badge>
      </div>
      <div
        className="text-2xl font-display font-extrabold leading-none mb-1.5"
        style={{ color: roi.color }}
      >
        {roi.pct > 0 ? "+" : ""}
        {roi.pct}%
      </div>
      <div className="flex justify-between items-center">
        <div className="text-[11px] text-txt-muted">Net: {idr(roi.netValue)}</div>
        <div
          className="text-[11px] font-medium"
          style={{
            color:
              roi.trend >= 0 ? "var(--color-green)" : "var(--color-red)",
          }}
        >
          {roi.trend >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(roi.trend)}% vs
          last month
        </div>
      </div>
    </div>
  );
}
