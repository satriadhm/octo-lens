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
  if (score >= 70) return "var(--color-green)";
  if (score >= 50) return "var(--color-amber)";
  return "var(--color-red)";
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
];

export function UXTab({ app }: UXTabProps) {
  const uxColor = scoreColor(app.ux.score);
  const uxTrend = app.ux.history.map((v, i) => ({
    m: MONTH_LABELS[i] ?? `M${i + 1}`,
    score: v,
  }));
  const gradientId = `uxGrad-${app.id}`;

  return (
    <div className="flex flex-col gap-4">
      {/* UX hero */}
      <div className="flex gap-4 items-center bg-surface border border-border rounded-xl p-4">
        <UXRing score={app.ux.score} size={80} />
        <div>
          <Label>UX Health Index</Label>
          <div
            className="text-xl font-display font-extrabold"
            style={{ color: uxColor }}
          >
            {app.ux.score}/100
          </div>
          <div className="text-xs text-txt-muted mt-1">
            {app.ux.feedbackPos.toLocaleString()} positive of{" "}
            {app.ux.feedbackTotal.toLocaleString()} total feedback
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div>
        <Label>10-Month Trend</Label>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={uxTrend}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={uxColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={uxColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="m"
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip unit="" />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke={uxColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              name="UX Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-feature bars */}
      <div>
        <Label>Score per Feature</Label>
        <div className="flex flex-col gap-2.5 mt-1">
          {app.ux.byFeature.map((f, i) => {
            const fc = scoreColor(f.s);
            return (
              <div key={i}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-txt font-medium">{f.f}</span>
                  <span
                    className="text-xs font-mono font-semibold tabular-nums"
                    style={{ color: fc }}
                  >
                    {f.s}%
                  </span>
                </div>
                <div className="bg-surface-dim rounded-full h-1.5">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      background: fc,
                      width: `${f.s}%`,
                      opacity: 0.75,
                    }}
                  />
                </div>
                {f.s < 35 && (
                  <div className="text-[11px] text-danger mt-0.5 font-medium">
                    Poor UX — needs immediate investigation
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
