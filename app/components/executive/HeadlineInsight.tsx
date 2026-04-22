"use client";

import { useEffect, useState } from "react";
import type { EnrichedApp } from "@/app/lib/types";
import { buildExecHeadline, idr } from "@/app/lib/calculators";
import {
  AgentProcessState,
  streamSimulate,
  type AgentState,
} from "@/app/components/shared/AgentProcessState";

interface HeadlineInsightProps {
  enriched: EnrichedApp[];
}

const STEPS = [
  "Reading application metrics...",
  "Fetching budget allocation data...",
  "Correlating usage patterns...",
  "Generating portfolio headline...",
];

export function HeadlineInsight({ enriched }: HeadlineInsightProps) {
  const headline = buildExecHeadline(enriched);
  const [state, setState] = useState<AgentState>("loading");
  const [step, setStep] = useState(0);
  const [streamed, setStreamed] = useState("");
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const cancel = streamSimulate({
      text: headline.sentence,
      stepCount: STEPS.length,
      stepDelay: 320,
      charDelay: 12,
      chunkSize: 3,
      onStep: setStep,
      onChunk: setStreamed,
      onState: setState,
    });
    return cancel;
  }, [headline.sentence, runId]);

  const showSentence = state === "streaming" || state === "success";

  return (
    <section
      className="rounded-xl border border-white/15 bg-brand text-white shadow-sm"
      aria-label="Portfolio headline insight"
    >
      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-display font-semibold uppercase tracking-[0.1em] text-white/80">
              Portfolio insight
            </span>
            <button
              type="button"
              onClick={() => setRunId((n) => n + 1)}
              aria-label="Regenerate headline"
              title="Regenerate headline"
              className="ml-auto lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/25 bg-white/10 hover:bg-white/15 transition-colors text-white/90 focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <RefreshIcon />
            </button>
          </div>

          {showSentence ? (
            <p className="font-display text-lg sm:text-xl font-semibold leading-snug text-white max-w-[65ch]">
              {streamed}
              {state === "streaming" && (
                <span
                  className="inline-block w-[3px] h-6 ml-1 align-middle bg-white/90 animate-caret-blink"
                  aria-hidden
                />
              )}
            </p>
          ) : (
            <AgentProcessState
              state={state}
              agentSteps={STEPS}
              currentStep={step}
              className="!bg-white/10 !border-white/10 !text-white [&_*]:!text-white/90"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-3 lg:max-w-[420px]">
          <Stat label="Apps monitored" value={String(headline.totalApps)} />
          <Stat
            label="Need attention"
            value={String(headline.needsAttention)}
            accent={headline.needsAttention > 0}
          />
          <Stat
            label="Potential savings"
            value={idr(headline.potentialSavingsIDR)}
            accent={headline.potentialSavingsIDR > 0}
          />
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            aria-label="Regenerate headline"
            title="Regenerate headline"
            className="hidden lg:inline-flex items-center justify-center h-11 w-11 rounded-lg border border-white/25 bg-white/10 hover:bg-white/15 transition-colors text-white/90 focus-visible:outline-2 focus-visible:outline-white/60"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[120px] rounded-lg px-3.5 py-2.5 border ${
        accent
          ? "bg-white/12 border-white/25"
          : "bg-white/6 border-white/15"
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-white/75 font-semibold">
        {label}
      </div>
      <div className="text-base sm:text-lg font-display font-bold text-white tabular-nums leading-tight">
        {value}
      </div>
    </div>
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
