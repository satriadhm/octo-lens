"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { BudgetResult } from "@/app/lib/types";
import { Label } from "@/app/components/shared/Card";
import { ChartTooltip } from "@/app/components/shared/ChartTooltip";

interface BudgetTabProps {
  budget: BudgetResult;
}

export function BudgetTab({ budget }: BudgetTabProps) {
  const summaryCards = [
    { label: "Spent", value: `${budget.spent}M`, color: "var(--color-blue)" },
    {
      label: "Projected End",
      value: `${budget.proj}M`,
      color: budget.levelColor,
    },
    {
      label: "Total Budget",
      value: `${budget.total}M`,
      color: "var(--color-text-muted)",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Alert banner — background tint, no border-left */}
      {budget.level !== "SAFE" && (
        <div
          className="rounded-lg px-4 py-3"
          style={{
            background: `color-mix(in oklch, ${budget.levelColor} 8%, transparent)`,
            border: `1px solid color-mix(in oklch, ${budget.levelColor} 20%, transparent)`,
          }}
        >
          <div
            className="text-xs font-semibold mb-0.5"
            style={{ color: budget.levelColor }}
          >
            {budget.level === "CRITICAL"
              ? "Budget Alert: CRITICAL"
              : "Budget Alert: WARNING"}
          </div>
          <div className="text-xs text-txt-muted">
            {budget.breach
              ? `Projected to exceed budget in month ${budget.breach.month}. ${budget.breach.month - budget.n} months remaining.`
              : `Projected end spend ${budget.proj}M against budget ${budget.total}M.`}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {summaryCards.map((s, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-lg px-4 py-3"
          >
            <Label color={s.color}>{s.label}</Label>
            <div
              className="text-sm font-semibold font-mono tabular-nums"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div>
        <Label>Actual vs Projected (in millions IDR)</Label>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={budget.chartData}>
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
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              tickFormatter={(v: number) => `${v}M`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="actual"
              fill="var(--color-blue)"
              fillOpacity={0.3}
              stroke="var(--color-blue)"
              strokeWidth={1}
              name="Actual"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="proj"
              fill={budget.levelColor}
              fillOpacity={0.2}
              stroke={budget.levelColor}
              strokeWidth={1}
              strokeDasharray="3 3"
              name="Projected"
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="cumAct"
              stroke="var(--color-blue)"
              strokeWidth={2}
              dot={false}
              name="Cumulative Actual"
            />
            <Line
              type="monotone"
              dataKey="cumProj"
              stroke={budget.levelColor}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Cumulative Projected"
            />
            <ReferenceLine
              y={budget.total}
              stroke="var(--color-red)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: "Budget Ceiling",
                fill: "var(--color-red)",
                fontSize: 10,
                position: "insideTopRight" as const,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
