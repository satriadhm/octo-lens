"use client";

import type { App, EnrichedApp } from "@/app/lib/types";
import { Card, Label, Pill } from "@/app/components/shared/Card";
import { ROICard } from "./ROICard";
import { BudgetBar } from "./BudgetBar";
import { AISummary } from "./AISummary";

interface ExecutiveViewProps {
  enriched: EnrichedApp[];
  onSelect: (app: App) => void;
  selected: App | null;
}

const KPI_DEFS = [
  { key: "total", l: "TOTAL APP", c: "#CC1122" },
  { key: "healthy", l: "SEHAT", c: "#059669" },
  { key: "atRisk", l: "AT RISK", c: "#EA580C" },
  { key: "critical", l: "UNDERPERFORM", c: "#DC2626" },
  { key: "budgetAlerts", l: "BUDGET ALERT", c: "#D97706" },
] as const;

export function ExecutiveView({ enriched, onSelect, selected }: ExecutiveViewProps) {
  const portfolio = {
    total: enriched.length,
    healthy: enriched.filter((a) => ["Excellent", "On Track"].includes(a.roi.label)).length,
    atRisk: enriched.filter((a) => a.roi.label === "At Risk").length,
    critical: enriched.filter((a) => a.roi.label === "Underperforming").length,
    budgetAlerts: enriched.filter((a) => a.budget.level !== "SAFE").length,
  };

  const riskApps = enriched
    .filter(
      (e) =>
        e.roi.label !== "Excellent" ||
        e.budget.level !== "SAFE" ||
        e.app.ux.score < 50,
    )
    .slice(0, 4);

  return (
    <div className="p-5 flex flex-col gap-4 overflow-y-auto h-full">
      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-2.5">
        {KPI_DEFS.map((k) => (
          <div
            key={k.key}
            className="bg-surface rounded-[10px] px-3.5 py-3 border border-border shadow-sm"
            style={{ borderTop: `3px solid ${k.c}` }}
          >
            <Label color={k.c}>{k.l}</Label>
            <div
              className="text-[28px] font-extrabold font-mono"
              style={{ color: k.c }}
            >
              {portfolio[k.key]}
            </div>
          </div>
        ))}
      </div>

      {/* ROI Grid + Budget */}
      <div className="grid grid-cols-[1fr_300px] gap-3.5">
        <Card className="!p-3.5">
          <Label>PORTFOLIO ROI HEATMAP — klik untuk detail</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[...enriched]
              .sort((a, b) => b.roi.pct - a.roi.pct)
              .map((e) => (
                <ROICard
                  key={e.app.id}
                  app={e.app}
                  roi={e.roi}
                  onSelect={onSelect}
                  selected={selected?.id === e.app.id}
                />
              ))}
          </div>
        </Card>

        <Card>
          <Label>BUDGET HEALTH</Label>
          <div className="mt-2">
            {enriched.map((e) => (
              <BudgetBar key={e.app.id} app={e.app} budget={e.budget} />
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Risks + AI Summary */}
      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <Label color="#DC2626">TOP RISIKO BULAN INI</Label>
          <div className="mt-2.5 flex flex-col gap-2">
            {riskApps.map((e, i) => {
              const risks: { t: string; c: string }[] = [];
              if (e.roi.label === "Underperforming")
                risks.push({ t: "ROI negatif", c: "#DC2626" });
              if (e.roi.label === "At Risk")
                risks.push({ t: "ROI rendah", c: "#EA580C" });
              if (e.budget.level === "CRITICAL")
                risks.push({ t: "Budget kritis", c: "#DC2626" });
              if (e.budget.level === "WARNING")
                risks.push({ t: "Budget warning", c: "#D97706" });
              if (e.app.ux.score < 50)
                risks.push({ t: `UX buruk (${e.app.ux.score})`, c: "#EA580C" });

              return (
                <div
                  key={i}
                  onClick={() => onSelect(e.app)}
                  className="bg-surface-dim border border-border rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center transition-colors hover:border-brand"
                >
                  <span className="text-xs text-txt font-semibold">
                    {e.app.name}
                  </span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {risks.map((r, j) => (
                      <Pill
                        key={j}
                        label={r.t}
                        color={r.c}
                        bg={r.c + "18"}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <AISummary enriched={enriched} />
        </Card>
      </div>
    </div>
  );
}
