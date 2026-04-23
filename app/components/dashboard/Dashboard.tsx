"use client";

import { useState, useEffect } from "react";
import type { App, ViewMode } from "@/app/lib/types";
import { APPS } from "@/app/lib/data";
import { calcBudget } from "@/app/lib/calculators";
import { Header } from "@/app/components/layout/Header";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { ExecutiveView } from "@/app/components/executive/ExecutiveView";
import { SystemEfficiencyView } from "@/app/components/system-efficiency/SystemEfficiencyView";
import { OpsView } from "@/app/components/ops/OpsView";
import { DetailDrawer } from "@/app/components/detail/DetailDrawer";

const enriched = APPS.map((app) => ({
  app,
  budget: calcBudget(app),
}));

export function Dashboard() {
  const [mode, setMode] = useState<ViewMode>("executive");
  const [selected, setSelected] = useState<App | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

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
    <div className="bg-background h-screen text-txt flex flex-col font-sans overflow-hidden">
      {/* Outer shell: sidebar + main column */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar mode={mode} onModeChange={toggleMode} />

        {/* Main column: header + scrollable content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header mode={mode} />

          <main className="flex-1 overflow-hidden relative">
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
              ) : mode === "system" ? (
                <SystemEfficiencyView enriched={enriched} />
              ) : (
                <OpsView enriched={enriched} onSelect={setSelected} />
              )}
            </div>

            {selected && selectedEnriched && (
              <>
                <div
                  onClick={() => setSelected(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSelected(null);
                  }}
                  role="presentation"
                  className="fixed inset-0 bg-foreground/10 z-[99] backdrop-blur-[1px] transition-opacity"
                />
                <DetailDrawer
                  app={selected}
                  budget={selectedEnriched.budget}
                  onClose={() => setSelected(null)}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
