"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { App, EnrichedApp } from "@/app/lib/types";
import { Card, Label, Badge, Pill } from "@/app/components/shared/Card";
import { ChartTooltip } from "@/app/components/shared/ChartTooltip";
import { ExportMenu } from "@/app/components/shared/ExportMenu";
import { exportOpsCSV, exportOpsPDF } from "@/app/lib/csv";

interface OpsViewProps {
  enriched: EnrichedApp[];
  onSelect: (app: App) => void;
}

function rtColor(ms: number) {
  if (ms > 700) return "var(--color-red)";
  if (ms > 400) return "var(--color-amber)";
  return "var(--color-green)";
}

function uxColor(score: number) {
  if (score >= 70) return "var(--color-green)";
  if (score >= 50) return "var(--color-amber)";
  return "var(--color-red)";
}

type SortKey = "name" | "mau" | "response" | "uptime" | "budgetPct" | "ux";
type SortDir = "asc" | "desc";

export function OpsView({ enriched, onSelect }: OpsViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rtData = enriched.map((e) => ({
    name: e.app.shortName,
    ms: e.app.metrics.responseMs,
  }));

  const avgResponse = Math.round(
    enriched.reduce((s, e) => s + e.app.metrics.responseMs, 0) /
      enriched.length,
  );
  const slowest = [...enriched].sort(
    (a, b) => b.app.metrics.responseMs - a.app.metrics.responseMs,
  )[0];
  const minUptime = Math.min(...enriched.map((e) => e.app.metrics.uptime));
  const totalMAU = enriched.reduce((s, e) => s + e.app.metrics.mau, 0);

  const kpis = [
    { l: "Avg Response", v: `${avgResponse}ms`, c: "var(--color-blue)" },
    { l: "Slowest App", v: slowest.app.shortName, c: "var(--color-amber)" },
    { l: "Min Uptime", v: `${minUptime}%`, c: "var(--color-orange)" },
    { l: "Total MAU", v: totalMAU.toLocaleString(), c: "var(--color-green)" },
  ];

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...enriched].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name":
        return a.app.name.localeCompare(b.app.name) * dir;
      case "mau":
        return (a.app.metrics.mau - b.app.metrics.mau) * dir;
      case "response":
        return (a.app.metrics.responseMs - b.app.metrics.responseMs) * dir;
      case "uptime":
        return (a.app.metrics.uptime - b.app.metrics.uptime) * dir;
      case "budgetPct":
        return (a.budget.pct - b.budget.pct) * dir;
      case "ux":
        return (a.app.ux.score - b.app.ux.score) * dir;
      default:
        return 0;
    }
  });

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const columns: { key: SortKey | ""; label: string; sortable: boolean }[] = [
    { key: "name", label: "Application", sortable: true },
    { key: "", label: "Type", sortable: false },
    { key: "mau", label: "MAU", sortable: true },
    { key: "response", label: "Response", sortable: true },
    { key: "uptime", label: "Uptime", sortable: true },
    { key: "budgetPct", label: "Budget %", sortable: true },
    { key: "", label: "Budget", sortable: false },
    { key: "ux", label: "UX", sortable: true },
    { key: "", label: "", sortable: false },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full max-w-[1400px] mx-auto w-full">
      {/* Narrative */}
      <div className="animate-fade-in-up relative z-[110] flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-txt mb-1">
            Operations Dashboard
          </h1>
          <p className="text-sm text-txt-muted">
            Real-time application health and performance metrics
          </p>
        </div>
        <ExportMenu
          onExportCSV={() => exportOpsCSV(enriched)}
          onExportPDF={() => exportOpsPDF(enriched)}
        />
      </div>

      {/* Ops KPI */}
      <div className="grid grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl px-5 py-4 border border-border"
          >
            <Label>{k.l}</Label>
            <div
              className="text-xl font-display font-extrabold"
              style={{ color: k.c }}
            >
              {k.v}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 animate-fade-in-up stagger-2">
        <Card>
          <Label>Response Time per Application (ms)</Label>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rtData} barSize={32}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickFormatter={(v: number) => `${v}ms`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip unit="ms" />} />
              <ReferenceLine
                y={500}
                stroke="var(--color-amber)"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{
                  value: "500ms SLA",
                  fill: "var(--color-amber)",
                  fontSize: 10,
                }}
              />
              <Bar dataKey="ms" radius={[4, 4, 0, 0]} name="Response time">
                {rtData.map((d, i) => (
                  <Cell key={i} fill={rtColor(d.ms)} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>UX Health Score per Application</Label>
          <div className="flex flex-col gap-2.5 mt-3">
            {[...enriched]
              .sort((a, b) => b.app.ux.score - a.app.ux.score)
              .map((e) => (
                <div
                  key={e.app.id}
                  onClick={() => onSelect(e.app)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(e.app);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="flex gap-3 items-center cursor-pointer group focus-visible:outline-2 focus-visible:outline-brand/40 rounded"
                >
                  <span className="text-xs text-txt font-medium min-w-[100px] group-hover:text-brand transition-colors">
                    {e.app.shortName}
                  </span>
                  <div className="flex-1 bg-surface-dim rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        background: uxColor(e.app.ux.score),
                        width: `${e.app.ux.score}%`,
                        opacity: 0.75,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold min-w-[30px] text-right tabular-nums"
                    style={{ color: uxColor(e.app.ux.score) }}
                  >
                    {e.app.ux.score}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* App detail table */}
      <Card className="!p-0 overflow-hidden animate-fade-in-up stagger-3">
        <div className="px-5 py-3 border-b border-border">
          <Label>All Applications — Live Status</Label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-dim/50">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    onClick={
                      col.sortable && col.key
                        ? () => handleSort(col.key as SortKey)
                        : undefined
                    }
                    className={`px-4 py-2.5 text-left text-txt-dim font-semibold font-display text-[11px] tracking-[0.04em] whitespace-nowrap ${
                      col.sortable ? "cursor-pointer hover:text-txt select-none" : ""
                    }`}
                  >
                    {col.label}
                    {col.sortable && col.key ? sortIndicator(col.key as SortKey) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr
                  key={e.app.id}
                  onClick={() => onSelect(e.app)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(e.app);
                    }
                  }}
                  tabIndex={0}
                  className="border-b border-border cursor-pointer transition-colors hover:bg-brand-light/30 focus-visible:bg-brand-light/30 focus-visible:outline-none"
                >
                  <td className="px-4 py-3 text-txt font-semibold">
                    {e.app.name}
                  </td>
                  <td className="px-4 py-3 text-txt-muted">{e.app.type}</td>
                  <td className="px-4 py-3 text-txt font-mono tabular-nums">
                    {e.app.metrics.mau.toLocaleString()}
                  </td>
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums"
                    style={{ color: rtColor(e.app.metrics.responseMs) }}
                  >
                    {e.app.metrics.responseMs}ms
                  </td>
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums"
                    style={{
                      color:
                        e.app.metrics.uptime < 99
                          ? "var(--color-red)"
                          : "var(--color-green)",
                    }}
                  >
                    {e.app.metrics.uptime}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      color={e.budget.levelColor}
                      bg={`color-mix(in oklch, ${e.budget.levelColor} 10%, transparent)`}
                    >
                      {e.budget.pct}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Pill
                      label={e.budget.level}
                      color={e.budget.levelColor}
                      bg={`color-mix(in oklch, ${e.budget.levelColor} 10%, transparent)`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-surface-dim rounded-full h-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: uxColor(e.app.ux.score),
                            width: `${e.app.ux.score}%`,
                            opacity: 0.75,
                          }}
                        />
                      </div>
                      <span className="text-txt-muted font-mono text-[11px] font-semibold tabular-nums">
                        {e.app.ux.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-txt-dim text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    &rarr;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
