"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { App, ROIResult } from "@/app/lib/types";
import { idr } from "@/app/lib/calculators";
import { Label } from "@/app/components/shared/Card";
import { ChartTooltip } from "@/app/components/shared/ChartTooltip";

interface OverviewTabProps {
  app: App;
  roi: ROIResult;
}

export function OverviewTab({ app, roi }: OverviewTabProps) {
  const chartData = [
    {
      name: "Total Cost",
      value: Math.round(app.cost.total / 1e6),
      fill: "var(--color-red)",
    },
    {
      name: "Business Value",
      value: Math.round(app.value.totalRevenue / 1e6),
      fill: "var(--color-green)",
    },
  ];

  const stats = [
    { label: "MAU", value: app.metrics.mau.toLocaleString("en-US") },
    { label: "Response Time", value: `${app.metrics.responseMs}ms` },
    { label: "Uptime", value: `${app.metrics.uptime}%` },
    { label: "Team", value: app.team },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ROI hero — background tint instead of border-left */}
      <div
        className="rounded-xl p-5 flex justify-between items-center"
        style={{
          background: roi.bg,
          border: `1px solid ${roi.color}25`,
        }}
      >
        <div>
          <Label color={roi.color}>ROI Score</Label>
          <div
            className="text-3xl font-display font-extrabold leading-none"
            style={{ color: roi.color }}
          >
            {roi.pct > 0 ? "+" : ""}
            {roi.pct}%
          </div>
          <div
            className="text-xs mt-1.5"
            style={{ color: `color-mix(in oklch, ${roi.color} 80%, transparent)` }}
          >
            Net value: {idr(roi.netValue)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-txt-muted mb-1.5">vs last month</div>
          <div
            className="text-xl font-display font-extrabold"
            style={{
              color:
                roi.trend >= 0 ? "var(--color-green)" : "var(--color-red)",
            }}
          >
            {roi.trend >= 0 ? "+" : ""}
            {roi.trend}%
          </div>
        </div>
      </div>

      {/* Cost vs Value chart */}
      <div>
        <Label>Cost vs Value Breakdown</Label>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={48}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              tickFormatter={(v: number) => `${v}M`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.75}
              label={{
                position: "top" as const,
                fontSize: 11,
                fill: "var(--color-text-muted)",
                formatter: (v: unknown) => `${v}M`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-lg px-4 py-3"
          >
            <Label>{s.label}</Label>
            <div className="text-sm font-semibold text-txt">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
