"use client";

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

interface OpsViewProps {
  enriched: EnrichedApp[];
  onSelect: (app: App) => void;
}

function rtColor(ms: number) {
  if (ms > 700) return "#DC2626";
  if (ms > 400) return "#D97706";
  return "#059669";
}

function uxColor(score: number) {
  if (score >= 70) return "#059669";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

export function OpsView({ enriched, onSelect }: OpsViewProps) {
  const rtData = enriched.map((e) => ({
    name: e.app.shortName,
    ms: e.app.metrics.responseMs,
    fill: rtColor(e.app.metrics.responseMs),
  }));

  const avgResponse = Math.round(
    enriched.reduce((s, e) => s + e.app.metrics.responseMs, 0) / enriched.length,
  );
  const slowest = [...enriched].sort(
    (a, b) => b.app.metrics.responseMs - a.app.metrics.responseMs,
  )[0];
  const minUptime = Math.min(...enriched.map((e) => e.app.metrics.uptime));
  const totalMAU = enriched.reduce((s, e) => s + e.app.metrics.mau, 0);

  const kpis = [
    { l: "AVG RESPONSE", v: `${avgResponse}ms`, c: "#2563EB" },
    { l: "SLOWEST APP", v: slowest.app.shortName, c: "#D97706" },
    { l: "MIN UPTIME", v: `${minUptime}%`, c: "#EA580C" },
    { l: "TOTAL MAU", v: totalMAU.toLocaleString(), c: "#059669" },
  ];

  return (
    <div className="p-5 flex flex-col gap-4 overflow-y-auto h-full">
      {/* Ops KPI */}
      <div className="grid grid-cols-4 gap-2.5">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-surface rounded-[10px] px-3.5 py-3 border border-border shadow-sm"
            style={{ borderTop: `3px solid ${k.c}` }}
          >
            <Label color={k.c}>{k.l}</Label>
            <div className="text-xl font-extrabold font-mono" style={{ color: k.c }}>
              {k.v}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <Label>RESPONSE TIME per APLIKASI (ms)</Label>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rtData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--color-text-muted)" }} tickFormatter={(v: number) => `${v}ms`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit="ms" />} />
              <ReferenceLine
                y={500}
                stroke="#D97706"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: "500ms SLA", fill: "#D97706", fontSize: 9 }}
              />
              <Bar dataKey="ms" radius={[5, 5, 0, 0]} name="Response time">
                {rtData.map((d, i) => (
                  <Cell key={i} fill={d.fill + "cc"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>UX HEALTH SCORE per APLIKASI</Label>
          <div className="flex flex-col gap-2 mt-2.5">
            {[...enriched]
              .sort((a, b) => b.app.ux.score - a.app.ux.score)
              .map((e) => {
                const c = uxColor(e.app.ux.score);
                return (
                  <div
                    key={e.app.id}
                    onClick={() => onSelect(e.app)}
                    className="flex gap-2.5 items-center cursor-pointer"
                  >
                    <span className="text-[11px] text-txt font-medium min-w-[100px]">
                      {e.app.shortName}
                    </span>
                    <div className="flex-1 bg-surface-dim rounded h-2">
                      <div
                        className="h-full rounded transition-[width] duration-500"
                        style={{ background: c, width: `${e.app.ux.score}%` }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-mono font-bold min-w-[30px] text-right"
                      style={{ color: c }}
                    >
                      {e.app.ux.score}
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* App detail table */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-brand-light">
          <Label color="#CC1122">SEMUA APLIKASI — LIVE STATUS</Label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-border bg-surface-dim">
                {["Aplikasi", "Type", "MAU", "Response", "Uptime", "ROI", "Budget", "UX", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-3.5 py-2 text-left text-txt-dim font-semibold font-mono text-[9px] tracking-[0.1em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {enriched.map((e) => (
                <tr
                  key={e.app.id}
                  onClick={() => onSelect(e.app)}
                  className="border-b border-border cursor-pointer transition-colors hover:bg-brand-light"
                >
                  <td className="px-3.5 py-2.5 text-txt font-semibold">{e.app.name}</td>
                  <td className="px-3.5 py-2.5 text-txt-muted">{e.app.type}</td>
                  <td className="px-3.5 py-2.5 text-txt font-mono">
                    {e.app.metrics.mau.toLocaleString()}
                  </td>
                  <td
                    className="px-3.5 py-2.5 font-mono font-bold"
                    style={{ color: rtColor(e.app.metrics.responseMs) }}
                  >
                    {e.app.metrics.responseMs}ms
                  </td>
                  <td
                    className="px-3.5 py-2.5 font-mono font-bold"
                    style={{ color: e.app.metrics.uptime < 99 ? "#DC2626" : "#059669" }}
                  >
                    {e.app.metrics.uptime}%
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge color={e.roi.color} bg={e.roi.bg}>
                      {e.roi.pct}%
                    </Badge>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Pill
                      label={e.budget.level}
                      color={e.budget.levelColor}
                      bg={e.budget.levelColor + "18"}
                    />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-11 bg-surface-dim rounded-sm h-1.5">
                        <div
                          className="h-full rounded-sm"
                          style={{
                            background: uxColor(e.app.ux.score),
                            width: `${e.app.ux.score}%`,
                          }}
                        />
                      </div>
                      <span className="text-txt-muted font-mono text-[10px] font-semibold">
                        {e.app.ux.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-brand text-sm font-bold">&rarr;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
