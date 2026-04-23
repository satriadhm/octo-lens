"use client";

import { useState } from "react";
import type { App, EnrichedApp } from "@/app/lib/types";
import { Card, Label } from "@/app/components/shared/Card";
import { CostEfficiencyQuadrant } from "@/app/components/executive/CostEfficiencyQuadrant";
import { AISuggestPanel } from "@/app/components/executive/AISuggestPanel";
import { FeatureValueMatrix } from "@/app/components/executive/FeatureValueMatrix";
import { LENS_AGENT_NAME } from "@/app/lib/lensaiCopy";

interface SystemEfficiencyViewProps {
  enriched: EnrichedApp[];
}

export function SystemEfficiencyView({ enriched }: SystemEfficiencyViewProps) {
  const [quadrantApp, setQuadrantApp] = useState<App | null>(null);
  const apps = enriched.map((e) => e.app);

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full max-w-[1400px] mx-auto w-full">
      <div
        id="sys-overview"
        className="animate-fade-in-up relative z-[110] flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-display font-bold text-txt mb-1">
            System Efficiency
          </h1>
          <p className="text-sm text-txt-muted">
            Cost–usage fit across the portfolio &middot; {LENS_AGENT_NAME} app
            briefings
          </p>
        </div>
      </div>

      <section
        id="sys-quadrant"
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 animate-fade-in-up stagger-1"
      >
        <Card variant="bordered" className="!p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <Label>Cost Efficiency Quadrant</Label>
              <p className="text-[11px] text-txt-dim mt-0.5">
                Bubble = budget allocation · Click any app to run {LENS_AGENT_NAME}{" "}
                for an app briefing.
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

      <div id="sys-features" className="animate-fade-in-up stagger-2">
        <FeatureValueMatrix apps={apps} selectedApp={quadrantApp} />
      </div>
    </div>
  );
}
