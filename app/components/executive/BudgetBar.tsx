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
        <span className="text-[11px] text-txt font-medium">{app.name}</span>
        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] text-txt-muted">
            {budget.spent}M / {budget.total}M
          </span>
          <Pill
            label={budget.level}
            color={budget.levelColor}
            bg={budget.levelColor + "18"}
          />
        </div>
      </div>
      <div className="bg-surface-dim rounded h-[7px] overflow-hidden">
        <div
          className="h-full rounded transition-[width] duration-500 ease-out"
          style={{
            background: `linear-gradient(90deg, ${budget.levelColor}cc, ${budget.levelColor})`,
            width: `${pct}%`,
          }}
        />
      </div>
      {budget.breach && (
        <div
          className="text-[9px] mt-0.5 font-mono"
          style={{ color: budget.levelColor }}
        >
          &#9888; Prediksi melewati budget di bulan {budget.breach.month}
        </div>
      )}
    </div>
  );
}
