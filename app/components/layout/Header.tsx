"use client";

import type { ViewMode } from "@/app/lib/types";
import { OctoLensLogo } from "./OctoLensLogo";

interface HeaderProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const MODES: { id: ViewMode; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "ops", label: "Ops & Engineering" },
];

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-border px-6 py-3 flex items-center gap-5 shrink-0">
      <div className="flex items-center gap-3">
        <OctoLensLogo size={32} />
        <div className="w-px h-5 bg-border" />
        <span className="text-[11px] text-txt-dim font-display font-medium tracking-[0.04em] uppercase leading-tight">
          Business
          <br />
          Observability
        </span>
      </div>

      <div className="flex-1" />

      <nav
        className="bg-surface-dim rounded-lg p-[3px] flex gap-0.5 border border-border"
        role="tablist"
        aria-label="Dashboard view"
      >
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            role="tab"
            aria-selected={mode === id}
            className={`border-none rounded-md px-4 py-1.5 cursor-pointer text-[12px] font-sans transition-all duration-150 ${
              mode === id
                ? "text-surface font-semibold bg-brand shadow-sm"
                : "text-txt-muted bg-transparent font-normal hover:text-txt"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-ok animate-status-pulse" />
        <span className="text-[11px] text-txt-muted font-medium">LIVE</span>
      </div>

      <time className="text-[11px] text-txt-dim font-sans bg-surface-dim px-2.5 py-1 rounded-md border border-border">
        {new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </time>
    </header>
  );
}
