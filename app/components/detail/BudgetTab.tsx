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
    { label: "TERPAKAI", value: `${budget.spent}M`, color: "#2563EB" },
    { label: "PROYEKSI AKHIR", value: `${budget.proj}M`, color: budget.levelColor },
    { label: "BUDGET TOTAL", value: `${budget.total}M`, color: "var(--color-text-muted)" },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Alert banner */}
      {budget.level !== "SAFE" && (
        <div
          className="rounded-lg px-3 py-2.5"
          style={{
            background: budget.levelColor + "12",
            border: `1px solid ${budget.levelColor}40`,
            borderLeft: `4px solid ${budget.levelColor}`,
          }}
        >
          <div className="text-[11px] font-bold mb-0.5" style={{ color: budget.levelColor }}>
            {budget.level === "CRITICAL"
              ? "\u26A0 Budget Alert: CRITICAL"
              : "\u26A1 Budget Alert: WARNING"}
          </div>
          <div className="text-[11px] text-txt-muted">
            {budget.breach
              ? `Prediksi over budget di bulan ke-${budget.breach.month}. Sisa ${budget.breach.month - budget.n} bulan lagi.`
              : `Proyeksi akhir ${budget.proj}M dari budget ${budget.total}M.`}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {summaryCards.map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-3 py-2.5">
            <Label color={s.color}>{s.label}</Label>
            <div className="text-sm font-bold font-mono" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div>
        <Label>AKTUAL vs PROYEKSI (dalam juta Rp)</Label>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={budget.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="m"
              tick={{ fontSize: 9, fill: "var(--color-text-muted)" }}
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
              dataKey="actual"
              fill="#2563EB50"
              stroke="#2563EB"
              strokeWidth={1}
              name="Aktual"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="proj"
              fill={budget.levelColor + "30"}
              stroke={budget.levelColor}
              strokeWidth={1}
              strokeDasharray="3 3"
              name="Proyeksi"
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="cumAct"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              name="Kumulatif Aktual"
            />
            <Line
              type="monotone"
              dataKey="cumProj"
              stroke={budget.levelColor}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Kumulatif Proyeksi"
            />
            <ReferenceLine
              y={budget.total}
              stroke="#DC2626"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: "Budget Ceiling",
                fill: "#DC2626",
                fontSize: 9,
                position: "insideTopRight" as const,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
