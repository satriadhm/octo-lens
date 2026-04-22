"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnrichedApp } from "@/app/lib/types";
import { buildTechSummary, type TechSummary } from "@/app/lib/calculators";
import {
  AgentProcessState,
  streamSimulate,
  type AgentState,
} from "@/app/components/shared/AgentProcessState";

interface AITechnicalSummaryProps {
  enriched: EnrichedApp[];
  onFocusArea?: (area: FocusArea) => void;
}

export type FocusArea = "latency" | "errors" | "zombie";

const STEPS = [
  "Reading application metrics...",
  "Fetching telemetry traces...",
  "Correlating latency signals...",
  "Generating technical summary...",
];

interface CacheEntry {
  text: string;
  generatedAt: number;
  fingerprint: string;
}

let cachedSummary: CacheEntry | null = null;

function fingerprintOf(enriched: EnrichedApp[]): string {
  return enriched
    .map(
      (e) =>
        `${e.app.id}:${e.app.metrics.errorRate ?? 0}:${e.app.metrics.p95Ms ?? 0}`,
    )
    .join("|");
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export function AITechnicalSummary({
  enriched,
  onFocusArea,
}: AITechnicalSummaryProps) {
  const summary = useMemo<TechSummary>(
    () => buildTechSummary(enriched),
    [enriched],
  );
  const fingerprint = useMemo(() => fingerprintOf(enriched), [enriched]);

  const [collapsed, setCollapsed] = useState(false);
  const [state, setState] = useState<AgentState>("loading");
  const [step, setStep] = useState(0);
  const [streamed, setStreamed] = useState("");
  const [runId, setRunId] = useState(0);
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);

  useEffect(() => {
    const cache = cachedSummary;
    const force = runId > 0;

    if (!force && cache && cache.fingerprint === fingerprint) {
      const timer = setTimeout(() => {
        setStreamed(cache.text);
        setLastGenerated(cache.generatedAt);
        setStep(STEPS.length);
        setState("success");
      }, 0);
      return () => clearTimeout(timer);
    }

    const cancel = streamSimulate({
      text: summary.text,
      stepCount: STEPS.length,
      stepDelay: 340,
      charDelay: 10,
      chunkSize: 4,
      onStep: setStep,
      onChunk: setStreamed,
      onState: (s) => {
        setState(s);
        if (s === "success") {
          const now = Date.now();
          cachedSummary = {
            text: summary.text,
            generatedAt: now,
            fingerprint,
          };
          setLastGenerated(now);
        }
      },
    });
    return cancel;
  }, [summary.text, fingerprint, runId]);

  return (
    <section
      className="bg-surface border border-border rounded-2xl overflow-hidden animate-fade-in-up"
      aria-label="AI Technical Summary"
    >
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-dim/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-brand-light text-brand"
            aria-hidden
          >
            <AgentIcon />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-display font-bold text-txt flex items-center gap-2">
              AI Technical Summary
              {state === "success" && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-ok"
                  aria-label="Fresh"
                />
              )}
            </h2>
            <p className="text-[10px] text-txt-dim">
              {state === "success" && lastGenerated
                ? `auto-updated · ${relativeTime(lastGenerated)}`
                : state === "error"
                  ? "update failed — retry to refresh"
                  : "auto-updating…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            aria-label="Regenerate technical summary"
            title="Regenerate"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-txt-muted hover:text-brand hover:bg-brand-light transition-colors"
          >
            <RefreshIcon />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand summary" : "Collapse summary"}
            aria-expanded={!collapsed}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-txt-muted hover:text-brand hover:bg-brand-light transition-colors"
          >
            <ChevronIcon rotated={collapsed} />
          </button>
        </div>
      </header>

      {!collapsed && (
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
            {/* Summary text */}
            <div className="min-h-[120px]">
              {state === "loading" && (
                <AgentProcessState
                  agentSteps={STEPS}
                  currentStep={step}
                  state="loading"
                />
              )}
              {state === "error" && (
                <AgentProcessState
                  agentSteps={STEPS}
                  currentStep={step}
                  state="error"
                  onRetry={() => setRunId((n) => n + 1)}
                >
                  {streamed && (
                    <p className="text-xs text-txt-muted leading-relaxed">
                      {streamed}
                    </p>
                  )}
                </AgentProcessState>
              )}
              {(state === "streaming" || state === "success") && (
                <p className="text-[13px] text-txt leading-relaxed whitespace-pre-wrap">
                  {streamed}
                  {state === "streaming" && (
                    <span
                      className="inline-block w-[5px] h-[12px] ml-0.5 bg-brand align-middle animate-caret-blink"
                      aria-hidden
                    />
                  )}
                </p>
              )}
            </div>

            {/* Metric callouts */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
              <Callout
                label="Weighted error rate"
                value={`${summary.errorRatePct.toFixed(2)}%`}
                tone={
                  summary.errorRatePct > 3
                    ? "danger"
                    : summary.errorRatePct > 1
                      ? "warn"
                      : "ok"
                }
              />
              <Callout
                label="Portfolio P95"
                value={`${summary.portfolioP95}ms`}
                tone={
                  summary.portfolioP95 > 700
                    ? "danger"
                    : summary.portfolioP95 > 400
                      ? "warn"
                      : "ok"
                }
              />
              <Callout
                label={`Lowest uptime — ${summary.worstUptime.app}`}
                value={`${summary.worstUptime.uptime}%`}
                tone={
                  summary.worstUptime.uptime < 99
                    ? "danger"
                    : summary.worstUptime.uptime < 99.5
                      ? "warn"
                      : "ok"
                }
              />
            </div>
          </div>

          {/* Focus areas */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
            <span className="text-[10px] uppercase tracking-[0.14em] font-display font-semibold text-txt-dim mr-1">
              Focus areas
            </span>
            <FocusChip
              label="Latency Spike"
              onClick={() => onFocusArea?.("latency")}
              tone="warn"
            />
            <FocusChip
              label="Error Rate"
              onClick={() => onFocusArea?.("errors")}
              tone="danger"
            />
            <FocusChip
              label="Underutilized Endpoint"
              onClick={() => onFocusArea?.("zombie")}
              tone="muted"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Callout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "danger";
}) {
  const toneClass = {
    ok: "border-ok/25 bg-ok/10 text-ok",
    warn: "border-warn/30 bg-warn/12 text-warn",
    danger: "border-danger/25 bg-danger/10 text-danger",
  }[tone];
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${toneClass.replace(/text-\w+/, "")}`}
      style={{ background: "transparent" }}
    >
      <div
        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-[0.12em] mb-1 ${toneClass}`}
      >
        {label}
      </div>
      <div className="text-xl font-display font-bold text-txt tabular-nums leading-tight">
        {value}
      </div>
    </div>
  );
}

function FocusChip({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "ok" | "warn" | "danger" | "muted";
}) {
  const toneClass = {
    ok: "hover:border-ok/40 hover:bg-ok/10 hover:text-ok",
    warn: "hover:border-warn/40 hover:bg-warn/10 hover:text-warn",
    danger: "hover:border-danger/40 hover:bg-danger/10 hover:text-danger",
    muted: "hover:border-brand/30 hover:bg-brand-light",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full border border-border text-txt-muted transition-colors ${toneClass}`}
    >
      {label}
    </button>
  );
}

function AgentIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 4v4" />
      <circle cx="12" cy="3" r="1" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
      <path d="M9 18h6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
      <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform"
      style={{ transform: rotated ? "rotate(-90deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
