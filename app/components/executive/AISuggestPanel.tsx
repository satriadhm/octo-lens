"use client";

import { useEffect, useMemo, useState } from "react";
import type { App } from "@/app/lib/types";
import {
  buildSuggestion,
  idr,
  type InfraRecommendation,
  type Suggestion,
} from "@/app/lib/calculators";
import {
  AgentProcessState,
  streamSimulate,
  type AgentState,
} from "@/app/components/shared/AgentProcessState";

interface AISuggestPanelProps {
  app: App | null;
}

const STEPS = [
  "Reading application metrics...",
  "Fetching budget allocation data...",
  "Correlating usage patterns...",
  "Generating recommendations...",
];

export function AISuggestPanel({ app }: AISuggestPanelProps) {
  if (!app) return <EmptyState />;
  return <SelectedState key={app.id} app={app} />;
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-6 min-h-[320px] border border-dashed border-border rounded-xl bg-surface-dim/20">
      <p className="text-sm font-semibold text-txt">Suggestions</p>
      <p className="text-xs text-txt-muted max-w-[260px] leading-relaxed">
        Select an application in the chart to see tailored recommendations.
      </p>
    </div>
  );
}

function SelectedState({ app }: { app: App }) {
  const suggestion = useMemo(() => buildSuggestion(app), [app]);
  const [state, setState] = useState<AgentState>("loading");
  const [step, setStep] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState(0);
  const [runId, setRunId] = useState(0);
  const [acked, setAcked] = useState<Set<number>>(new Set());

  useEffect(() => {
    const layerTimers: ReturnType<typeof setTimeout>[] = [];
    layerTimers.push(setTimeout(() => setVisibleLayers(0), 0));
    const cancel = streamSimulate({
      text: "",
      stepCount: STEPS.length,
      stepDelay: 380,
      chunkSize: 1,
      charDelay: 10,
      onStep: setStep,
      onChunk: () => {},
      onState: (s) => {
        if (s === "streaming") {
          setState("streaming");
          layerTimers.push(setTimeout(() => setVisibleLayers(1), 80));
          layerTimers.push(setTimeout(() => setVisibleLayers(2), 520));
          layerTimers.push(setTimeout(() => setVisibleLayers(3), 980));
          layerTimers.push(setTimeout(() => setVisibleLayers(4), 1380));
          layerTimers.push(setTimeout(() => setState("success"), 1700));
        } else if (s === "success") {
          // Empty stream text finishes immediately; success is shown after layer 4 (see above).
        } else {
          setState(s);
        }
      },
    });
    return () => {
      cancel();
      layerTimers.forEach(clearTimeout);
    };
  }, [app.id, runId]);

  const toggleAck = (i: number) => {
    setAcked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (state === "loading") {
    return (
      <PanelShell app={app} onRefresh={() => setRunId((n) => n + 1)} state={state}>
        <AgentProcessState
          agentSteps={STEPS}
          currentStep={step}
          state="loading"
        />
      </PanelShell>
    );
  }

  if (state === "error") {
    return (
      <PanelShell app={app} onRefresh={() => setRunId((n) => n + 1)} state={state}>
        <AgentProcessState
          agentSteps={STEPS}
          currentStep={step}
          state="error"
          onRetry={() => setRunId((n) => n + 1)}
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell
      app={app}
      onRefresh={() => setRunId((n) => n + 1)}
      state={state}
      footerNote={suggestion.timestampNote}
    >
      <div className="flex flex-col gap-3">
        {visibleLayers >= 1 && (
          <LayerCard key="l1" title="What's happening">
            <p className="text-xs text-txt leading-relaxed">
              {suggestion.whatHappening}
            </p>
          </LayerCard>
        )}
        {visibleLayers >= 2 && (
          <LayerCard key="l2" title="Why it matters">
            <p className="text-xs text-txt leading-relaxed">
              {suggestion.whyMatters}
            </p>
          </LayerCard>
        )}
        {visibleLayers >= 3 && (
          <LayerCard key="l3" title="Rekomendasi infrastruktur">
            <InfraRecommendationCard rec={suggestion.infraRecommendation} />
          </LayerCard>
        )}
        {visibleLayers >= 4 && (
          <LayerCard key="l4" title="Langkah tindak lanjut">
            <ul className="flex flex-col gap-2">
              {suggestion.infraActions.map((a, i) => (
                <ActionRow
                  key={i}
                  action={a}
                  checked={acked.has(i)}
                  onToggle={() => toggleAck(i)}
                />
              ))}
            </ul>
          </LayerCard>
        )}
      </div>
    </PanelShell>
  );
}

function PanelShell({
  app,
  onRefresh,
  state,
  children,
  footerNote,
}: {
  app: App;
  onRefresh: () => void;
  state: AgentState;
  children: React.ReactNode;
  footerNote?: string;
}) {
  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl p-4 min-h-[320px]">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-txt-dim">
              Suggestions
            </span>
            {state === "success" && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-ok"
                aria-label="Analysis complete"
              />
            )}
          </div>
          <h3 className="text-sm font-display font-bold text-txt mt-0.5 truncate">
            {app.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Regenerate suggestion"
          title="Regenerate"
          className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-txt-muted hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
        >
          <RefreshIcon />
        </button>
      </header>

      <div className="flex-1 min-h-0">{children}</div>

      {footerNote && state === "success" && (
        <p className="text-[10px] text-txt-dim mt-4 flex items-center gap-1.5">
          <span
            className="inline-block w-1 h-1 rounded-full bg-ok"
            aria-hidden
          />
          {footerNote}
        </p>
      )}
    </div>
  );
}

function LayerCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-layer-fade-in rounded-lg border border-border bg-surface-dim/25 p-3">
      <div className="text-[11px] font-semibold text-txt-dim mb-2">{title}</div>
      {children}
    </div>
  );
}

