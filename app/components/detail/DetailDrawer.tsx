"use client";

import { useState } from "react";
import type { App, ROIResult, BudgetResult } from "@/app/lib/types";
import { Badge, Pill } from "@/app/components/shared/Card";
import { OverviewTab } from "./OverviewTab";
import { BudgetTab } from "./BudgetTab";
import { UXTab } from "./UXTab";
import { FeaturesTab } from "./FeaturesTab";

interface DetailDrawerProps {
  app: App;
  roi: ROIResult;
  budget: BudgetResult;
  onClose: () => void;
}

const TABS = ["overview", "budget", "ux", "features"] as const;
type TabId = (typeof TABS)[number];

export function DetailDrawer({ app, roi, budget, onClose }: DetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const uxColor = app.ux.score >= 70 ? "#059669" : app.ux.score >= 50 ? "#D97706" : "#DC2626";

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[440px] bg-surface border-l-2 border-border flex flex-col z-[100] shadow-[-4px_0_24px_rgba(0,0,0,0.10)] animate-slide-in">
      {/* Drawer header */}
      <div
        className="px-[18px] py-3.5 border-b border-border flex justify-between items-start bg-brand-light"
        style={{ borderTop: "3px solid #CC1122" }}
      >
        <div>
          <div className="text-[15px] font-bold text-txt mb-1">{app.name}</div>
          <div className="flex gap-1.5">
            <Badge color={roi.color} bg={roi.bg}>
              {roi.label}
            </Badge>
            <Pill
              label={budget.level}
              color={budget.levelColor}
              bg={budget.levelColor + "18"}
            />
            <Pill label={`UX ${app.ux.score}`} color={uxColor} bg={uxColor + "18"} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-surface-dim border border-border text-txt-muted cursor-pointer text-base leading-none px-2 py-1 rounded-md font-bold hover:bg-border transition-colors"
        >
          &#10005;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-surface">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 bg-transparent border-none py-2.5 px-1 cursor-pointer text-[10px] font-mono tracking-[0.06em] capitalize transition-colors ${
              tab === t
                ? "text-brand font-bold border-b-[3px] border-b-brand"
                : "text-txt-muted font-normal border-b-[3px] border-b-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {tab === "overview" && <OverviewTab app={app} roi={roi} />}
        {tab === "budget" && <BudgetTab budget={budget} />}
        {tab === "ux" && <UXTab app={app} />}
        {tab === "features" && <FeaturesTab app={app} />}
      </div>
    </div>
  );
}
