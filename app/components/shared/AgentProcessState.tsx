"use client";

import type { ReactNode } from "react";
import {
  LENS_ERROR_UNAVAILABLE,
  LENS_RUN_COMPLETE_FOOTER,
} from "@/app/lib/lensaiCopy";

export type AgentState =
  | "idle"
  | "loading"
  | "streaming"
  | "success"
  | "error";

interface AgentProcessStateProps {
  agentSteps: string[];
  currentStep: number;
  state: AgentState;
  streamingText?: string;
  children?: ReactNode;
  onRetry?: () => void;
  idlePrompt?: string;
  completeLabel?: string;
  className?: string;
}

export function AgentProcessState({
  agentSteps,
  currentStep,
  state,
  streamingText,
  children,
  onRetry,
  idlePrompt,
  completeLabel = LENS_RUN_COMPLETE_FOOTER,
  className = "",
}: AgentProcessStateProps) {
  if (state === "idle") {
    if (!idlePrompt) return null;
    return (
      <div
        className={`text-[11px] text-txt-dim italic ${className}`}
        aria-live="polite"
      >
        {idlePrompt}
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div
        className={`bg-surface-dim/80 border border-border rounded-lg p-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <ul className="flex flex-col gap-2">
          {agentSteps.map((label, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            const isPending = idx > currentStep;
            return (
              <li
                key={idx}
                className="flex items-center gap-2.5 text-[11px] animate-step-fade-in"
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                <StepIcon
                  isDone={isDone}
                  isActive={isActive}
                  isPending={isPending}
                />
                <span
                  className={
                    isDone
                      ? "text-txt-muted line-through decoration-txt-dim/40"
                      : isActive
                        ? "text-txt font-medium"
                        : "text-txt-dim"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (state === "streaming") {
    return (
      <div className={className}>
        {children}
        {streamingText !== undefined && !children && (
          <p className="text-xs text-txt leading-relaxed whitespace-pre-wrap">
            {streamingText}
            <span
              className="inline-block w-[6px] h-[12px] ml-0.5 bg-brand align-middle animate-caret-blink"
              aria-hidden
            />
          </p>
        )}
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className={className}>
        {children}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-txt-dim">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-ok"
            aria-hidden
          />
          <span>{completeLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-danger/30 bg-danger/5 rounded-lg p-4 flex flex-col gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-danger/15 text-danger text-[10px] font-bold"
          aria-hidden
        >
          !
        </span>
        <div className="flex-1">
          <p className="text-xs text-txt font-medium">
            {LENS_ERROR_UNAVAILABLE}
          </p>
          <p className="text-[11px] text-txt-muted mt-0.5">
            You can try again in a moment — previously loaded content is kept
            below.
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start text-[11px] font-semibold text-brand border border-brand/40 rounded-md px-3 py-1.5 hover:bg-brand-light transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
        >
          Try Again
        </button>
      )}
      {children && (
        <div className="pt-3 border-t border-border/60 opacity-80">
          {children}
        </div>
      )}
    </div>
  );
}

function StepIcon({
  isDone,
  isActive,
  isPending,
}: {
  isDone: boolean;
  isActive: boolean;
  isPending: boolean;
}) {
  if (isDone) {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-ok/15 text-ok text-[10px]"
        aria-hidden
      >
        &#10003;
      </span>
    );
  }
  if (isActive) {
    return (
      <span
        className="inline-block w-4 h-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin360"
        aria-hidden
      />
    );
  }
  if (isPending) {
    return (
      <span
        className="inline-block w-1.5 h-1.5 mx-[5px] rounded-full bg-txt-dim/40"
        aria-hidden
      />
    );
  }
  return null;
}

/**
 * Drive a simulated agent lifecycle for a UI: progressive step completion,
 * then streaming text character-by-character. Returns a cleanup function.
 *
 * @param params.text       The final text to stream out.
 * @param params.stepCount  How many agent steps to walk through before streaming.
 * @param params.stepDelay  ms between step advances (default 450).
 * @param params.charDelay  ms between streamed chunks (default 20).
 * @param params.chunkSize  chars revealed per tick (default 6).
 * @param params.onStep     Called when currentStep advances.
 * @param params.onChunk    Called with the partially streamed text.
 * @param params.onState    Called when the lifecycle state changes.
 */
export function streamSimulate(params: {
  text: string;
  stepCount: number;
  stepDelay?: number;
  charDelay?: number;
  chunkSize?: number;
  onStep?: (step: number) => void;
  onChunk?: (chunk: string) => void;
  onState?: (state: AgentState) => void;
}): () => void {
  const {
    text,
    stepCount,
    stepDelay = 450,
    charDelay = 20,
    chunkSize = 6,
    onStep,
    onChunk,
    onState,
  } = params;

  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Kick off the lifecycle on a microtask so any callback-driven setState calls
  // do not happen synchronously inside the subscribing effect body.
  const bootstrap = setTimeout(() => {
    if (cancelled) return;
    onChunk?.("");
    onStep?.(0);
    onState?.("loading");
  }, 0);
  timers.push(bootstrap);

  for (let i = 1; i <= stepCount; i++) {
    const t = setTimeout(() => {
      if (cancelled) return;
      onStep?.(i);
    }, i * stepDelay);
    timers.push(t);
  }

  const streamStart = setTimeout(
    () => {
      if (cancelled) return;
      onState?.("streaming");
      let idx = 0;
      const tick = () => {
        if (cancelled) return;
        idx = Math.min(text.length, idx + chunkSize);
        onChunk?.(text.slice(0, idx));
        if (idx < text.length) {
          const t = setTimeout(tick, charDelay);
          timers.push(t);
        } else {
          onState?.("success");
        }
      };
      tick();
    },
    (stepCount + 0.2) * stepDelay,
  );
  timers.push(streamStart);

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
