"use client";

import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from "recharts";
import type { App } from "@/app/lib/types";
import {
  buildQuadrantPoints,
  idr,
  type QuadrantPoint,
} from "@/app/lib/calculators";

interface CostEfficiencyQuadrantProps {
  apps: App[];
  selectedId?: string | null;
  onSelect: (app: App) => void;
}

interface ChartDatum extends QuadrantPoint {
  x: number;
  y: number;
  z: number;
}

export function CostEfficiencyQuadrant({
  apps,
  selectedId,
  onSelect,
}: CostEfficiencyQuadrantProps) {
  const points = buildQuadrantPoints(apps);
  const maxCost = Math.max(1, ...points.map((p) => p.monthlyCost));
  const yMax = Math.ceil((maxCost * 1.1) / 1e7) * 1e7;
  const yMid = yMax / 2;
  const xMid = 50;

  const data: ChartDatum[] = points.map((p) => ({
    ...p,
    x: p.usage,
    y: p.monthlyCost,
    z: p.bubbleSize,
  }));

  return (
    <div>
      <div className="relative h-[340px] w-full">
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 52 }}>
          <defs>
            <pattern
              id="quad-grid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>

          {/* Quadrant background zones */}
          <ReferenceArea
            x1={0}
            x2={xMid}
            y1={yMid}
            y2={yMax}
            fill="color-mix(in oklch, var(--color-danger) 28%, transparent)"
            fillOpacity={0.045}
            stroke="none"
            ifOverflow="visible"
          />
          <ReferenceArea
            x1={xMid}
            x2={100}
            y1={yMid}
            y2={yMax}
            fill="color-mix(in oklch, var(--color-ok) 28%, transparent)"
            fillOpacity={0.045}
            stroke="none"
            ifOverflow="visible"
          />
          <ReferenceArea
            x1={0}
            x2={xMid}
            y1={0}
            y2={yMid}
            fill="color-mix(in oklch, var(--color-txt-dim) 22%, transparent)"
            fillOpacity={0.035}
            stroke="none"
            ifOverflow="visible"
          />
          <ReferenceArea
            x1={xMid}
            x2={100}
            y1={0}
            y2={yMid}
            fill="color-mix(in oklch, var(--color-alert) 30%, transparent)"
            fillOpacity={0.05}
            stroke="none"
            ifOverflow="visible"
          />

          <CartesianGrid
            strokeDasharray="2 4"
            stroke="var(--color-border)"
            strokeOpacity={0.6}
          />
          <ReferenceLine
            x={xMid}
            stroke="var(--color-border-hi)"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={yMid}
            stroke="var(--color-border-hi)"
            strokeDasharray="3 3"
          />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            label={{
              value: "Usage Intensity →",
              position: "insideBottom",
              offset: -18,
              fill: "var(--color-text-muted)",
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, yMax]}
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            tickFormatter={(v: number) => idr(v)}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            label={{
              value: "Monthly Cost ↑",
              angle: -90,
              position: "insideLeft",
              offset: 4,
              fill: "var(--color-text-muted)",
              fontSize: 10,
            }}
          />
          <ZAxis type="number" dataKey="z" range={[120, 520]} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<QuadrantTooltip />}
          />

          <Scatter
            data={data}
            shape="circle"
            onClick={(entry: unknown) => {
              const d = entry as { payload?: ChartDatum } | null;
              if (d?.payload?.app) onSelect(d.payload.app);
            }}
          >
            {data.map((d) => {
              const isSelected = d.app.id === selectedId;
              return (
                <Cell
                  key={d.app.id}
                  fill={d.color}
                  fillOpacity={isSelected ? 0.92 : 0.7}
                  stroke={isSelected ? "var(--color-text)" : d.color}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant watermark labels — scoped to chart bounds only */}
      <div
        className="pointer-events-none absolute inset-0 pl-[52px] pr-6 pb-9 pt-4 grid grid-cols-2 grid-rows-2 gap-1"
        aria-hidden
      >
        <div className="flex items-start justify-start min-h-0">
          <QuadrantLabel tone="danger">OVERSPENDING</QuadrantLabel>
        </div>
        <div className="flex items-start justify-end min-h-0">
          <QuadrantLabel tone="ok">EFFICIENT</QuadrantLabel>
        </div>
        <div className="flex items-end justify-start min-h-0">
          <QuadrantLabel tone="muted">IDLE</QuadrantLabel>
        </div>
        <div className="flex items-end justify-end min-h-0">
          <QuadrantLabel tone="warn">UNDERPROVISIONED</QuadrantLabel>
        </div>
      </div>
      </div>
    </div>
  );
}

function QuadrantLabel({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "danger" | "ok" | "warn" | "muted";
}) {
  const colorMap = {
    danger: "text-danger/35",
    ok: "text-ok/40",
    warn: "text-alert/38",
    muted: "text-txt-dim/45",
  } as const;
  return (
    <span
      className={`text-[10px] font-semibold tracking-[0.06em] uppercase ${colorMap[tone]}`}
    >
      {children}
    </span>
  );
}

function QuadrantTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: ChartDatum }[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-md px-3 py-2.5 text-[11px] min-w-[200px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: p.color }}
        />
        <span className="font-display font-semibold text-txt">
          {p.app.name}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 text-txt-muted">
        <Row label="Monthly cost" value={idr(p.monthlyCost)} />
        <Row label="Usage score" value={`${p.usage} / 100`} />
        <Row
          label="Infrastructure"
          value={p.app.infra?.vmSpec ?? "—"}
        />
        <Row label="Quadrant" value={p.quadrant} />
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-border text-[10px] text-txt-dim">
        Click to see AI recommendations
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="text-txt font-medium tabular-nums">{value}</span>
    </div>
  );
}
