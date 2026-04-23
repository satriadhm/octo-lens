import type {
  App,
  BudgetResult,
  BudgetChartDatum,
  BudgetFuture,
  EnrichedApp,
} from "./types";
import { formatForPersona, type Persona } from "./utils";

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

// ─────────────────────────────────────────────────────────────────────────────
// Cost efficiency quadrant helpers
// ─────────────────────────────────────────────────────────────────────────────

export type Quadrant = "OVERSPENDING" | "EFFICIENT" | "IDLE" | "UNDERPROVISIONED";

export interface QuadrantPoint {
  app: App;
  usage: number; // 0-100
  monthlyCost: number; // IDR
  bubbleSize: number;
  quadrant: Quadrant;
  color: string;
}

function monthlyCostOf(app: App): number {
  return app.infra?.monthlyCost ?? app.cost.opPerMonth ?? 0;
}

function rawUsageScore(app: App): number {
  const requests = app.metrics.totalRequests ?? app.api.totalReqs;
  const users = app.metrics.uniqueUsers ?? app.metrics.mau;
  return Math.sqrt(Math.max(0, requests)) * Math.sqrt(Math.max(1, users));
}

export function buildQuadrantPoints(apps: App[]): QuadrantPoint[] {
  const rawScores = apps.map(rawUsageScore);
  const maxScore = Math.max(1, ...rawScores);
  const costs = apps.map(monthlyCostOf);
  const maxCost = Math.max(1, ...costs);
  const usageThreshold = 50;

  return apps.map((app, i) => {
    const usage = Math.round((rawScores[i] / maxScore) * 100);
    const monthlyCost = costs[i];
    const costThreshold = maxCost * 0.5;
    const costHigh = monthlyCost >= costThreshold;
    const usageHigh = usage >= usageThreshold;

    let quadrant: Quadrant;
    let color: string;
    if (costHigh && !usageHigh) {
      quadrant = "OVERSPENDING";
      color = "#C8102E";
    } else if (costHigh && usageHigh) {
      quadrant = "EFFICIENT";
      color = "#059669";
    } else if (!costHigh && !usageHigh) {
      quadrant = "IDLE";
      color = "#6B7280";
    } else {
      quadrant = "UNDERPROVISIONED";
      color = "#D97706";
    }

    const bubbleSize = 160 + Math.round((app.budget.total / 1e9) * 80);

    return { app, usage, monthlyCost, bubbleSize, quadrant, color };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Executive headline (one-sentence AI banner)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecHeadline {
  sentence: string;
  totalApps: number;
  needsAttention: number;
  potentialSavingsIDR: number;
  zombieFeatureCount: number;
}

export function buildExecHeadline(enriched: EnrichedApp[]): ExecHeadline {
  const points = buildQuadrantPoints(enriched.map((e) => e.app));
  const overspending = points.filter((p) => p.quadrant === "OVERSPENDING");
  const overBudget = enriched.filter((e) => e.budget.level !== "SAFE");
  const zombies = enriched.flatMap((e) =>
    (e.app.featureInvestments ?? []).filter(
      (f) => f.classification === "DEPRECATION CANDIDATE",
    ),
  );
  const needsAttention = new Set<string>([
    ...overBudget.map((e) => e.app.id),
    ...overspending.map((p) => p.app.id),
    ...enriched
      .filter((e) =>
        (e.app.featureInvestments ?? []).some(
          (f) => f.classification === "DEPRECATION CANDIDATE",
        ),
      )
      .map((e) => e.app.id),
  ]).size;

  // Savings = 40% of monthly cost of each OVERSPENDING app + invested IDR of zombie features (monthly apportioned ~ 1/36 as a back-of-envelope).
  const savings =
    overspending.reduce((sum, p) => sum + p.monthlyCost * 0.4, 0) +
    zombies.reduce((sum, f) => sum + f.investedIDR / 36, 0);

  const overBudgetCount = overBudget.length;
  const zombieFeatureCount = zombies.length;

  let sentence: string;
  if (overBudgetCount > 0 && zombieFeatureCount > 0) {
    sentence = `${overBudgetCount} aplikasi sedang melewati ambang biaya, dan ${zombieFeatureCount} fitur hampir tidak dipakai dalam 30 hari terakhir.`;
  } else if (overBudgetCount > 0) {
    sentence = `${overBudgetCount} aplikasi sedang melewati ambang biaya — segera tinjau alokasi infrastrukturnya.`;
  } else if (zombieFeatureCount > 0) {
    sentence = `Semua aplikasi masih dalam batas anggaran, namun ${zombieFeatureCount} fitur berstatus zombie dan bisa dirampingkan.`;
  } else {
    sentence =
      "Portofolio aplikasi sehat secara biaya dan pemakaian fitur hari ini — tidak ada tindakan mendesak.";
  }

  return {
    sentence,
    totalApps: enriched.length,
    needsAttention,
    potentialSavingsIDR: Math.round(savings),
    zombieFeatureCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-app AI suggestion (four-layer output)
// ─────────────────────────────────────────────────────────────────────────────

export interface InfraRecommendation {
  currentTier: string;
  recommendedTier: string;
  rationale: string;
  estimatedMonthlySavingsIDR: number;
  direction: "downgrade" | "upgrade" | "maintain" | "decommission";
}

export interface ActionItem {
  text: string;
  impact: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  tone: "save" | "risk" | "neutral";
}

export interface Suggestion {
  whatHappening: string;
  whyMatters: string;
  infraRecommendation: InfraRecommendation;
  infraActions: ActionItem[];
  timestampNote: string;
}

export function buildSuggestion(app: App): Suggestion {
  const monthlyCost = monthlyCostOf(app);
  const requests = app.metrics.totalRequests ?? app.api.totalReqs;
  const dailyRequests = Math.max(1, Math.round(requests / 30));
  const costPerRequest = monthlyCost / Math.max(1, requests);
  const errorRate = app.metrics.errorRate ?? 0;

  const points = buildQuadrantPoints([app]);
  const quadrant = points[0]?.quadrant ?? "IDLE";

  const whatHappening = `Aplikasi ${app.name} menggunakan infrastruktur senilai ${idr(monthlyCost)}/bulan namun hanya melayani rata-rata ${dailyRequests.toLocaleString("id-ID")} request per hari.`;

  const whyMatters =
    quadrant === "OVERSPENDING"
      ? `Ini berarti setiap request rata-rata menelan biaya ${idr(costPerRequest)} — jauh di atas benchmark efisiensi untuk aplikasi sejenis di CIMB Niaga.`
      : quadrant === "UNDERPROVISIONED"
        ? `Pemakaian sudah tinggi tetapi alokasi kapasitas masih rendah — risiko antrean dan kegagalan meningkat saat jam sibuk.`
        : quadrant === "EFFICIENT"
          ? `Rasio biaya per request (${idr(costPerRequest)}) termasuk sehat — fokus berikutnya adalah menjaga SLA.`
          : `Biaya rendah tetapi pemanfaatannya juga rendah — pertimbangkan konsolidasi dengan aplikasi lain atau retire jika sudah tidak relevan.`;

  const currentTier = app.infra?.vmSpec ?? "Tidak diketahui";
  const vmSpec = app.infra?.vmSpec ?? "";

  const zombies = (app.featureInvestments ?? []).filter(
    (f) => f.classification === "DEPRECATION CANDIDATE",
  );
  const zombieSavingsPool = zombies.reduce((s, f) => s + f.investedIDR, 0);
  const zombieSavingsMonthly = Math.round(zombieSavingsPool / 36);

  let infraRecommendation: InfraRecommendation;
  const infraActions: ActionItem[] = [];

  if (quadrant === "OVERSPENDING") {
    const recommendedTier = vmSpec.includes("n2-standard-8")
      ? "n2-standard-2 x 2"
      : "satu tingkat lebih rendah dari konfigurasi saat ini";
    infraRecommendation = {
      currentTier,
      recommendedTier,
      estimatedMonthlySavingsIDR: Math.round(monthlyCost * 0.3),
      direction: "downgrade",
      rationale:
        "Utilisasi rendah tidak membutuhkan kapasitas ini — downgrade dapat memangkas biaya tanpa dampak SLA.",
    };
    infraActions.push({
      text: "Aktifkan preemptible/spot instances untuk workload non-kritis",
      impact: `Hemat ~${idr(Math.round(monthlyCost * 0.12))}/bulan`,
      priority: "HIGH",
      tone: "save",
    });
    infraActions.push({
      text: "Audit dan hapus load balancer atau resource idle di environment prod",
      impact: "Hemat biaya resource yang tidak terpakai",
      priority: "MEDIUM",
      tone: "save",
    });
    if (zombies.length > 0) {
      infraActions.push({
        text: `Hentikan serving path untuk ${zombies.length} fitur zombie (${zombies.map((z) => z.module).join(", ")}) — tidak diakses dalam 47 hari terakhir`,
        impact: `Realokasi potensi investasi ${idr(zombieSavingsMonthly)}/bulan`,
        priority: "HIGH",
        tone: "save",
      });
    }
  } else if (quadrant === "EFFICIENT") {
    infraRecommendation = {
      currentTier,
      recommendedTier: "Pertahankan tier saat ini",
      estimatedMonthlySavingsIDR: 0,
      direction: "maintain",
      rationale:
        "Rasio biaya-utilisasi sudah optimal — tidak ada perubahan tier yang direkomendasikan saat ini.",
    };
    infraActions.push({
      text: "Jadwalkan load test bulanan untuk memvalidasi kapasitas saat traffic peak",
      impact: "Cegah degradasi SLA saat lonjakan tidak terduga",
      priority: "MEDIUM",
      tone: "risk",
    });
    infraActions.push({
      text: "Dokumentasikan konfigurasi ini sebagai referensi benchmark untuk tim lain",
      impact: "Percepat keputusan rightsizing di portofolio",
      priority: "LOW",
      tone: "neutral",
    });
    if (errorRate > 1) {
      infraActions.push({
        text: `Stabilkan endpoint dengan error rate ${errorRate.toFixed(2)}% sebelum rilis berikutnya`,
        impact: "Turunkan risiko reputasi: MENENGAH",
        priority: "HIGH",
        tone: "risk",
      });
    }
  } else if (quadrant === "IDLE") {
    infraRecommendation = {
      currentTier,
      recommendedTier: "Downgrade ke minimum atau pertimbangkan decommission",
      estimatedMonthlySavingsIDR: Math.round(monthlyCost * 0.65),
      direction: "decommission",
      rationale:
        "Biaya dan utilisasi keduanya rendah — kandidat konsolidasi atau penghentian layanan.",
    };
    infraActions.push({
      text: "Jadwalkan review dengan Product Owner: konfirmasi apakah aplikasi masih dalam roadmap aktif",
      impact: "Keputusan retire dapat membebaskan budget dan tim",
      priority: "HIGH",
      tone: "neutral",
    });
    infraActions.push({
      text: "Freeze deployment baru sampai keputusan konsolidasi selesai",
      impact: "Cegah investasi tambahan ke sistem yang mungkin dihentikan",
      priority: "MEDIUM",
      tone: "neutral",
    });
    if (zombies.length > 0) {
      infraActions.push({
        text: `${zombies.length} fitur (${zombies.map((z) => z.module).join(", ")}) hampir tidak diakses — jadikan prioritas pertama saat review`,
        impact: `Potensi realokasi ${idr(zombieSavingsPool)}`,
        priority: "HIGH",
        tone: "save",
      });
    }
  } else {
    // UNDERPROVISIONED
    infraRecommendation = {
      currentTier,
      recommendedTier: "Aktifkan autoscaling atau upgrade satu tier",
      estimatedMonthlySavingsIDR: 0,
      direction: "upgrade",
      rationale:
        "Utilisasi tinggi dengan kapasitas terbatas meningkatkan risiko antrean dan kegagalan saat jam sibuk.",
    };
    infraActions.push({
      text: "Aktifkan horizontal autoscaling dengan threshold CPU 70% sebagai batas scale-out",
      impact: "Turunkan risiko antrean saat jam sibuk: TINGGI",
      priority: "HIGH",
      tone: "risk",
    });
    infraActions.push({
      text: "Pasang alert untuk P95 > 800ms dan error rate > 2% agar tim dinotifikasi sebelum SLA breach",
      impact: "Deteksi dini degradasi performa",
      priority: "HIGH",
      tone: "risk",
    });
    if (errorRate > 2) {
      infraActions.push({
        text: `Stabilkan endpoint dengan error rate ${errorRate.toFixed(2)}% — risiko meningkat seiring utilisasi naik`,
        impact: "Turunkan risiko kegagalan cascade: TINGGI",
        priority: "HIGH",
        tone: "risk",
      });
    }
  }

  return {
    whatHappening,
    whyMatters,
    infraRecommendation,
    infraActions,
    timestampNote: "Agent menganalisis berdasarkan data 1 – 22 April 2026",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ops (technical) summary
// ─────────────────────────────────────────────────────────────────────────────

export interface TechSummary {
  text: string;
  errorRatePct: number;
  portfolioP95: number;
  worstUptime: { app: string; uptime: number };
  slowest: { app: string; path: string; p95: number }[];
  trafficTrend: "up" | "flat" | "down";
  zombieEndpoints: { app: string; path: string; adoption: number }[];
}

export function buildTechSummary(enriched: EnrichedApp[]): TechSummary {
  const totalRequests = enriched.reduce(
    (s, e) => s + (e.app.metrics.totalRequests ?? e.app.api.totalReqs),
    0,
  );
  const errorWeighted = enriched.reduce((sum, entry) => {
    const r = entry.app.metrics.totalRequests ?? entry.app.api.totalReqs;
    return sum + r * (entry.app.metrics.errorRate ?? 0);
  }, 0);
  const errorRatePct = totalRequests > 0 ? errorWeighted / totalRequests : 0;
  const portfolioP95 = Math.round(
    enriched.reduce(
      (s, e) => s + (e.app.metrics.p95Ms ?? e.app.metrics.responseMs),
      0,
    ) / Math.max(1, enriched.length),
  );
  const worst = [...enriched].sort(
    (a, b) => a.app.metrics.uptime - b.app.metrics.uptime,
  )[0];

  const allEndpoints = enriched.flatMap((e) =>
    e.app.api.endpoints.map((ep) => ({
      app: e.app.shortName,
      path: ep.path,
      p95:
        ep.p95Ms ??
        e.app.metrics.p95Ms ??
        e.app.metrics.responseMs,
      adoption: ep.adoption,
    })),
  );
  const slowest = [...allEndpoints]
    .sort((a, b) => b.p95 - a.p95)
    .slice(0, 3)
    .map((r) => ({ app: r.app, path: r.path, p95: Math.round(r.p95) }));
  const zombieEndpoints = allEndpoints
    .filter((r) => r.adoption < 5)
    .sort((a, b) => a.adoption - b.adoption)
    .slice(0, 3)
    .map((r) => ({ app: r.app, path: r.path, adoption: r.adoption }));

  // Naive trend: compare sum of last week vs previous week from dailyActivity
  const lastWeek = enriched.reduce(
    (sum, e) =>
      sum +
      (e.app.metrics.dailyActivity ?? [])
        .slice(-7)
        .reduce((a, b) => a + b, 0),
    0,
  );
  const prevWeek = enriched.reduce(
    (sum, e) =>
      sum +
      (e.app.metrics.dailyActivity ?? [])
        .slice(-14, -7)
        .reduce((a, b) => a + b, 0),
    0,
  );
  const delta = prevWeek === 0 ? 0 : (lastWeek - prevWeek) / prevWeek;
  const trafficTrend: TechSummary["trafficTrend"] =
    delta > 0.05 ? "up" : delta < -0.05 ? "down" : "flat";

  const slowestLine = slowest
    .map((s) => `${s.path} (${s.app}, ${s.p95}ms)`)
    .join(", ");
  const zombieLine = zombieEndpoints.length
    ? `Suspiciously low-traffic endpoints: ${zombieEndpoints
        .map((z) => `${z.path} (${z.adoption}% adoption)`)
        .join(", ")}.`
    : "No suspicious low-traffic endpoints detected in this period.";

  const trendPhrase =
    trafficTrend === "up"
      ? "Traffic is trending up versus the previous 7 days"
      : trafficTrend === "down"
        ? "Traffic is trending down versus the previous 7 days"
        : "Traffic is holding flat versus the previous 7 days";

  const text = [
    `Portfolio error rate is ${errorRatePct.toFixed(2)}% across ${totalRequests.toLocaleString()} requests, with P95 at ${portfolioP95}ms.`,
    `Slowest endpoints right now: ${slowestLine}.`,
    `Lowest uptime is ${worst.app.shortName} at ${worst.app.metrics.uptime}%.`,
    `${trendPhrase}.`,
    zombieLine,
  ].join(" ");

  return {
    text,
    errorRatePct,
    portfolioP95,
    worstUptime: { app: worst.app.shortName, uptime: worst.app.metrics.uptime },
    slowest,
    trafficTrend,
    zombieEndpoints,
  };
}

/** Persona-aware narrative rendering — keeps copy central. */
export function describeMetricSet(
  persona: Persona,
  values: {
    responseMs?: number;
    p95Ms?: number;
    errorRate?: number;
    uptime?: number;
    costPerRequest?: number;
  },
): string[] {
  const lines: string[] = [];
  if (values.responseMs !== undefined)
    lines.push(
      formatForPersona({ kind: "responseMs", value: values.responseMs }, persona),
    );
  if (values.p95Ms !== undefined)
    lines.push(
      formatForPersona({ kind: "p95Ms", value: values.p95Ms }, persona),
    );
  if (values.errorRate !== undefined)
    lines.push(
      formatForPersona({ kind: "errorRate", value: values.errorRate }, persona),
    );
  if (values.uptime !== undefined)
    lines.push(
      formatForPersona({ kind: "uptime", value: values.uptime }, persona),
    );
  if (values.costPerRequest !== undefined)
    lines.push(
      formatForPersona(
        { kind: "costPerRequest", value: values.costPerRequest },
        persona,
      ),
    );
  return lines;
}
