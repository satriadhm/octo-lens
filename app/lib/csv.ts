"use client";

import type { EnrichedApp } from "@/app/lib/types";

function toCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function buildCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(toCsvValue).join(",")).join("\n");
}

function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

function budgetPct(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((spent / total) * 100);
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportExecutiveCSV(enriched: EnrichedApp[]): void {
  const rows: Array<Array<string | number>> = [
    [
      "Name",
      "Type",
      "Team",
      "ROI %",
      "ROI Label",
      "Net Value",
      "Budget Spent (M)",
      "Budget Total (M)",
      "Budget %",
      "Budget Level",
      "UX Score",
    ],
    ...enriched.map((entry) => [
      entry.app.name,
      entry.app.type,
      entry.app.team,
      entry.roi.pct,
      entry.roi.label,
      entry.roi.netValue,
      entry.budget.spent,
      entry.budget.total,
      entry.budget.pct ?? budgetPct(entry.budget.spent, entry.budget.total),
      entry.budget.level,
      entry.app.ux.score,
    ]),
  ];

  downloadCsv(`octolens-executive-${dateSuffix()}.csv`, buildCsv(rows));
}

export function exportOpsCSV(enriched: EnrichedApp[]): void {
  const rows: Array<Array<string | number>> = [
    [
      "Name",
      "Type",
      "MAU",
      "Response (ms)",
      "Uptime %",
      "ROI %",
      "Budget Level",
      "Budget %",
      "UX Score",
    ],
    ...enriched.map((entry) => [
      entry.app.name,
      entry.app.type,
      entry.app.metrics.mau,
      entry.app.metrics.responseMs,
      entry.app.metrics.uptime,
      entry.roi.pct,
      entry.budget.level,
      entry.budget.pct ?? budgetPct(entry.budget.spent, entry.budget.total),
      entry.app.ux.score,
    ]),
  ];

  downloadCsv(`octolens-ops-${dateSuffix()}.csv`, buildCsv(rows));
}
