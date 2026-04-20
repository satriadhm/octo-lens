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

type ExportRow = Array<string | number>;

function executiveRows(enriched: EnrichedApp[]): ExportRow[] {
  return [
    [
      "Name",
      "Type",
      "Team",
      "Budget Spent (M)",
      "Budget Total (M)",
      "Budget %",
      "Budget Projection (M)",
      "Budget Level",
      "UX Score",
    ],
    ...enriched.map((entry) => [
      entry.app.name,
      entry.app.type,
      entry.app.team,
      entry.budget.spent,
      entry.budget.total,
      entry.budget.pct ?? budgetPct(entry.budget.spent, entry.budget.total),
      entry.budget.proj,
      entry.budget.level,
      entry.app.ux.score,
    ]),
  ];
}

function opsRows(enriched: EnrichedApp[]): ExportRow[] {
  return [
    [
      "Name",
      "Type",
      "MAU",
      "Response (ms)",
      "Uptime %",
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
      entry.budget.level,
      entry.budget.pct ?? budgetPct(entry.budget.spent, entry.budget.total),
      entry.app.ux.score,
    ]),
  ];
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function exportPrintableReport(
  title: string,
  filenamePrefix: string,
  rows: ExportRow[],
): void {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1100,height=760");
  if (!popup) return;

  const header = rows[0] ?? [];
  const body = rows.slice(1);
  const tableHead = header.map((cell) => `<th>${escapeHtml(String(cell))}</th>`).join("");
  const tableBody = body
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`,
    )
    .join("");

  popup.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #111827; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0 0 16px; color: #4b5563; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #d1d5db; text-align: left; padding: 6px 8px; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 700; }
    tr:nth-child(even) td { background: #f9fafb; }
    @media print {
      body { margin: 12mm; }
      button { display: none; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>Generated at ${escapeHtml(new Date().toLocaleString())}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>
    document.title = "${escapeHtml(filenamePrefix)}-${dateSuffix()}.pdf";
    window.focus();
    window.print();
  </script>
</body>
</html>`);
  popup.document.close();
}

export function exportExecutiveCSV(enriched: EnrichedApp[]): void {
  const rows = executiveRows(enriched);

  downloadCsv(`octolens-executive-${dateSuffix()}.csv`, buildCsv(rows));
}

export function exportOpsCSV(enriched: EnrichedApp[]): void {
  const rows = opsRows(enriched);

  downloadCsv(`octolens-ops-${dateSuffix()}.csv`, buildCsv(rows));
}

export function exportExecutivePDF(enriched: EnrichedApp[]): void {
  exportPrintableReport(
    "Octo Lens - Executive Report",
    "octolens-executive",
    executiveRows(enriched),
  );
}

export function exportOpsPDF(enriched: EnrichedApp[]): void {
  exportPrintableReport("Octo Lens - Ops Report", "octolens-ops", opsRows(enriched));
}
