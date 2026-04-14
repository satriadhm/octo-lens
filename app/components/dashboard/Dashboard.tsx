"use client";

import { useState } from "react";
import type { App, ViewMode } from "@/app/lib/types";
import { APPS } from "@/app/lib/data";
import { calcROI, calcBudget } from "@/app/lib/calculators";
import { Header } from "@/app/components/layout/Header";
import { ExecutiveView } from "@/app/components/executive/ExecutiveView";
import { OpsView } from "@/app/components/ops/OpsView";
import { DetailDrawer } from "@/app/components/detail/DetailDrawer";

const enriched = APPS.map((app) => ({
  app,
  roi: calcROI(app),
  budget: calcBudget(app),
}));

export function Dashboard() {
  const [mode, setMode] = useState<ViewMode>("executive");
  const [selected, setSelected] = useState<App | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  function toggleMode(m: ViewMode) {
    if (m === mode) return;
    setTransitioning(true);
    setTimeout(() => {
      setMode(m);
      setTransitioning(false);
    }, 180);
  }

  const selectedEnriched = selected
    ? enriched.find((e) => e.app.id === selected.id)
    : null;

  return (
    <div className="bg-background min-h-screen text-txt flex flex-col font-sans">
      <Header mode={mode} onModeChange={toggleMode} />

      <div className="flex-1 overflow-hidden relative">
        <div
          className="h-full overflow-y-auto transition-opacity duration-[180ms] ease-in-out"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {mode === "executive" ? (
            <ExecutiveView
              enriched={enriched}
              onSelect={setSelected}
              selected={selected}
            />
          ) : (
            <OpsView enriched={enriched} onSelect={setSelected} />
          )}
        </div>

        {selected && selectedEnriched && (
          <>
            <div
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/25 z-[99] backdrop-blur-[2px]"
            />
            <DetailDrawer
              app={selected}
              roi={selectedEnriched.roi}
              budget={selectedEnriched.budget}
              onClose={() => setSelected(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
