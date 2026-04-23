"use client";

import { useState, useCallback, useMemo } from "react";
import type { ViewMode } from "@/app/lib/types";
import { OctoLensLogo } from "./OctoLensLogo";

interface SidebarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

interface SubItem {
  id: string;
  label: string;
}

interface ExecArea {
  id: Extract<ViewMode, "executive" | "system">;
  label: string;
  icon: string;
  subItems: SubItem[];
}

const ICON_BUDGET = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`;

const ICON_SYSTEM = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2.5M8 12.5V15M15 8h-2.5M3.5 8H1M13.2 2.8l-1.8 1.8M4.6 11.4l-1.8 1.8M13.2 13.2l-1.8-1.8M4.6 4.6L2.8 2.8"/></svg>`;

const ICON_OPS = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,11 6,6 9,9 14,3"/><circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>`;

const EXEC_AREAS: ExecArea[] = [
  {
    id: "executive",
    label: "Budget Monitoring",
    icon: ICON_BUDGET,
    subItems: [
      { id: "exec-overview", label: "Portfolio Overview" },
      { id: "exec-kpis", label: "KPI Summary" },
      { id: "exec-budget", label: "Budget Health" },
      { id: "exec-risks", label: "Top Risks" },
    ],
  },
  {
    id: "system",
    label: "System Efficiency",
    icon: ICON_SYSTEM,
    subItems: [
      { id: "sys-overview", label: "Overview" },
      { id: "sys-quadrant", label: "Cost efficiency quadrant" },
      { id: "sys-features", label: "Feature value matrix" },
    ],
  },
];

const OPS_SUB_ITEMS: SubItem[] = [
  { id: "ops-kpis", label: "KPI Strip" },
  { id: "ops-service-health", label: "Service Health" },
  { id: "ops-app-status", label: "App Status" },
  { id: "ops-latency", label: "Latency Hotspots" },
  { id: "ops-traffic", label: "Traffic Patterns" },
  { id: "ops-slow-ops", label: "Slow Operations" },
  { id: "ops-usage", label: "Usage & Consumers" },
];

type Suite = "executive" | "operation";

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  let container: HTMLElement | null = el.parentElement;
  while (container && container !== document.body) {
    const overflow = window.getComputedStyle(container).overflowY;
    if (overflow === "auto" || overflow === "scroll") break;
    container = container.parentElement;
  }

  if (container) {
    const containerTop = container.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const offset = elTop - containerTop - 16;
    container.scrollBy({ top: offset, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Sidebar({ mode, onModeChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  const suite: Suite = mode === "ops" ? "operation" : "executive";

  const activeExecArea = useMemo(
    () => EXEC_AREAS.find((a) => a.id === mode) ?? EXEC_AREAS[0],
    [mode],
  );

  const subNavContext = useMemo(() => {
    if (mode === "ops") {
      return { sectionLabel: "Operation", subItems: OPS_SUB_ITEMS };
    }
    return {
      sectionLabel: activeExecArea.label,
      subItems: activeExecArea.subItems,
    };
  }, [mode, activeExecArea]);

  const handleExecArea = useCallback(
    (id: Extract<ViewMode, "executive" | "system">) => {
      if (id !== mode) {
        onModeChange(id);
        setActiveSubItem(null);
      }
    },
    [mode, onModeChange],
  );

  const handleSubItem = useCallback((subId: string) => {
    setActiveSubItem(subId);
    scrollToSection(subId);
  }, []);

  const collapsedTargets: { mode: ViewMode; icon: string; label: string }[] =
    [
      { mode: "executive", icon: ICON_BUDGET, label: "Budget Monitoring" },
      { mode: "system", icon: ICON_SYSTEM, label: "System Efficiency" },
      { mode: "ops", icon: ICON_OPS, label: "Operation" },
    ];

  return (
    <aside
      className="flex-shrink-0 bg-surface border-r border-border flex flex-col transition-[width] duration-200 ease-in-out h-full"
      style={{ width: collapsed ? 56 : 220 }}
    >
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

      {collapsed ? (
        <nav
          className="pt-2 pb-1 border-b border-border flex flex-col items-center gap-1"
          role="navigation"
          aria-label="Dashboard views"
        >
          {collapsedTargets.map((t) => {
            const isActive = mode === t.mode;
            return (
              <button
                key={t.mode}
                onClick={() => {
                  onModeChange(t.mode);
                  setActiveSubItem(null);
                }}
                aria-current={isActive ? "page" : undefined}
                title={t.label}
                type="button"
                className={`flex items-center justify-center p-2 rounded-lg cursor-pointer border-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand/40 ${
                  isActive
                    ? "bg-brand-light text-brand"
                    : "bg-transparent text-txt-muted hover:bg-surface-dim hover:text-txt"
                }`}
                style={{ width: 40, height: 40 }}
              >
                <span
                  className="flex-shrink-0 w-4 h-4"
                  dangerouslySetInnerHTML={{ __html: t.icon }}
                />
              </button>
            );
          })}
        </nav>
      ) : (
        <>
          {suite === "executive" && (
            <nav
              className="pt-2 pb-1 border-b border-border"
              role="navigation"
              aria-label="Executive areas"
            >
              {EXEC_AREAS.map((area) => {
                const isActive = mode === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => handleExecArea(area.id)}
                    aria-current={isActive ? "page" : undefined}
                    type="button"
                    className={`flex items-center gap-3 my-0.5 mx-1.5 px-3 py-2.5 rounded-lg cursor-pointer border-none transition-all duration-150 text-left focus-visible:outline-2 focus-visible:outline-brand/40 ${
                      isActive
                        ? "bg-brand-light text-brand font-semibold"
                        : "bg-transparent text-txt-muted hover:bg-surface-dim hover:text-txt"
                    }`}
                    style={{ width: "calc(100% - 12px)" }}
                  >
                    <span
                      className="flex-shrink-0 w-4 h-4"
                      dangerouslySetInnerHTML={{ __html: area.icon }}
                    />
                    <span className="text-[12.5px] font-sans leading-none truncate flex-1">
                      {area.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 animate-status-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </>
      )}

      {!collapsed && (
        <nav
          className="flex-1 overflow-y-auto py-2"
          role="navigation"
          aria-label={`${subNavContext.sectionLabel} sections`}
        >
          <div className="px-4 pb-1.5 pt-1">
            <span className="text-[10px] font-display font-semibold uppercase tracking-[0.08em] text-txt-dim">
              {subNavContext.sectionLabel}
            </span>
          </div>

          {subNavContext.subItems.map((sub) => {
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

      {collapsed && <div className="flex-1" />}

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
