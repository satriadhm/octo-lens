"use client";

import type { App, EnrichedApp } from "@/app/lib/types";
import { Card, Label, Pill } from "@/app/components/shared/Card";
import { ExportMenu } from "@/app/components/shared/ExportMenu";
import { exportExecutiveCSV, exportExecutivePDF } from "@/app/lib/csv";
import { BudgetBar } from "./BudgetBar";
import { AISummary } from "./AISummary";
import { BudgetCard } from "./BudgetCard";

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
  function adoptionColor(adoption: number) {
    if (adoption >= 30) return "var(--color-green)";
    if (adoption >= 10) return "var(--color-amber)";
    if (adoption >= 2) return "var(--color-orange)";
    return "var(--color-red)";
  }

  function uxColor(score: number) {
    if (score >= 70) return "var(--color-green)";
    if (score >= 50) return "var(--color-amber)";
    return "var(--color-red)";
  }

  const portfolio = {
    total: enriched.length,
    healthy: enriched.filter(
      (a) => a.budget.level === "SAFE" && a.app.ux.score >= 50,
    ).length,
    atRisk: enriched.filter(
      (a) => a.budget.level === "WARNING" || a.app.ux.score < 50,
    ).length,
    critical: enriched.filter((a) => a.budget.level === "CRITICAL").length,
    budgetAlerts: enriched.filter((a) => a.budget.level !== "SAFE").length,
  };

  const riskApps = enriched
    .filter(
      (e) =>
        e.budget.level !== "SAFE" ||
        e.app.ux.score < 50 ||
        e.app.metrics.responseMs > 700,
    )
    .slice(0, 4);

  const lowAdoption = enriched
    .flatMap((entry) =>
      entry.app.api.endpoints.map((endpoint) => ({
        app: entry.app,
        endpoint,
      })),
    )
    .filter((entry) => entry.endpoint.adoption < 10)
    .sort((a, b) => a.endpoint.adoption - b.endpoint.adoption);

  const featureHotspots =
    lowAdoption.length > 0
      ? lowAdoption.slice(0, 6)
      : enriched
          .flatMap((entry) =>
            entry.app.api.endpoints.map((endpoint) => ({
              app: entry.app,
              endpoint,
            })),
          )
          .sort((a, b) => b.endpoint.calls - a.endpoint.calls)
          .slice(0, 5);

  const narrativeStatus =
    portfolio.critical > 0
      ? `${portfolio.critical} app${portfolio.critical > 1 ? "s" : ""} in critical budget state — needs immediate attention`
      : portfolio.atRisk > 0
        ? `${portfolio.atRisk} app${portfolio.atRisk > 1 ? "s" : ""} at risk based on budget or UX`
        : "All applications remain within budget health targets";

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full max-w-[1400px] mx-auto w-full">
      {/* Narrative headline */}
      <div className="animate-fade-in-up relative z-[110] flex items-start justify-between gap-4">
        <div>
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
        <ExportMenu
          onExportCSV={() => exportExecutiveCSV(enriched)}
          onExportPDF={() => exportExecutivePDF(enriched)}
        />
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

      {/* Budget overview grid */}
      <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in-up stagger-2">
        <Card variant="bordered" className="!p-5">
          <Label>Portfolio Budget Health</Label>
          <p className="text-xs text-txt-dim mb-3">
            Click any application for detailed breakdown
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[...enriched]
              .sort((a, b) => b.budget.pct - a.budget.pct)
              .map((e) => (
                <BudgetCard
                  key={e.app.id}
                  app={e.app}
                  budget={e.budget}
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
              if (e.app.metrics.responseMs > 700)
                risks.push({
                  t: `Slow response (${e.app.metrics.responseMs}ms)`,
                  c: "var(--color-red)",
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

      <div className="grid grid-cols-2 gap-5 animate-fade-in-up stagger-4">
        <Card variant="bordered">
          <Label>UX Health Across Portfolio</Label>
          <div className="mt-3 flex flex-col gap-2.5">
            {[...enriched]
              .sort((a, b) => a.app.ux.score - b.app.ux.score)
              .map((entry) => (
                <div
                  key={entry.app.id}
                  onClick={() => onSelect(entry.app)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(entry.app);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="flex gap-3 items-center cursor-pointer group rounded focus-visible:outline-2 focus-visible:outline-brand/40"
                >
                  <span className="text-xs text-txt font-medium min-w-[120px] group-hover:text-brand transition-colors">
                    {entry.app.shortName}
                  </span>
                  <div className="flex-1 bg-surface-dim rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        background: uxColor(entry.app.ux.score),
                        width: `${entry.app.ux.score}%`,
                        opacity: 0.75,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold min-w-[34px] text-right tabular-nums"
                    style={{ color: uxColor(entry.app.ux.score) }}
                  >
                    {entry.app.ux.score}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card variant="bordered">
          <Label>Feature Adoption Hotspots</Label>
          <div className="mt-3 flex flex-col gap-2">
            {featureHotspots.map(({ app, endpoint }, index) => {
              const color = adoptionColor(endpoint.adoption);
              return (
                <div
                  key={`${app.id}-${endpoint.path}-${index}`}
                  onClick={() => onSelect(app)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(app);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-surface-dim/60 border border-border rounded-lg px-3.5 py-2.5 cursor-pointer transition-colors hover:border-brand/30 hover:bg-brand-light/30 focus-visible:outline-2 focus-visible:outline-brand/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-txt-dim truncate">
                        {app.name}
                      </div>
                      <code className="text-[11px] text-txt">{endpoint.path}</code>
                    </div>
                    <Pill
                      label={`${endpoint.adoption}%`}
                      color={color}
                      bg={`color-mix(in oklch, ${color} 12%, transparent)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
