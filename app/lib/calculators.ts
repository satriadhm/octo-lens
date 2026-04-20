import type { App, BudgetResult, BudgetChartDatum, BudgetFuture } from "./types";

export function calcBudget(app: App): BudgetResult {
  const h = app.budget.history;
  const n = h.length;
  const spent = h.reduce((a, b) => a + b, 0);
  const rem = app.budget.months - n;

  const sumX = h.reduce((a, _, i) => a + (i + 1), 0);
  const sumY = h.reduce((a, b) => a + b, 0);
  const sumXY = h.reduce((a, v, i) => a + (i + 1) * v, 0);
  const sumX2 = h.reduce((a, _, i) => a + (i + 1) ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;

  let proj = spent;
  const future: BudgetFuture[] = [];
  for (let k = 1; k <= rem; k++) {
    const s = Math.max(0, slope * (n + k) + intercept);
    proj += s;
    future.push({ month: n + k, spend: Math.round(s / 1e6), cum: Math.round(proj / 1e6) });
  }

  const overPct = Math.min(100, Math.max(0, Math.round((proj / app.budget.total - 0.8) * 250)));
  let level: BudgetResult["level"];
  let levelColor: string;

  if (overPct > 70) {
    level = "CRITICAL";
    levelColor = "#DC2626";
  } else if (overPct > 35) {
    level = "WARNING";
    levelColor = "#D97706";
  } else {
    level = "SAFE";
    levelColor = "#059669";
  }

  const breach = future.find((f) => f.cum >= app.budget.total / 1e6);

  let cumActual = 0;
  const chartData: BudgetChartDatum[] = [
    ...h.map((v, i) => {
      cumActual += v;
      return {
        m: `B${i + 1}`,
        actual: Math.round(v / 1e6),
        cumAct: Math.round(cumActual / 1e6),
        ceiling: Math.round(app.budget.total / 1e6),
      };
    }),
    ...future.map((f) => ({
      m: `B${f.month}`,
      proj: f.spend,
      cumProj: f.cum,
      ceiling: Math.round(app.budget.total / 1e6),
    })),
  ];

  return {
    spent: Math.round(spent / 1e6),
    proj: Math.round(proj / 1e6),
    total: Math.round(app.budget.total / 1e6),
    pct: Math.round((spent / app.budget.total) * 100),
    overPct,
    level,
    levelColor,
    breach,
    chartData,
    n,
    rem,
  };
}

export function idr(v: number): string {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}Jt`;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

export const COLORS = {
  brand: "#CC1122",
  brandLight: "#FFF0F0",
  brandMid: "#F9C0C0",
  green: "#059669",
  greenDim: "#D1FAE5",
  amber: "#D97706",
  amberDim: "#FEF3C7",
  red: "#DC2626",
  redDim: "#FEE2E2",
  orange: "#EA580C",
  orangeDim: "#FFEDD5",
  blue: "#2563EB",
  blueDim: "#DBEAFE",
} as const;
