"use client";

import { useState } from "react";
import type { App, EnrichedApp } from "@/app/lib/types";
import { Card, Label, Pill } from "@/app/components/shared/Card";
import { ExportMenu } from "@/app/components/shared/ExportMenu";
import { exportExecutiveCSV, exportExecutivePDF } from "@/app/lib/csv";
import { BudgetBar } from "./BudgetBar";
import { AISummary } from "./AISummary";
import { BudgetCard } from "./BudgetCard";
import { HeadlineInsight } from "./HeadlineInsight";
import { CostEfficiencyQuadrant } from "./CostEfficiencyQuadrant";
import { AISuggestPanel } from "./AISuggestPanel";
import { FeatureValueMatrix } from "./FeatureValueMatrix";
import { formatForPersona } from "@/app/lib/utils";

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
  const [quadrantApp, setQuadrantApp] = useState<App | null>(null);

  const portfolio = {
    total: enriched.length,
    healthy: enriched.filter((a) => a.budget.level === "SAFE").length,
    atRisk: enriched.filter((a) => a.budget.level === "WARNING").length,
    critical: enriched.filter((a) => a.budget.level === "CRITICAL").length,
    budgetAlerts: enriched.filter((a) => a.budget.level !== "SAFE").length,
  };

  const riskApps = enriched
    .filter(
      (e) =>
        e.budget.level !== "SAFE" || e.app.metrics.responseMs > 700,
    )
    .slice(0, 4);

  const narrativeStatus =
    portfolio.critical > 0
      ? `${portfolio.critical} app${portfolio.critical > 1 ? "s" : ""} in critical budget state — needs immediate attention`
      : portfolio.atRisk > 0
        ? `${portfolio.atRisk} app${portfolio.atRisk > 1 ? "s" : ""} at risk based on budget`
        : "All applications remain within budget health targets";

  const apps = enriched.map((e) => e.app);
  const avgResponseMs = Math.round(
    enriched.reduce((sum, e) => sum + e.app.metrics.responseMs, 0) /
      Math.max(1, enriched.length),
  );
  const avgErrorRate =
    enriched.reduce((sum, e) => sum + (e.app.metrics.errorRate ?? 0), 0) /
    Math.max(1, enriched.length);

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full max-w-[1400px] mx-auto w-full">
      {/* Narrative */}
      <div
        id="exec-overview"
        className="animate-fade-in-up relative z-[110] flex items-start justify-between gap-4"
      >
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
          <p className="text-xs text-txt-dim mt-1">
            {formatForPersona(
              { kind: "responseMs", value: avgResponseMs },
              "business",
            )}{" "}
            &middot;{" "}
            {formatForPersona(
              { kind: "errorRate", value: avgErrorRate },
              "business",
            )}
          </p>
        </div>
        <ExportMenu
          onExportCSV={() => exportExecutiveCSV(enriched)}
          onExportPDF={() => exportExecutivePDF(enriched)}
        />
      </div>

      {/* SECTION 1 — Headline Insight Bar */}
      <div className="animate-fade-in-up stagger-1">
        <HeadlineInsight enriched={enriched} />
      </div>

      {/* SECTION 2 — Cost Efficiency Quadrant + AI Suggest Panel */}
      <section
        id="exec-quadrant"
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 animate-fade-in-up stagger-2"
      >
        <Card variant="bordered" className="!p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <Label>Cost Efficiency Quadrant</Label>
              <p className="text-[11px] text-txt-dim mt-0.5">
                Bubble = budget allocation · Click any app to get AI suggestions
              </p>
            </div>
            {quadrantApp && (
              <button
                type="button"
                onClick={() => setQuadrantApp(null)}
                className="h-10 px-3 text-[11px] text-txt-muted border border-border rounded hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
              >
                Clear selection
              </button>
            )}
          </div>
          <CostEfficiencyQuadrant
            apps={apps}
            selectedId={quadrantApp?.id}
            onSelect={(a) =>
              setQuadrantApp(quadrantApp?.id === a.id ? null : a)
            }
          />
        </Card>

        <AISuggestPanel app={quadrantApp} />
      </section>

      {/* SECTION 3 — Portfolio Budget + Budget Health */}
      <div
        id="exec-budget"
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 animate-fade-in-up stagger-3"
      >
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

      {/* SECTION 4 — Top Risks + AI Summary */}
      <div
        id="exec-risks"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up stagger-4"
      >
        <Card variant="bordered">
          <Label color="var(--color-red)">Top Risks This Month</Label>
          <div className="mt-3 flex flex-col gap-2">
            {riskApps.map((e, i) => {
              const risks: { t: string; c: string }[] = [];
              if (e.budget.level === "CRITICAL")
                risks.push({ t: "Budget critical", c: "var(--color-red)" });
              if (e.budget.level === "WARNING")
                risks.push({ t: "Budget warning", c: "var(--color-amber)" });
              if (e.app.metrics.responseMs > 700)
                risks.push({
                  t: `Slow response (${e.app.metrics.responseMs}ms)`,
                  c: "var(--color-red)",
                });
              if ((e.app.metrics.errorRate ?? 0) > 2)
                risks.push({
                  t: `Error rate ${(e.app.metrics.errorRate ?? 0).toFixed(1)}%`,
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

      {/* SECTION 5 — Feature Value Matrix (moved to bottom) */}
      <div id="exec-features" className="animate-fade-in-up stagger-5">
        <FeatureValueMatrix apps={apps} selectedApp={quadrantApp} />
      </div>
    </div>
  );
}
