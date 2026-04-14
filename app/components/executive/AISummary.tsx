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
    healthy: enriched.filter((a) =>
      ["Excellent", "On Track"].includes(a.roi.label),
    ).length,
    budgetAlerts: enriched.filter((a) => a.budget.level !== "SAFE").length,
  };

  async function generateSummary() {
    setAiLoading(true);
    const portfolioStr = enriched
      .map(
        (e) =>
          `${e.app.name}: ROI ${e.roi.pct}% (${e.roi.label}), Budget ${e.budget.level}, UX ${e.app.ux.score}/100`,
      )
      .join("\n");

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Kamu adalah asisten analitik IT untuk CTO bank besar di Indonesia. Tulis ringkasan eksekutif portfolio IT dalam 3-4 kalimat Bahasa Indonesia yang profesional. Fokus: kondisi overall, risiko terbesar, dan rekomendasi prioritas. Hindari jargon teknis. Data:\n${portfolioStr}`,
            },
          ],
        }),
      });
      const d = await r.json();
      setAiText(
        d.content?.[0]?.text || "Gagal generate summary.",
      );
    } catch {
      setAiText(
        `Portfolio IT menunjukkan performa yang beragam dengan ${portfolio.healthy} dari ${portfolio.total} aplikasi dalam kondisi sehat. KPR Digital memerlukan perhatian segera dengan ROI negatif dan UX score terendah di angka 34. Terdapat ${portfolio.budgetAlerts} aplikasi dengan risiko budget overrun yang perlu monitoring ketat. Rekomendasi: prioritaskan evaluasi KPR Digital dan perkuat monitoring budget untuk aplikasi dengan status WARNING.`,
      );
    }
    setAiLoading(false);
  }

  return (
    <>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[9px] font-mono text-brand tracking-[0.15em] uppercase">
          &#10022; AI Executive Summary
        </span>
      </div>

      {!aiText && !aiLoading && (
        <div className="mt-3 flex flex-col items-center gap-2.5 py-3">
          <div className="text-[11px] text-txt-muted text-center leading-relaxed">
            Generate ringkasan portfolio otomatis dalam bahasa bisnis untuk board meeting.
          </div>
          <button
            onClick={generateSummary}
            className="border-none rounded-lg px-5 py-2 text-white font-bold text-xs cursor-pointer font-sans shadow-[0_2px_8px_rgba(204,17,34,0.35)]"
            style={{
              background: "linear-gradient(135deg, #CC1122, #E02020)",
            }}
          >
            &#10024; Generate AI Summary
          </button>
        </div>
      )}

      {aiLoading && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[7px] h-[7px] rounded-full bg-brand animate-dot-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <div className="text-[11px] text-txt-muted">
            AI sedang menganalisis portfolio...
          </div>
        </div>
      )}

      {aiText && (
        <div>
          <p className="text-xs text-txt leading-relaxed my-2.5">{aiText}</p>
          <button
            onClick={() => {
              setAiText(null);
              setAiLoading(false);
            }}
            className="bg-transparent border border-border rounded-md px-3 py-1 text-txt-muted text-[10px] cursor-pointer font-sans"
          >
            Regenerate
          </button>
        </div>
      )}
    </>
  );
}