const DIRECTION_UI: Record<
  InfraRecommendation["direction"],
  {
    label: string;
    tier: string;
    badge: { color: string; background: string };
  }
> = {
  downgrade: {
    label: "Downgrade Tier",
    tier: "var(--color-ok)",
    badge: { color: "var(--color-ok)", background: "var(--color-ok-dim)" },
  },
  upgrade: {
    label: "Upgrade / Scale",
    tier: "var(--color-warn)",
    badge: { color: "var(--color-warn)", background: "var(--color-warn-dim)" },
  },
  maintain: {
    label: "Pertahankan",
    tier: "var(--color-info)",
    badge: { color: "var(--color-info)", background: "var(--color-info-dim)" },
  },
  decommission: {
    label: "Evaluasi Retire",
    tier: "var(--color-txt-dim)",
    badge: { color: "var(--color-txt-dim)", background: "var(--color-surface-dim)" },
  },
};

function InfraRecommendationCard({ rec }: { rec: InfraRecommendation }) {
  const dir = DIRECTION_UI[rec.direction];
  const strikeCurrent =
    rec.direction === "downgrade" || rec.direction === "decommission";

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={dir.badge}
        >
          {dir.label}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-0">
        <span
          className={`font-mono text-[11px] text-txt-dim ${strikeCurrent ? "line-through" : ""}`}
        >
          {rec.currentTier}
        </span>
        <span className="text-txt-dim mx-1.5" aria-hidden>
          →
        </span>
        <span
          className="font-mono text-[11px] font-semibold"
          style={{ color: dir.tier }}
        >
          {rec.recommendedTier}
        </span>
      </div>
      <p className="text-xs text-txt-muted leading-relaxed mt-2 pr-1">
        {rec.rationale}
      </p>
      {rec.estimatedMonthlySavingsIDR > 0 && (
        <div className="mt-2 flex justify-end">
          <span
            className="inline-block text-[10px] font-semibold rounded px-2 py-0.5"
            style={{
              color: "var(--color-ok)",
              background: "var(--color-ok-dim)",
            }}
          >
            Hemat ~{idr(rec.estimatedMonthlySavingsIDR)}/bln
          </span>
        </div>
      )}
    </div>
  );
}

const PRIORITY_DOT: Record<
  "HIGH" | "MEDIUM" | "LOW",
  string
> = {
  HIGH: "var(--color-danger)",
  MEDIUM: "var(--color-warn)",
  LOW: "var(--color-txt-dim)",
};

function ActionRow({
  action,
  checked,
  onToggle,
}: {
  action: {
    text: string;
    impact: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    tone: "save" | "risk" | "neutral";
  };
  checked: boolean;
  onToggle: () => void;
}) {
  const badgeClass = {
    save: "bg-ok/15 text-ok border-ok/25",
    risk: "bg-danger/12 text-danger border-danger/25",
    neutral: "bg-surface border-border text-txt-muted",
  }[action.tone];
  return (
    <li className="flex items-start gap-2.5">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={checked ? "Mark as unacknowledged" : "Acknowledge action"}
        className={`mt-0.5 shrink-0 inline-flex size-[18px] rounded-[4px] border transition-colors items-center justify-center focus-visible:outline-2 focus-visible:outline-brand/40 focus-visible:outline-offset-2 ${
          checked
            ? "bg-brand border-brand text-white"
            : "bg-surface border-border hover:border-brand/40"
        }`}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-relaxed ${
            checked ? "text-txt-muted line-through decoration-txt-dim/40" : "text-txt"
          }`}
        >
          {action.text}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 mt-1 text-[10px] font-semibold rounded px-1.5 py-0.5 border ${badgeClass}`}
        >
          <span
            className="inline-block size-[6px] shrink-0 rounded-full"
            style={{ background: PRIORITY_DOT[action.priority] }}
            aria-hidden
          />
          {action.impact}
        </span>
      </div>
    </li>
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

export type { Suggestion };
