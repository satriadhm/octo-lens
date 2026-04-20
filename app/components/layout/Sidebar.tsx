"use client";

import { useState } from "react";
import type { ViewMode } from "@/app/lib/types";
import { OctoLensLogo } from "./OctoLensLogo";

interface SidebarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const NAV_ITEMS: { id: ViewMode; label: string; icon: string; description: string }[] = [
  {
    id: "executive",
    label: "Executive",
    icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
    description: "Portfolio & budget overview",
  },
  {
    id: "ops",
    label: "Operations",
    icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,11 6,6 9,9 14,3"/><circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    description: "Performance & latency metrics",
  },
];

export function Sidebar({ mode, onModeChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex-shrink-0 bg-surface border-r border-border flex flex-col transition-[width] duration-200 ease-in-out h-full"
      style={{ width: collapsed ? 56 : 220 }}
    >
      {/* Logo area */}
      <div className="px-3.5 py-3.5 border-b border-border flex items-center gap-2.5 min-h-[52px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <OctoLensLogo size={28} />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <OctoLensLogo size={20} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2" role="navigation" aria-label="Dashboard sections">
        {NAV_ITEMS.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModeChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 my-0.5 mx-1 rounded-lg cursor-pointer border-none transition-all duration-150 text-left focus-visible:outline-2 focus-visible:outline-brand/40 ${
                isActive
                  ? "bg-brand-light text-brand font-semibold"
                  : "bg-transparent text-txt-muted hover:bg-surface-dim hover:text-txt"
              }`}
              style={{ width: collapsed ? 40 : "calc(100% - 8px)" }}
              type="button"
            >
              <span
                className="flex-shrink-0 w-4 h-4"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              {!collapsed && (
                <span className="text-[12.5px] font-sans leading-none truncate">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 animate-status-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider + status */}
      <div className="border-t border-border px-3.5 py-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-ok animate-status-pulse flex-shrink-0" />
        {!collapsed && (
          <span className="text-[11px] text-txt-muted font-medium">Live</span>
        )}
        {!collapsed && (
          <time className="ml-auto text-[10px] text-txt-dim font-mono">
            {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
          </time>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        type="button"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="border-t border-border px-3.5 py-2.5 flex items-center justify-center gap-2 text-txt-dim hover:text-txt hover:bg-surface-dim transition-colors cursor-pointer bg-transparent border-x-0 border-b-0 focus-visible:outline-2 focus-visible:outline-brand/40"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="10,3 4,8 10,13" />
        </svg>
        {!collapsed && (
          <span className="text-[11px] font-sans">Collapse</span>
        )}
      </button>
    </aside>
  );
}
