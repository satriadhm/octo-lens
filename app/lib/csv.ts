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
    ]),
  ];
}

function opsRows(enriched: EnrichedApp[]): ExportRow[] {
  return [
    [
      "Name",
      "Type",
      "MAU",
      "Total Requests",
      "Response (ms)",
      "P95 (ms)",
      "Error Rate (%)",
      "Uptime %",
      "Budget Level",
      "Budget %",
    ],
    ...enriched.map((entry) => [
      entry.app.name,
      entry.app.type,
      entry.app.metrics.mau,
      entry.app.metrics.totalRequests ?? entry.app.api.totalReqs,
      entry.app.metrics.responseMs,
      entry.app.metrics.p95Ms ?? entry.app.metrics.responseMs,
      entry.app.metrics.errorRate ?? 0,
      entry.app.metrics.uptime,
      entry.budget.level,
      entry.budget.pct ?? budgetPct(entry.budget.spent, entry.budget.total),
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

async function loadPdfDeps(): Promise<{
  jsPDF: new (options: {
    orientation: "landscape" | "portrait";
    unit: "pt" | "mm" | "cm" | "in";
    format: string;
  }) => {
    setFontSize: (size: number) => void;
    text: (text: string, x: number, y: number) => void;
    setTextColor: (gray: number) => void;
    save: (filename: string) => void;
  };
  autoTable: (
    doc: {
      setFontSize: (size: number) => void;
      text: (text: string, x: number, y: number) => void;
      setTextColor: (gray: number) => void;
      save: (filename: string) => void;
    },
    options: {
      head: string[][];
      body: string[][];
      startY: number;
      styles: { fontSize: number; cellPadding: number; overflow: "linebreak" };
      headStyles: {
        fillColor: [number, number, number];
        textColor: [number, number, number];
        fontStyle: "bold";
      };
      margin: { top: number; left: number; right: number; bottom: number };
    },
  ) => void;
}> {
  // Load PDF dependencies lazily in browser runtime.
  const runtimeImport = new Function("m", "return import(m)") as (
    moduleName: string,
  ) => Promise<{ default?: unknown; jsPDF?: unknown }>;
  const [jspdfMod, autoTableMod] = await Promise.all([
    runtimeImport("jspdf"),
    runtimeImport("jspdf-autotable"),
  ]);

  return {
    jsPDF: jspdfMod.jsPDF as new (options: {
      orientation: "landscape" | "portrait";
      unit: "pt" | "mm" | "cm" | "in";
      format: string;
    }) => {
      setFontSize: (size: number) => void;
      text: (text: string, x: number, y: number) => void;
      setTextColor: (gray: number) => void;
      save: (filename: string) => void;
    },
    autoTable: autoTableMod.default as (
      doc: {
        setFontSize: (size: number) => void;
        text: (text: string, x: number, y: number) => void;
        setTextColor: (gray: number) => void;
        save: (filename: string) => void;
      },
      options: {
        head: string[][];
        body: string[][];
        startY: number;
        styles: { fontSize: number; cellPadding: number; overflow: "linebreak" };
        headStyles: {
          fillColor: [number, number, number];
          textColor: [number, number, number];
          fontStyle: "bold";
        };
        margin: { top: number; left: number; right: number; bottom: number };
      },
    ) => void,
  };
}

async function exportPdfReport(
  title: string,
  filenamePrefix: string,
  rows: ExportRow[],
): Promise<void> {
  const { jsPDF, autoTable } = await loadPdfDeps();
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(16);
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated at ${new Date().toLocaleString()}`, 40, 58);
  doc.setTextColor(0);

  autoTable(doc, {
    head: [header.map((cell) => String(cell))],
    body: body.map((row) => row.map((cell) => String(cell))),
    startY: 72,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: "bold",
    },
    margin: { top: 72, left: 40, right: 40, bottom: 32 },
  });

  doc.save(`${filenamePrefix}-${dateSuffix()}.pdf`);
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
  void exportPdfReport("Octo Lens - Executive Report", "octolens-executive", executiveRows(enriched));
}

export function exportOpsPDF(enriched: EnrichedApp[]): void {
  void exportPdfReport("Octo Lens - Ops Report", "octolens-ops", opsRows(enriched));
}
