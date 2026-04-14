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

export function ExecutiveView({
  enriched,
  onSelect,
  selected,
}: ExecutiveViewProps) {
  const portfolio = {
    total: enriched.length,
    healthy: enriched.filter((a) =>
      ["Excellent", "On Track"].includes(a.roi.label),
    ).length,
    atRisk: enriched.filter((a) => a.roi.label === "At Risk").length,
    critical: enriched.filter(
      (a) => a.roi.label === "Underperforming",
    ).length,
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

  const narrativeStatus =
    portfolio.critical > 0
      ? `${portfolio.critical} app${portfolio.critical > 1 ? "s" : ""} underperforming — needs immediate attention`
      : portfolio.atRisk > 0
        ? `${portfolio.atRisk} app${portfolio.atRisk > 1 ? "s" : ""} at risk — monitor closely`
        : "All applications performing within targets";

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full max-w-[1400px] mx-auto w-full">
      {/* Narrative headline */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-display font-bold text-txt mb-1">
          Portfolio Overview
        </h1>
        <p className="text-sm text-txt-muted">
          {portfolio.total} applications monitored &middot;{" "}
          <span
            className="font-medium"
            style={{
              color:
                portfolio.critical > 0
                  ? "var(--color-red)"
                  : portfolio.atRisk > 0
                    ? "var(--color-amber)"
                    : "var(--color-green)",
            }}
          >
            {narrativeStatus}
          </span>
        </p>
      </div>

      {/* KPI strip — 3 items with varied emphasis */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="bg-surface border border-border rounded-xl px-5 py-4">
          <Label>Healthy</Label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-ok">
              {portfolio.healthy}
            </span>
            <span className="text-sm text-txt-dim">of {portfolio.total}</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl px-5 py-4">
          <Label>At Risk</Label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-alert">
              {portfolio.atRisk}
            </span>
            {portfolio.budgetAlerts > 0 && (
              <span className="text-sm text-txt-dim">
                + {portfolio.budgetAlerts} budget alert
                {portfolio.budgetAlerts > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl px-5 py-4">
          <Label>Underperforming</Label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-danger">
              {portfolio.critical}
            </span>
            {portfolio.critical > 0 && (
              <span className="text-sm text-danger/70">action required</span>
            )}
          </div>
        </div>
      </div>

      {/* ROI Grid + Budget */}
      <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in-up stagger-2">
        <Card variant="bordered" className="!p-5">
          <Label>Portfolio ROI Heatmap</Label>
          <p className="text-xs text-txt-dim mb-3">
            Click any application for detailed breakdown
          </p>
          <div className="grid grid-cols-3 gap-3">
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

        <Card variant="bordered">
          <Label>Budget Health</Label>
          <div className="mt-3 flex flex-col gap-1">
            {enriched.map((e) => (
              <BudgetBar key={e.app.id} app={e.app} budget={e.budget} />
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Risks + AI Summary */}
      <div className="grid grid-cols-2 gap-5 animate-fade-in-up stagger-3">
        <Card variant="bordered">
          <Label color="var(--color-red)">Top Risks This Month</Label>
          <div className="mt-3 flex flex-col gap-2">
            {riskApps.map((e, i) => {
              const risks: { t: string; c: string }[] = [];
              if (e.roi.label === "Underperforming")
                risks.push({ t: "Negative ROI", c: "var(--color-red)" });
              if (e.roi.label === "At Risk")
                risks.push({ t: "Low ROI", c: "var(--color-orange)" });
              if (e.budget.level === "CRITICAL")
                risks.push({
                  t: "Budget critical",
                  c: "var(--color-red)",
                });
              if (e.budget.level === "WARNING")
                risks.push({
                  t: "Budget warning",
                  c: "var(--color-amber)",
                });
              if (e.app.ux.score < 50)
                risks.push({
                  t: `Poor UX (${e.app.ux.score})`,
                  c: "var(--color-orange)",
                });

              return (
                <div
                  key={i}
                  onClick={() => onSelect(e.app)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(e.app);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-surface-dim/60 border border-border rounded-lg px-4 py-2.5 cursor-pointer flex justify-between items-center transition-colors hover:border-brand/30 hover:bg-brand-light/30 focus-visible:outline-2 focus-visible:outline-brand/40"
                >
                  <span className="text-xs text-txt font-semibold">
                    {e.app.name}
                  </span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {risks.map((r, j) => (
                      <Pill
                        key={j}
                        label={r.t}
                        color={r.c}
                        bg={`color-mix(in oklch, ${r.c} 12%, transparent)`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="bordered">
          <AISummary enriched={enriched} />
        </Card>
      </div>
    </div>
  );
}
