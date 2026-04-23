"use client";

import { useState, useCallback } from "react";
import type { ViewMode } from "@/app/lib/types";
import { OctoLensLogo } from "./OctoLensLogo";

interface SidebarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  /** Fires before section scroll; use to switch in-view tabs (e.g. Executive). */
  onSubItemClick?: (sectionId: string) => void;
}

interface SubItem {
  id: string;
  label: string;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: string;
  subItems: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "executive",
    label: "Executive",
    icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
    subItems: [
      { id: "exec-overview", label: "Portfolio Overview" },
      { id: "exec-system-efficiency", label: "System Efficiency" },
      { id: "exec-kpis", label: "KPI Summary" },
      { id: "exec-budget", label: "Budget Health" },
      { id: "exec-risks", label: "Top Risks" },
      { id: "exec-features", label: "Features & adoption" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,11 6,6 9,9 14,3"/><circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    subItems: [
      { id: "ops-kpis", label: "KPI Strip" },
      { id: "ops-service-health", label: "Service Health" },
      { id: "ops-app-status", label: "App Status" },
      { id: "ops-latency", label: "Latency Hotspots" },
      { id: "ops-traffic", label: "Traffic Patterns" },
      { id: "ops-slow-ops", label: "Slow Operations" },
      { id: "ops-usage", label: "Usage & Consumers" },
    ],
  },
];

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  // Find the scrollable parent (first ancestor with overflow-y: auto or scroll)
  let container: HTMLElement | null = el.parentElement;
  while (container && container !== document.body) {
    const overflow = window.getComputedStyle(container).overflowY;
    if (overflow === "auto" || overflow === "scroll") break;
    container = container.parentElement;
  }

  if (container) {
    const containerTop = container.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const offset = elTop - containerTop - 16; // 16px breathing room
    container.scrollBy({ top: offset, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Sidebar({
  mode,
  onModeChange,
  onSubItemClick,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  const handleTopNav = useCallback(
    (id: ViewMode) => {
      if (id !== mode) {
        onModeChange(id);
        setActiveSubItem(null);
      }
    },
    [mode, onModeChange],
  );

  const handleSubItem = useCallback(
    (subId: string) => {
      setActiveSubItem(subId);
      onSubItemClick?.(subId);
      const doScroll = () => scrollToSection(subId);
      if (onSubItemClick) {
        window.setTimeout(doScroll, 120);
      } else {
        doScroll();
      }
    },
    [onSubItemClick],
  );

  const activeNav = NAV_ITEMS.find((n) => n.id === mode)!;

  return (
    <aside
      className="flex-shrink-0 bg-surface border-r border-border flex flex-col transition-[width] duration-200 ease-in-out h-full"
      style={{ width: collapsed ? 56 : 220 }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-3.5 py-3.5 border-b border-border flex items-center gap-2.5 min-h-[52px]">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <OctoLensLogo size={20} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <OctoLensLogo size={28} />
          </div>
        )}
      </div>

      {/* ── Top-level nav ────────────────────────────────── */}
      <nav
        className="pt-2 pb-1 border-b border-border"
        role="navigation"
        aria-label="Dashboard views"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTopNav(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              type="button"
              className={`flex items-center gap-3 my-0.5 mx-1.5 px-3 py-2.5 rounded-lg cursor-pointer border-none transition-all duration-150 text-left focus-visible:outline-2 focus-visible:outline-brand/40 ${
                isActive
                  ? "bg-brand-light text-brand font-semibold"
                  : "bg-transparent text-txt-muted hover:bg-surface-dim hover:text-txt"
              }`}
              style={{ width: collapsed ? 40 : "calc(100% - 12px)" }}
            >
              <span
                className="flex-shrink-0 w-4 h-4"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              {!collapsed && (
                <span className="text-[12.5px] font-sans leading-none truncate flex-1">
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

      {/* ── Sub-navigation (only when expanded) ─────────── */}
      {!collapsed && (
        <nav
          className="flex-1 overflow-y-auto py-2"
          role="navigation"
          aria-label={`${activeNav.label} sections`}
        >
          {/* Section group label */}
          <div className="px-4 pb-1.5 pt-1">
            <span className="text-[10px] font-display font-semibold uppercase tracking-[0.08em] text-txt-dim">
              {activeNav.label}
            </span>
          </div>

          {activeNav.subItems.map((sub) => {
            const isSubActive = activeSubItem === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubItem(sub.id)}
                type="button"
                className={`w-full flex items-center gap-2.5 pl-5 pr-3 py-2 text-left cursor-pointer border-none transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand/40 rounded-md mx-1.5 ${
                  isSubActive
                    ? "text-brand bg-brand-light/60 font-medium"
                    : "text-txt-dim hover:text-txt hover:bg-surface-dim bg-transparent"
                }`}
                style={{ width: "calc(100% - 12px)" }}
              >
                {/* Vertical connector dot */}
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors ${
                    isSubActive ? "bg-brand" : "bg-border"
                  }`}
                />
                <span className="text-[12px] font-sans leading-snug truncate">
                  {sub.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Spacer when collapsed (sub-nav is hidden) */}
      {collapsed && <div className="flex-1" />}

      {/* ── Status bar ───────────────────────────────────── */}
      <div className="border-t border-border px-3.5 py-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-ok animate-status-pulse flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-[11px] text-txt-muted font-medium">Live</span>
            <time className="ml-auto text-[10px] text-txt-dim font-mono">
              {new Date().toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              })}
            </time>
          </>
        )}
      </div>

      {/* ── Collapse toggle ──────────────────────────────── */}
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
        {!collapsed && <span className="text-[11px] font-sans">Collapse</span>}
      </button>
    </aside>
  );
}
