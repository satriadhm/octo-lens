"use client";

import type { App, BudgetResult } from "@/app/lib/types";
import { Pill } from "@/app/components/shared/Card";

interface BudgetBarProps {
  app: App;
  budget: BudgetResult;
}

export function BudgetBar({ app, budget }: BudgetBarProps) {
  const pct = Math.min(100, Math.round((budget.spent / budget.total) * 100));

  return (
    <div className="mb-2.5">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-txt font-medium">{app.name}</span>
        <div className="flex gap-1.5 items-center">
          <span className="text-[11px] text-txt-muted font-mono tabular-nums">
            {budget.spent}M / {budget.total}M
          </span>
          <Pill
            label={budget.level}
            color={budget.levelColor}
            bg={`color-mix(in oklch, ${budget.levelColor} 10%, transparent)`}
          />
        </div>
      </div>
      <div className="bg-surface-dim rounded-full h-[6px] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            background: budget.levelColor,
            width: `${pct}%`,
            opacity: 0.8,
          }}
        />
      </div>
      {budget.breach && (
        <div
          className="text-[11px] mt-1 font-medium"
          style={{ color: budget.levelColor }}
        >
          Projected to exceed budget in month {budget.breach.month}
        </div>
      )}
    </div>
  );
}
