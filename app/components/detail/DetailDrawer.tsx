"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { App, BudgetResult } from "@/app/lib/types";
import { Pill } from "@/app/components/shared/Card";
import { OverviewTab } from "./OverviewTab";
import { BudgetTab } from "./BudgetTab";
import { FeaturesTab } from "./FeaturesTab";

interface DetailDrawerProps {
  app: App;
  budget: BudgetResult;
  onClose: () => void;
}

const TABS = ["overview", "budget", "features"] as const;
type TabId = (typeof TABS)[number];

export function DetailDrawer({ app, budget, onClose }: DetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={drawerRef}
      tabIndex={-1}
      role="dialog"
      aria-label={`${app.name} details`}
      className="fixed top-0 right-0 bottom-0 w-[460px] bg-surface border-l border-border flex flex-col z-[100] shadow-[-4px_0_20px_rgba(0,0,0,0.06)] animate-slide-in outline-none"
    >
      {/* Drawer header */}
      <div className="px-5 py-4 border-b border-border flex justify-between items-start bg-surface">
        <div>
          <h2 className="text-base font-display font-bold text-txt mb-1.5">
            {app.name}
          </h2>
          <div className="flex gap-1.5">
            <Pill
              label={budget.level}
              color={budget.levelColor}
              bg={`color-mix(in oklch, ${budget.levelColor} 10%, transparent)`}
            />
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="bg-surface-dim border border-border text-txt-muted cursor-pointer text-sm leading-none px-2 py-1 rounded-md font-medium hover:bg-border transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
        >
          &#10005;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-surface" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            className={`flex-1 bg-transparent border-none py-3 px-1 cursor-pointer text-[11px] font-display font-medium tracking-[0.04em] capitalize transition-colors ${
              tab === t
                ? "text-brand border-b-2 border-b-brand"
                : "text-txt-muted border-b-2 border-b-transparent hover:text-txt"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 bg-background">
        {tab === "overview" && <OverviewTab app={app} />}
        {tab === "budget" && <BudgetTab budget={budget} />}
        {tab === "features" && <FeaturesTab app={app} />}
      </div>
    </div>
  );
}
