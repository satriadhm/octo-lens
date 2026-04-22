"use client";

import { useEffect, useState } from "react";
import type { EnrichedApp } from "@/app/lib/types";
import {
  AgentProcessState,
  streamSimulate,
  type AgentState,
} from "@/app/components/shared/AgentProcessState";

interface AISummaryProps {
  enriched: EnrichedApp[];
}

const STEPS = [
  "Reading application metrics...",
  "Fetching budget allocation data...",
  "Correlating usage patterns...",
  "Generating recommendations...",
];

function buildExecSummary(enriched: EnrichedApp[]): string {
  const total = enriched.length;
  const healthy = enriched.filter((a) => a.budget.level === "SAFE").length;
  const budgetAlerts = enriched.filter((a) => a.budget.level !== "SAFE").length;
  const worst = [...enriched].sort((a, b) => b.budget.pct - a.budget.pct)[0];
  return `Portofolio IT menunjukkan kondisi anggaran yang beragam, dengan ${healthy} dari ${total} aplikasi dalam status sehat. ${worst.app.name} memerlukan perhatian segera karena utilisasi anggaran tertinggi di ${worst.budget.pct}%. Terdapat ${budgetAlerts} aplikasi dengan risiko overrun anggaran yang perlu dipantau ketat. Rekomendasi: prioritaskan stabilisasi ${worst.app.name} dan perketat kontrol anggaran untuk aplikasi berstatus WARNING.`;
}

export function AISummary({ enriched }: AISummaryProps) {
  const [state, setState] = useState<AgentState>("loading");
  const [step, setStep] = useState(0);
  const [streamed, setStreamed] = useState("");
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const text = buildExecSummary(enriched);
    const cancel = streamSimulate({
      text,
      stepCount: STEPS.length,
      stepDelay: 360,
      charDelay: 12,
      chunkSize: 3,
      onStep: setStep,
      onChunk: setStreamed,
      onState: setState,
    });
    return cancel;
  }, [enriched, runId]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-display font-semibold text-brand tracking-[0.04em] uppercase">
            AI Executive Summary
          </span>
          {state === "success" && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-ok"
              aria-label="Analysis complete"
            />
          )}
          <span className="text-[11px] font-medium text-txt-dim bg-surface-dim border border-border rounded px-1.5 py-0.5 uppercase tracking-wider">
            Demo
          </span>
        </div>
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          aria-label="Regenerate summary"
          title="Regenerate"
          className="inline-flex items-center justify-center h-10 w-10 rounded-md text-txt-muted hover:text-brand hover:bg-brand-light transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
        >
          <RefreshIcon />
        </button>
      </div>

      {(state === "loading" || state === "idle") && (
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
        />
      )}

      {(state === "streaming" || state === "success") && (
        <div>
          <p className="text-xs text-txt leading-relaxed">
            {streamed}
            {state === "streaming" && (
              <span
                className="inline-block w-[5px] h-[11px] ml-0.5 bg-brand align-middle animate-caret-blink"
                aria-hidden
              />
            )}
          </p>
          {state === "success" && (
            <p className="text-[10px] text-txt-dim mt-3 flex items-center gap-1.5">
              <span
                className="inline-block w-1 h-1 rounded-full bg-ok"
                aria-hidden
              />
              Analysis complete · Updated just now
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="13"
      height="13"
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
