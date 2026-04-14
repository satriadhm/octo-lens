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
    <div className="bg-surface border-b border-border px-5 py-2.5 flex items-center gap-4 shrink-0 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2.5">
        <OctoLensLogo size={32} />
        <div
          className="w-px h-6"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-brand-mid), transparent)",
          }}
        />
        <span className="text-[9px] text-txt-dim font-mono tracking-[0.12em] uppercase leading-tight">
          Business
          <br />
          Observability
        </span>
      </div>

      <div className="flex-1" />

      <div className="bg-surface-dim rounded-[10px] p-[3px] flex gap-0.5 border border-border">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={`border-none rounded-[7px] px-4 py-1.5 cursor-pointer text-[11px] font-sans transition-all duration-150 ${
              mode === id
                ? "text-white font-bold shadow-[0_2px_6px_rgba(204,17,34,0.30)]"
                : "text-txt-muted bg-transparent font-normal"
            }`}
            style={
              mode === id
                ? { background: "linear-gradient(135deg, #CC1122, #E02020)" }
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full bg-ok shadow-[0_0_0_2px_rgba(5,150,105,0.19)] animate-live-pulse"
        />
        <span className="text-[10px] text-txt-muted font-mono font-semibold">LIVE</span>
      </div>

      <div className="text-[10px] text-txt-dim font-mono bg-surface-dim px-2 py-1 rounded-md border border-border">
        {new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
