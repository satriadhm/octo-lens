"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { SLOW_QUERIES, TOP_USERS } from "@/app/lib/data";
import { MethodBadge } from "@/app/components/shared/MethodBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { SourceTag } from "@/app/components/shared/SourceTag";
import { UsageHeatmap } from "@/app/components/ops/UsageHeatmap";
import { rtColor, uxColor, errorRateColor } from "@/app/lib/utils";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import {
  AITechnicalSummary,
  type FocusArea,
} from "@/app/components/ops/AITechnicalSummary";

interface OpsViewProps {
  enriched: EnrichedApp[];
  onSelect: (app: App) => void;
}

type SortKey = "name" | "mau" | "response" | "uptime" | "budgetPct" | "ux" | "totalReq" | "p95" | "errorRate";
type SortDir = "asc" | "desc";

function formatBytes(bytes: number | undefined): string {
  if (!bytes) return "-";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${bytes} B`;
}

function actionTone(action: "http" | "file-transfer" | "db") {
  if (action === "db") {
    return {
      color: "var(--color-amber)",
      bg: "color-mix(in oklch, var(--color-amber) 12%, transparent)",
    };
  }
  if (action === "file-transfer") {
    return {
      color: "var(--color-blue)",
      bg: "color-mix(in oklch, var(--color-blue) 12%, transparent)",
    };
  }
  return {
    color: "var(--color-green)",
    bg: "color-mix(in oklch, var(--color-green) 12%, transparent)",
  };
}

function PaginationStub({ total = 25, pageSize = 6 }: { total?: number; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-[11px] text-txt-dim border-t border-border">
      <span className="text-[11px] text-txt-dim">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p: number) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="h-7 w-7 rounded-md border border-border hover:bg-surface-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
          aria-label="Previous page"
        >
          {"<"}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`h-7 min-w-7 px-2 rounded-md transition-colors text-[11px] ${
              p === page
                ? "bg-brand text-white"
                : "border border-border hover:bg-surface-dim text-txt-dim"
            }`}
            type="button"
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="h-7 w-7 rounded-md border border-border hover:bg-surface-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
          aria-label="Next page"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export function OpsView({ enriched, onSelect }: OpsViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [appFilter, setAppFilter] = useState("");

  const rtData = enriched.map((e) => ({
    name: e.app.shortName,
    ms: e.app.metrics.responseMs,
  }));

  const avgResponse = Math.round(
    enriched.reduce((s, e) => s + e.app.metrics.responseMs, 0) /
      enriched.length,
  );
  const minUptime = Math.min(...enriched.map((e) => e.app.metrics.uptime));
  const totalMAU = enriched.reduce((s, e) => s + e.app.metrics.mau, 0);
  const totalRequests = enriched.reduce(
    (sum, entry) => sum + (entry.app.metrics.totalRequests ?? entry.app.api.totalReqs),
    0,
  );
  const errorWeighted = enriched.reduce((sum, entry) => {
    const requests = entry.app.metrics.totalRequests ?? entry.app.api.totalReqs;
    const errorRate = entry.app.metrics.errorRate ?? 0;
    return sum + requests * errorRate;
  }, 0);
  const weightedErrorRate = totalRequests > 0 ? errorWeighted / totalRequests : 0;
  const portfolioP95 = Math.round(
    enriched.reduce((sum, entry) => sum + (entry.app.metrics.p95Ms ?? entry.app.metrics.responseMs), 0) /
      Math.max(1, enriched.length),
  );

  const kpis = [
    { l: "Avg Response", v: `${avgResponse}ms`, c: "var(--color-blue)" },
    { l: "Total Requests", v: totalRequests.toLocaleString(), c: "var(--color-blue)" },
    { l: "Error Rate", v: `${weightedErrorRate.toFixed(2)}%`, c: errorRateColor(weightedErrorRate) },
    { l: "P95 Portfolio", v: `${portfolioP95}ms`, c: "var(--color-amber)" },
    { l: "Min Uptime", v: `${minUptime}%`, c: "var(--color-orange)" },
    { l: "Total MAU", v: totalMAU.toLocaleString(), c: "var(--color-green)" },
  ];

  const endpointLatencyRows = enriched
    .flatMap((entry) =>
      entry.app.api.endpoints.map((endpoint) => ({
        app: entry.app,
        path: endpoint.path,
        method: endpoint.method ?? "GET",
        p95Ms: endpoint.p95Ms ?? entry.app.metrics.p95Ms ?? entry.app.metrics.responseMs,
        status: endpoint.status ?? 200,
        calls: endpoint.calls,
      })),
    )
    .sort((a, b) => b.p95Ms - a.p95Ms);
  const topEndpointP95 = endpointLatencyRows.slice(0, 5);
  const topServiceP95 = [...enriched]
    .sort(
      (a, b) =>
        (b.app.metrics.p95Ms ?? b.app.metrics.responseMs) -
        (a.app.metrics.p95Ms ?? a.app.metrics.responseMs),
    )
    .slice(0, 5);

  const hourlyAggregate = Array.from({ length: 24 }, (_, idx) => {
    const hour = `${String(idx).padStart(2, "0")}:00`;
    const slot = enriched.map((entry) => entry.app.metrics.hourlyP95?.[idx]);
    const totalHits = slot.reduce((sum, value) => sum + (value?.hits ?? 0), 0);
    const p95Avg = Math.round(
      slot.reduce((sum, value) => sum + (value?.p95 ?? 0), 0) / Math.max(1, slot.length),
    );
    return { h: hour, p95: p95Avg, hits: totalHits };
  });

  const usageHeatmap = Array.from({ length: 70 }, (_, idx) =>
    enriched.reduce((sum, entry) => sum + (entry.app.metrics.dailyActivity?.[idx] ?? 0), 0),
  );

  const slowEndpoints = endpointLatencyRows
    .filter((row) => row.p95Ms > 500)
    .slice(0, 6)
    .map((row, idx) => ({
      ...row,
      createdAt: SLOW_QUERIES[idx % SLOW_QUERIES.length]?.createdAt ?? new Date().toISOString(),
    }));

  const monthlyUsageByTeam = Object.entries(
    enriched.reduce<Record<string, { totalReq: number; totalFiles: number; totalFileSize: number; avgRes: number }>>(
      (acc, entry) => {
        const team = entry.app.team;
        const totalReq = entry.app.metrics.totalRequests ?? entry.app.api.totalReqs;
        const totalFileSize = entry.app.metrics.requestBytes ?? 0;
        const teamUsers = TOP_USERS.filter((user) => user.group === team);
        const totalFiles = teamUsers.reduce((sum, user) => sum + (user.totalFiles ?? 0), 0);
        if (!acc[team]) {
          acc[team] = { totalReq: 0, totalFiles: 0, totalFileSize: 0, avgRes: 0 };
        }
        acc[team].totalReq += totalReq;
        acc[team].totalFiles += totalFiles;
        acc[team].totalFileSize += totalFileSize;
        acc[team].avgRes += entry.app.metrics.responseMs;
        return acc;
      },
      {},
    ),
  )
    .map(([group, value]) => ({
      month: "April 2026",
      group,
      totalReq: value.totalReq,
      percentage: totalRequests > 0 ? (value.totalReq / totalRequests) * 100 : 0,
      totalFiles: value.totalFiles,
      totalFileSize: value.totalFileSize,
      avgUploadDuration: Math.round(value.avgRes / Math.max(1, enriched.filter((e) => e.app.team === group).length)),
    }))
    .sort((a, b) => b.totalReq - a.totalReq);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...enriched]
    .filter((e) =>
      appFilter.trim() === "" ||
      e.app.name.toLowerCase().includes(appFilter.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name": return a.app.name.localeCompare(b.app.name) * dir;
        case "mau": return (a.app.metrics.mau - b.app.metrics.mau) * dir;
        case "response": return (a.app.metrics.responseMs - b.app.metrics.responseMs) * dir;
        case "uptime": return (a.app.metrics.uptime - b.app.metrics.uptime) * dir;
        case "budgetPct": return (a.budget.pct - b.budget.pct) * dir;
        case "ux": return (a.app.ux.score - b.app.ux.score) * dir;
        case "totalReq":
          return (
            ((a.app.metrics.totalRequests ?? a.app.api.totalReqs) -
              (b.app.metrics.totalRequests ?? b.app.api.totalReqs)) * dir
          );
        case "p95":
          return (
            ((a.app.metrics.p95Ms ?? a.app.metrics.responseMs) -
              (b.app.metrics.p95Ms ?? b.app.metrics.responseMs)) * dir
          );
        case "errorRate":
          return (
            ((a.app.metrics.errorRate ?? 0) - (b.app.metrics.errorRate ?? 0)) * dir
          );
        default: return 0;
      }
    });

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const columns: { key: SortKey | ""; label: string; sortable: boolean }[] = [
    { key: "name", label: "Application", sortable: true },
    { key: "", label: "Type", sortable: false },
    { key: "mau", label: "MAU", sortable: true },
    { key: "totalReq", label: "Total Req", sortable: true },
    { key: "response", label: "Avg Res", sortable: true },
    { key: "p95", label: "P95 (ms)", sortable: true },
    { key: "errorRate", label: "Error %", sortable: true },
    { key: "uptime", label: "Uptime", sortable: true },
    { key: "budgetPct", label: "Budget %", sortable: true },
    { key: "", label: "Budget", sortable: false },
    { key: "ux", label: "UX", sortable: true },
    { key: "", label: "", sortable: false },
  ];

  function handleFocusArea(area: FocusArea) {
    const targetId =
      area === "latency"
        ? "ops-latency"
        : area === "errors"
          ? "ops-kpis"
          : "ops-app-status";
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("ring-2", "ring-brand/40", "rounded-xl");
    window.setTimeout(() => {
      el.classList.remove("ring-2", "ring-brand/40", "rounded-xl");
    }, 1600);
    if (area === "zombie") {
      setSortKey("totalReq");
      setSortDir("asc");
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 flex flex-col gap-7 overflow-y-auto h-full max-w-[1600px] mx-auto w-full">
      {/* Narrative */}
      <div className="animate-fade-in-up relative z-[110] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-txt mb-1">
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

      {/* AI Technical Summary */}
      <AITechnicalSummary enriched={enriched} onFocusArea={handleFocusArea} />

      {/* Ops KPI */}
      <div id="ops-kpis" className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4 animate-fade-in-up stagger-1">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 border border-border min-h-[88px] flex flex-col justify-center"
          >
            <Label>{k.l}</Label>
            <div
              className="text-lg sm:text-xl font-display font-extrabold"
              style={{ color: k.c }}
            >
              {k.v}
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Service Health" subtitle="Response time and UX scores across all applications" />

      {/* Charts row */}
      <div id="ops-service-health" className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-up stagger-2">
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

      <SectionHeader title="Application Status" subtitle="Sortable live metrics — click any row for details" />

      {/* App detail table */}
      <div id="ops-app-status">
        <Card className="!p-0 overflow-hidden animate-fade-in-up stagger-3">
        <div className="px-5 py-3 border-b border-border">
          <Label>All Applications — Live Status</Label>
        </div>
        <div className="px-4 py-2.5 border-b border-border bg-surface-dim/30">
          <input
            type="search"
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            placeholder="Filter by application name…"
            className="w-full max-w-xs text-xs bg-surface border border-border rounded-md px-3 py-1.5 text-txt placeholder:text-txt-dim outline-none focus:border-brand/50 transition-colors font-sans"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
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
                  className="group border-b border-border cursor-pointer transition-colors hover:bg-brand-light/30 focus-visible:bg-brand-light/30 focus-visible:outline-none"
                >
                  {/* Application */}
                  <td className="px-4 py-3 text-txt font-semibold whitespace-nowrap">
                    {e.app.name}
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3 text-txt-muted whitespace-nowrap">{e.app.type}</td>
                  {/* MAU */}
                  <td className="px-4 py-3 text-txt font-mono tabular-nums whitespace-nowrap">
                    {e.app.metrics.mau.toLocaleString()}
                  </td>
                  {/* Total Requests */}
                  <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap text-txt-muted">
                    {(e.app.metrics.totalRequests ?? e.app.api.totalReqs).toLocaleString()}
                  </td>
                  {/* Avg Response */}
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums whitespace-nowrap"
                    style={{ color: rtColor(e.app.metrics.responseMs) }}
                  >
                    {e.app.metrics.responseMs}ms
                  </td>
                  {/* P95 */}
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums whitespace-nowrap"
                    style={{ color: rtColor(e.app.metrics.p95Ms ?? e.app.metrics.responseMs) }}
                  >
                    {(e.app.metrics.p95Ms ?? e.app.metrics.responseMs).toLocaleString()}ms
                  </td>
                  {/* Error Rate */}
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums whitespace-nowrap"
                    style={{ color: errorRateColor(e.app.metrics.errorRate ?? 0) }}
                  >
                    {(e.app.metrics.errorRate ?? 0).toFixed(2)}%
                  </td>
                  {/* Uptime */}
                  <td
                    className="px-4 py-3 font-mono font-semibold tabular-nums whitespace-nowrap"
                    style={{
                      color:
                        e.app.metrics.uptime < 99
                          ? "var(--color-red)"
                          : "var(--color-green)",
                    }}
                  >
                    {e.app.metrics.uptime}%
                  </td>
                  {/* Budget % */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      color={e.budget.levelColor}
                      bg={`color-mix(in oklch, ${e.budget.levelColor} 10%, transparent)`}
                    >
                      {e.budget.pct}%
                    </Badge>
                  </td>
                  {/* Budget level */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Pill
                      label={e.budget.level}
                      color={e.budget.levelColor}
                      bg={`color-mix(in oklch, ${e.budget.levelColor} 10%, transparent)`}
                    />
                  </td>
                  {/* UX */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-surface-dim rounded-full h-1.5 flex-shrink-0">
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
                  {/* Arrow */}
                  <td
                    className="px-4 py-3 text-txt-dim text-sm opacity-60 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden
                  >
                    &rarr;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </Card>
      </div>

      <SectionHeader title="Latency Hotspots" subtitle="Top endpoints and services by P95 response time" />

      {/* Latency hotspots */}
      <div id="ops-latency" className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-up stagger-4">
        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/trace/p95-endpoint" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Top Endpoint P95</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Method</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Endpoint</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Req</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">P95 (ms)</th>
                </tr>
              </thead>
              <tbody>
                {topEndpointP95.map((row) => (
                  <tr
                    key={`${row.app.id}-${row.path}`}
                    className="border-b border-border hover:bg-brand-light/30 cursor-pointer"
                    onClick={() => onSelect(row.app)}
                  >
                    <td className="px-4 py-2.5">
                      <MethodBadge method={row.method} />
                    </td>
                    <td className="px-4 py-2.5 text-txt-muted font-mono">{row.path}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.calls.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: rtColor(row.p95Ms) }}>
                      {row.p95Ms.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/trace/p95-service" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Top Service P95</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Application</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Req</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">P95 (ms)</th>
                </tr>
              </thead>
              <tbody>
                {topServiceP95.map((entry) => (
                  <tr
                    key={entry.app.id}
                    className="border-b border-border hover:bg-brand-light/30 cursor-pointer"
                    onClick={() => onSelect(entry.app)}
                  >
                    <td className="px-4 py-2.5 text-txt">{entry.app.shortName}</td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {(entry.app.metrics.totalRequests ?? entry.app.api.totalReqs).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-2.5 tabular-nums font-semibold"
                      style={{ color: rtColor(entry.app.metrics.p95Ms ?? entry.app.metrics.responseMs) }}
                    >
                      {(entry.app.metrics.p95Ms ?? entry.app.metrics.responseMs).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SectionHeader title="Traffic Patterns" subtitle="Hourly P95 trend and daily activity distribution" />

      {/* P95 trend + heatmap — always side by side from lg up */}
      <div id="ops-traffic" className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-up stagger-5">
        <Card className="relative">
          <SourceTag source="/trace/p95-hourly" />
          <Label>P95 API Hourly</Label>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyAggregate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="latency"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickFormatter={(value: number) => `${value}ms`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="hits"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line yAxisId="latency" type="monotone" dataKey="p95" stroke="var(--color-blue)" strokeWidth={2} dot={false} />
              <Line yAxisId="hits" type="monotone" dataKey="hits" stroke="var(--color-red)" strokeWidth={1.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="relative flex flex-col">
          <SourceTag source="/custom-telemetry/group-usage" />
          <Label>Group Usage Heatmap</Label>
          <div className="flex-1 flex flex-col justify-center">
            <UsageHeatmap values={usageHeatmap} />
          </div>
        </Card>
      </div>

      <SectionHeader title="Slow Operations" subtitle="Queries and endpoints above 500ms threshold" />

      {/* Slow query / slow endpoint */}
      <div id="ops-slow-ops" className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-up stagger-6">
        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/custom-telemetry/slow-query" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Slow Query (above 500 ms, limit 25)</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Action</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Duration (ms)</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Group</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Created At</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">End Point</th>
                </tr>
              </thead>
              <tbody>
                {SLOW_QUERIES.slice(0, 6).map((query) => {
                  const tone = actionTone(query.action);
                  return (
                    <tr key={`${query.endpoint}-${query.createdAt}`} className="border-b border-border">
                      <td className="px-4 py-2.5">
                        <Pill label={query.action} color={tone.color} bg={tone.bg} />
                      </td>
                      <td className="px-4 py-2.5 tabular-nums font-semibold">{query.durationMs}</td>
                      <td className="px-4 py-2.5">{query.group}</td>
                      <td className="px-4 py-2.5 text-txt-muted">{new Date(query.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-txt-muted">{query.endpoint}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationStub />
        </Card>

        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/custom-telemetry/slow-endpoint" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Slow Endpoint (above 500 ms, limit 25)</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Method</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">EndPoint</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">AppInfo</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Response Time (ms)</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {slowEndpoints.map((row) => (
                  <tr
                    key={`${row.app.id}-${row.path}`}
                    className="border-b border-border"
                    title={new Date(row.createdAt).toLocaleString()}
                  >
                    <td className="px-4 py-2.5">
                      <MethodBadge method={row.method} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-txt-muted">{row.path}</td>
                    <td className="px-4 py-2.5">{row.app.shortName}</td>
                    <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: rtColor(row.p95Ms) }}>
                      {row.p95Ms.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationStub />
        </Card>
      </div>

      <SectionHeader title="Usage & Consumers" subtitle="Top users and team-level request distribution" />

      {/* Top users / monthly usage */}
      <div id="ops-usage" className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-up stagger-7">
        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/custom-telemetry/top-users" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Top Users</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">User</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Group</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Req</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Avg Res (ms)</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Files</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total File Size</th>
                </tr>
              </thead>
              <tbody>
                {TOP_USERS.slice(0, 6).map((row, idx) => (
                  <tr key={`${row.user}-${idx}`} className="border-b border-border">
                    <td className="px-4 py-2.5 text-txt">{row.user}</td>
                    <td className="px-4 py-2.5">{row.group}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.totalReq.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.avgResMs.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.totalFiles ?? "-"}</td>
                    <td className="px-4 py-2.5">{formatBytes(row.totalFileSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationStub />
        </Card>

        <Card className="relative !p-0 overflow-hidden">
          <SourceTag source="/custom-telemetry/group-usage" />
          <div className="px-5 py-3 border-b border-border">
            <Label>Monthly Usage by Team — April 2026</Label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-dim/50">
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Group</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Request</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Percentage</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total Files</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Total File Size</th>
                  <th className="px-4 py-2.5 text-left text-txt-dim font-semibold text-[11px]">Avg Response (ms)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyUsageByTeam.map((row) => (
                  <tr key={row.group} className="border-b border-border">
                    <td className="px-4 py-2.5">{row.group}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.totalReq.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.totalFiles.toLocaleString()}</td>
                    <td className="px-4 py-2.5">{formatBytes(row.totalFileSize)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.avgUploadDuration.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationStub />
        </Card>
      </div>
    </div>
  );
}
