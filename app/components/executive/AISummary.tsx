"use client";

import { useState } from "react";
import type { EnrichedApp } from "@/app/lib/types";

interface AISummaryProps {
  enriched: EnrichedApp[];
}

export function AISummary({ enriched }: AISummaryProps) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const portfolio = {
    total: enriched.length,
    healthy: enriched.filter(
      (a) => a.budget.level === "SAFE" && a.app.ux.score >= 50,
    ).length,
    budgetAlerts: enriched.filter((a) => a.budget.level !== "SAFE").length,
  };

  function generateSummary() {
    setAiLoading(true);
    setTimeout(() => {
      setAiText(
        `The IT portfolio shows mixed budget health, with ${portfolio.healthy} of ${portfolio.total} applications in healthy condition. KPR Digital requires immediate attention due to critical budget pressure and the lowest UX score at 34. There are ${portfolio.budgetAlerts} applications with budget overrun risk that need close monitoring. Recommendation: prioritize KPR Digital stabilization and tighten budget control for applications with WARNING status.`,
      );
      setAiLoading(false);
    }, 2000);
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-display font-semibold text-brand tracking-[0.04em] uppercase">
          AI Executive Summary
        </span>
        <span className="text-[9px] font-medium text-txt-dim bg-surface-dim border border-border rounded px-1.5 py-0.5 uppercase tracking-wider">
          Demo
        </span>
      </div>

      {!aiText && !aiLoading && (
        <div className="mt-4 flex flex-col items-center gap-3 py-4">
          <p className="text-xs text-txt-muted text-center leading-relaxed max-w-[260px]">
            Generate an automated portfolio summary in business language for
            board meetings.
          </p>
          <button
            onClick={generateSummary}
            className="border border-brand rounded-lg px-5 py-2 text-brand font-semibold text-xs cursor-pointer font-sans bg-transparent hover:bg-brand-light transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
          >
            Generate Summary
          </button>
        </div>
      )}

      {aiLoading && (
        <div className="mt-5 flex flex-col items-center gap-2.5">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand animate-status-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-txt-muted">
            AI is analyzing portfolio&hellip;
          </p>
        </div>
      )}

      {aiText && (
        <div>
          <div className="text-[10px] text-txt-dim mb-1.5 mt-1">
            Sample analysis (live AI unavailable)
          </div>
          <p className="text-xs text-txt leading-relaxed mb-3">{aiText}</p>
          <button
            onClick={() => {
              setAiText(null);
              setAiLoading(false);
            }}
            className="bg-transparent border border-border rounded-md px-3 py-1 text-txt-muted text-[11px] cursor-pointer font-sans hover:border-border-hi transition-colors"
          >
            Regenerate
          </button>
        </div>
      )}
    </>
  );
}
