"use client";

import type { ViewMode } from "@/app/lib/types";

interface HeaderProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

type Suite = "executive" | "operation";

const VIEW_TITLES: Record<ViewMode, { title: string; subtitle: string }> = {
  executive: {
    title: "Budget Monitoring",
    subtitle: "Portfolio health · Budget · Risk signals",
  },
  ops: {
    title: "Operation",
    subtitle: "Performance · Latency · API telemetry",
  },
  system: {
    title: "System Efficiency",
    subtitle: "Cost–usage fit · LensAI+ app briefings",
  },
};

export function Header({ mode, onModeChange }: HeaderProps) {
  const { title, subtitle } = VIEW_TITLES[mode];
  const suite: Suite = mode === "ops" ? "operation" : "executive";

  function setSuite(next: Suite) {
    if (next === suite) return;
    if (next === "operation") onModeChange("ops");
    else onModeChange("executive");
  }

  return (
    <header className="bg-surface border-b border-border px-6 py-3 flex items-center gap-4 shrink-0 min-h-[52px]">
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-display font-bold text-txt leading-none">
          {title}
        </h1>
        <p className="text-[11px] text-txt-dim mt-0.5 leading-none truncate">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="flex rounded-lg bg-surface-dim p-0.5 gap-0.5"
          role="tablist"
          aria-label="Primary area"
        >
          <button
            type="button"
            role="tab"
            aria-selected={suite === "executive"}
            onClick={() => setSuite("executive")}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-sans font-semibold leading-none transition-colors cursor-pointer border-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand/40 ${
              suite === "executive"
                ? "bg-surface text-brand shadow-sm"
                : "bg-transparent text-txt-muted hover:text-txt"
            }`}
          >
            Executive
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={suite === "operation"}
            onClick={() => setSuite("operation")}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-sans font-semibold leading-none transition-colors cursor-pointer border-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand/40 ${
              suite === "operation"
                ? "bg-surface text-brand shadow-sm"
                : "bg-transparent text-txt-muted hover:text-txt"
            }`}
          >
            Operation
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-ok animate-status-pulse" />
          <span className="text-[11px] text-txt-muted font-medium">LIVE</span>
        </div>
      </div>
    </header>
  );
}
