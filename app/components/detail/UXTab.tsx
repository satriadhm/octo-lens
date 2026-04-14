"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { App } from "@/app/lib/types";
import { Label } from "@/app/components/shared/Card";
import { UXRing } from "@/app/components/shared/UXRing";
import { ChartTooltip } from "@/app/components/shared/ChartTooltip";

interface UXTabProps {
  app: App;
}

function scoreColor(score: number) {
  if (score >= 70) return "#059669";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

export function UXTab({ app }: UXTabProps) {
  const uxColor = scoreColor(app.ux.score);
  const uxTrend = app.ux.history.map((v, i) => ({ m: `B${i + 1}`, score: v }));
  const gradientId = `uxGrad-${app.id}`;

  return (
    <div className="flex flex-col gap-3.5">
      {/* UX hero */}
      <div className="flex gap-3.5 items-center bg-surface border border-border rounded-[10px] p-3.5">
        <UXRing score={app.ux.score} size={80} />
        <div>
          <Label>UX HEALTH INDEX</Label>
          <div className="text-[22px] font-extrabold font-mono" style={{ color: uxColor }}>
            {app.ux.score}/100
          </div>
          <div className="text-[11px] text-txt-muted mt-1">
            {app.ux.feedbackPos.toLocaleString()} positive dari{" "}
            {app.ux.feedbackTotal.toLocaleString()} total feedback
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div>
        <Label>TREN 10 BULAN</Label>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={uxTrend}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={uxColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={uxColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="m"
              tick={{ fontSize: 9, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip unit="" />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke={uxColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              name="UX Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-feature bars */}
      <div>
        <Label>SCORE PER FITUR</Label>
        {app.ux.byFeature.map((f, i) => {
          const fc = scoreColor(f.s);
          return (
            <div key={i} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <span className="text-[11px] text-txt font-medium">{f.f}</span>
                <span className="text-[11px] font-mono font-bold" style={{ color: fc }}>
                  {f.s}%
                </span>
              </div>
              <div className="bg-surface-dim rounded h-1.5">
                <div
                  className="h-full rounded transition-[width] duration-500"
                  style={{ background: fc, width: `${f.s}%` }}
                />
              </div>
              {f.s < 35 && (
                <div className="text-[9px] text-danger mt-0.5 font-mono">
                  &#9888; UX buruk — perlu investigasi segera
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
