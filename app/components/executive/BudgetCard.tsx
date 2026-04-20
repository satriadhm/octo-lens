"use client";

import type { App, BudgetResult } from "@/app/lib/types";
import { Badge } from "@/app/components/shared/Card";

interface BudgetCardProps {
  app: App;
  budget: BudgetResult;
  onSelect: (app: App) => void;
  selected: boolean;
}

export function BudgetCard({ app, budget, onSelect, selected }: BudgetCardProps) {
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
        background: selected
          ? `color-mix(in oklch, ${budget.levelColor} 10%, var(--color-surface))`
          : "var(--color-surface)",
        border: `1px solid ${selected ? `${budget.levelColor}55` : "var(--color-border)"}`,
      }}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <div className="text-xs font-semibold text-txt mb-0.5">{app.name}</div>
          <div className="text-[11px] text-txt-dim">
            {app.type} &middot; {app.team}
          </div>
        </div>
        <Badge
          color={budget.levelColor}
          bg={`color-mix(in oklch, ${budget.levelColor} 14%, transparent)`}
        >
          {budget.level}
        </Badge>
      </div>
      <div
        className="text-2xl font-display font-extrabold leading-none mb-1.5"
        style={{ color: budget.levelColor }}
      >
        {budget.pct}%
      </div>
      <div className="flex justify-between items-center">
        <div className="text-[11px] text-txt-muted">
          {budget.spent}M / {budget.total}M
        </div>
        <div
          className="text-[11px] font-medium"
          style={{ color: budget.levelColor }}
        >
          {budget.breach ? `Breach M${budget.breach.month}` : "On track"}
        </div>
      </div>
    </div>
  );
}
