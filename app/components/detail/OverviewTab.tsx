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
    { name: "Total Cost", value: Math.round(app.cost.total / 1e6), fill: "#DC2626" },
    { name: "Business Value", value: Math.round(app.value.totalRevenue / 1e6), fill: "#059669" },
  ];

  const stats = [
    { label: "MAU", value: app.metrics.mau.toLocaleString("id-ID") },
    { label: "Response Time", value: `${app.metrics.responseMs}ms` },
    { label: "Uptime", value: `${app.metrics.uptime}%` },
    { label: "Team", value: app.team },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* ROI hero */}
      <div
        className="rounded-[10px] p-4 flex justify-between items-center"
        style={{
          background: roi.bg,
          border: `1px solid ${roi.color}40`,
          borderLeft: `4px solid ${roi.color}`,
        }}
      >
        <div>
          <Label color={roi.color}>ROI SCORE</Label>
          <div
            className="text-[42px] font-extrabold font-mono leading-none"
            style={{ color: roi.color }}
          >
            {roi.pct > 0 ? "+" : ""}
            {roi.pct}%
          </div>
          <div className="text-[11px] mt-1" style={{ color: roi.color + "bb" }}>
            Net value: {idr(roi.netValue)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-txt-muted mb-1.5">vs bulan lalu</div>
          <div
            className="text-[22px] font-mono font-extrabold"
            style={{ color: roi.trend >= 0 ? "#059669" : "#DC2626" }}
          >
            {roi.trend >= 0 ? "+" : ""}
            {roi.trend}%
          </div>
        </div>
      </div>

      {/* Cost vs Value chart */}
      <div>
        <Label>COST vs VALUE BREAKDOWN</Label>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--color-text-muted)" }}
              tickFormatter={(v: number) => `${v}M`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="value"
              radius={[5, 5, 0, 0]}
              label={{
                position: "top" as const,
                fontSize: 10,
                fill: "var(--color-text-muted)",
                formatter: (v: unknown) => `${v}M`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-3 py-2.5">
            <Label>{s.label}</Label>
            <div className="text-sm font-bold text-txt font-mono">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
