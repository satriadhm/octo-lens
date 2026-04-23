"use client";

import type { ViewMode } from "@/app/lib/types";

interface HeaderProps {
  mode: ViewMode;
}

const VIEW_TITLES: Record<ViewMode, { title: string; subtitle: string }> = {
  executive: {
    title: "Executive Overview",
    subtitle: "Portfolio health · Budget · Risk signals",
  },
  ops: {
    title: "Operations Dashboard",
    subtitle: "Performance · Latency · API telemetry",
  },
  system: {
    title: "System Efficiency",
    subtitle: "Cost–usage fit · LensAI+ app briefings",
  },
};

export function Header({ mode }: HeaderProps) {
  const { title, subtitle } = VIEW_TITLES[mode];

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

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-ok animate-status-pulse" />
        <span className="text-[11px] text-txt-muted font-medium">LIVE</span>
      </div>
    </header>
  );
}
