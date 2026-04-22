import type { App, SlowQuery, TopUser } from "./types";

function buildHourlyP95(baseP95: number, baseHits: number) {
  return Array.from({ length: 24 }, (_, hour) => {
    const peakWave = Math.sin((hour / 24) * Math.PI * 2);
    const rushWave = Math.cos(((hour - 9) / 24) * Math.PI * 4);
    const p95 = Math.max(120, Math.round(baseP95 + peakWave * 110 + rushWave * 40));
    const hits = Math.max(200, Math.round(baseHits + peakWave * (baseHits * 0.28)));
    return { h: `${String(hour).padStart(2, "0")}:00`, p95, hits };
  });
}

function buildDailyActivity(seed: number) {
  return Array.from({ length: 70 }, (_, idx) => {
    const weekFactor = 0.9 + ((idx % 10) / 10) * 0.2;
    const dayInWeek = idx % 7;
    const weekdayBoost = dayInWeek === 0 || dayInWeek === 6 ? 0.55 : 1;
    return Math.max(8, Math.round(seed * weekFactor * weekdayBoost));
  });
}

function buildSpark(trend: "up" | "flat" | "down" | "dead", seed: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const base = seed;
    const drift =
      trend === "up"
        ? (i / 30) * 40
        : trend === "down"
          ? -(i / 30) * 35
          : trend === "dead"
            ? -Math.min(45, (i / 30) * 50)
            : 0;
    const noise = Math.sin(i * 0.7 + seed) * 6;
    return Math.max(0, Math.round(base + drift + noise));
  });
}

export const APPS: App[] = [
  {
    id: "APP-001",
    name: "Mobile Banking",
    shortName: "MobileBanking",
    team: "Digital Channel",
    type: "Mobile",
    cost: { development: 2500000000, opPerMonth: 150000000, months: 10, total: 4000000000 },
    value: { totalRevenue: 9200000000 },
    metrics: {
      mau: 320000,
      responseMs: 310,
      uptime: 99.7,
      p50Ms: 180,
      p95Ms: 518,
      p99Ms: 860,
      errorRate: 1.32,
      totalRequests: 4018000,
      requestBytes: 24370000,
      uniqueUsers: 311200,
      tokenIn: 6846,
      tokenOut: 181,
      hourlyP95: buildHourlyP95(518, 168000),
      dailyActivity: buildDailyActivity(62),
    },
    budget: {
      total: 4000000000,
      months: 12,
      history: [310, 325, 318, 340, 352, 368, 355, 374, 388, 401].map((v) => v * 1000000),
    },
    api: {
      totalReqs: 2340000,
      endpoints: [
        {
          path: "/transfer/interbank",
          calls: 450230,
          adoption: 78,
          method: "POST",
          p95Ms: 57469.92,
          errorRate: 1.94,
          status: 200,
        },
        {
          path: "/loan/kpr/apply",
          calls: 1200,
          adoption: 0.4,
          method: "POST",
          p95Ms: 634.12,
          errorRate: 3.11,
          status: 500,
        },
        {
          path: "/investment/reksa",
          calls: 23400,
          adoption: 4.1,
          method: "GET",
          p95Ms: 341.8,
          errorRate: 0.92,
          status: 200,
        },
      ],
    },
    infra: { vmSpec: "n2-standard-16 x 12", monthlyCost: 150000000, teamSize: 28 },
    featureInvestments: [
      {
        path: "/transfer/interbank",
        module: "Payments",
        investedIDR: 1_600_000_000,
        classification: "HIGH VALUE",
        trend: "up",
        recommendation:
          "Pertahankan kapasitas dan tingkatkan monitoring saat jam sibuk untuk menjaga pengalaman transfer.",
        spark: buildSpark("up", 60),
      },
      {
        path: "/loan/kpr/apply",
        module: "Lending",
        investedIDR: 820_000_000,
        classification: "ZOMBIE CANDIDATE",
        trend: "dead",
        recommendation:
          "Arahkan pengguna ke jalur KPR Digital atau pertimbangkan penghentian fitur ini di rilis berikutnya.",
        spark: buildSpark("dead", 12),
      },
      {
        path: "/investment/reksa",
        module: "Wealth",
        investedIDR: 540_000_000,
        classification: "HIDDEN GEM",
        trend: "up",
        recommendation:
          "Adopsi rendah namun error rate sangat baik — naikkan promosi fitur Reksa Dana di homepage.",
        spark: buildSpark("up", 18),
      },
    ],
  },
  {
    id: "APP-002",
    name: "Internet Banking",
    shortName: "InetBanking",
    team: "Digital Channel",
    type: "Web",
    cost: { development: 1800000000, opPerMonth: 90000000, months: 14, total: 3060000000 },
    value: { totalRevenue: 5400000000 },
    metrics: {
      mau: 89000,
      responseMs: 520,
      uptime: 99.1,
      p50Ms: 262,
      p95Ms: 599.31,
      p99Ms: 1082,
      errorRate: 1.04,
      totalRequests: 210000,
      requestBytes: 3040000,
      uniqueUsers: 84520,
      tokenIn: 3108,
      tokenOut: 112,
      hourlyP95: buildHourlyP95(599, 92000),
      dailyActivity: buildDailyActivity(44),
    },
    budget: {
      total: 3000000000,
      months: 14,
      history: [195, 210, 218, 229, 238, 245, 251, 260, 271, 280, 289, 298, 312, 325].map(
        (v) => v * 1000000,
      ),
    },
    api: {
      totalReqs: 890000,
      endpoints: [
        {
          path: "/transfer/domestic",
          calls: 189000,
          adoption: 61,
          method: "GET",
          p95Ms: 599.31,
          errorRate: 1.2,
          status: 200,
        },
        {
          path: "/report/statement",
          calls: 45000,
          adoption: 14.5,
          method: "GET",
          p95Ms: 305.31,
          errorRate: 0.8,
          status: 200,
        },
        {
          path: "/export/csv",
          calls: 2100,
          adoption: 0.7,
          method: "GET",
          p95Ms: 289.29,
          errorRate: 0.6,
          status: 200,
        },
      ],
    },
    infra: { vmSpec: "n2-standard-8 x 6", monthlyCost: 90000000, teamSize: 16 },
    featureInvestments: [
      {
        path: "/transfer/domestic",
        module: "Payments",
        investedIDR: 780_000_000,
        classification: "AT RISK",
        trend: "flat",
        recommendation:
          "P95 mendekati 600ms dan error rate meningkat — review kapasitas database dan koneksi core banking.",
        spark: buildSpark("flat", 55),
      },
      {
        path: "/report/statement",
        module: "Reporting",
        investedIDR: 420_000_000,
        classification: "HIGH VALUE",
        trend: "up",
        recommendation:
          "Fitur Laporan tumbuh stabil — pertahankan performa dan tambahkan opsi ekspor yang lebih modern.",
        spark: buildSpark("up", 40),
      },
      {
        path: "/export/csv",
        module: "Reporting",
        investedIDR: 310_000_000,
        classification: "ZOMBIE CANDIDATE",
        trend: "dead",
        recommendation:
          "Adopsi di bawah 1% dan turun terus — gabungkan ke fitur Laporan atau retire sebelum kuartal berikutnya.",
        spark: buildSpark("dead", 8),
      },
    ],
  },
  {
    id: "APP-003",
    name: "KPR Digital",
    shortName: "KPRDigital",
    team: "Lending",
    type: "Web",
    cost: { development: 3200000000, opPerMonth: 120000000, months: 8, total: 4160000000 },
    value: { totalRevenue: 2100000000 },
    metrics: {
      mau: 12000,
      responseMs: 980,
      uptime: 97.3,
      p50Ms: 480,
      p95Ms: 1420,
      p99Ms: 2280,
      errorRate: 2.84,
      totalRequests: 48020,
      requestBytes: 980000,
      uniqueUsers: 11150,
      tokenIn: 912,
      tokenOut: 53,
      hourlyP95: buildHourlyP95(1420, 3500),
      dailyActivity: buildDailyActivity(18),
    },
    budget: {
      total: 4000000000,
      months: 12,
      history: [380, 420, 445, 480, 510, 545, 580, 620].map((v) => v * 1000000),
    },
    api: {
      totalReqs: 48000,
      endpoints: [
        {
          path: "/kpr/simulate",
          calls: 31000,
          adoption: 65,
          method: "GET",
          p95Ms: 2172.89,
          errorRate: 3.62,
          status: 200,
        },
        {
          path: "/kpr/apply",
          calls: 4800,
          adoption: 10,
          method: "POST",
          p95Ms: 2793.7,
          errorRate: 4.11,
          status: 500,
        },
        {
          path: "/kpr/document/upload",
          calls: 2100,
          adoption: 4.4,
          method: "POST",
          p95Ms: 2001.46,
          errorRate: 2.08,
          status: 200,
        },
      ],
    },
    infra: { vmSpec: "n2-standard-8 x 10", monthlyCost: 120000000, teamSize: 22 },
    featureInvestments: [
      {
        path: "/kpr/simulate",
        module: "Simulation",
        investedIDR: 1_100_000_000,
        classification: "AT RISK",
        trend: "flat",
        recommendation:
          "Trafik tinggi namun P95 di atas 2 detik dan error rate 3.6% — prioritaskan tuning query dan caching.",
        spark: buildSpark("flat", 62),
      },
      {
        path: "/kpr/apply",
        module: "Origination",
        investedIDR: 1_480_000_000,
        classification: "ZOMBIE CANDIDATE",
        trend: "down",
        recommendation:
          "Hanya 10% adopsi dengan error 4%+ — perbaiki alur pengajuan atau pertimbangkan migrasi ke Mobile Banking.",
        spark: buildSpark("down", 22),
      },
      {
        path: "/kpr/document/upload",
        module: "Origination",
        investedIDR: 620_000_000,
        classification: "ZOMBIE CANDIDATE",
        trend: "dead",
        recommendation:
          "Hampir tidak dipakai dan performa lambat — review apakah fitur upload dapat digabung ke E-Sign.",
        spark: buildSpark("dead", 6),
      },
    ],
  },
  {
    id: "APP-004",
    name: "Back Office Ops",
    shortName: "BackOffice",
    team: "Operations",
    type: "Internal",
    cost: { development: 900000000, opPerMonth: 45000000, months: 24, total: 1980000000 },
    value: { totalRevenue: 4800000000 },
    metrics: {
      mau: 1200,
      responseMs: 410,
      uptime: 99.9,
      p50Ms: 220,
      p95Ms: 482,
      p99Ms: 911,
      errorRate: 0.58,
      totalRequests: 38000,
      requestBytes: 1800000,
      uniqueUsers: 1180,
      tokenIn: 420,
      tokenOut: 30,
      hourlyP95: buildHourlyP95(482, 4100),
      dailyActivity: buildDailyActivity(22),
    },
    budget: {
      total: 2000000000,
      months: 24,
      history: [
        78, 80, 81, 82, 83, 84, 85, 85, 86, 87, 88, 89, 90, 91, 92, 92, 93, 94, 95, 96, 97, 98,
        99, 100,
      ].map((v) => v * 1000000),
    },
    api: {
      totalReqs: 120000,
      endpoints: [
        {
          path: "/approval/pending",
          calls: 45000,
          adoption: 77,
          method: "GET",
          p95Ms: 438.77,
          errorRate: 0.5,
          status: 200,
        },
        {
          path: "/recon/daily",
          calls: 28000,
          adoption: 48,
          method: "GET",
          p95Ms: 515.12,
          errorRate: 0.78,
          status: 200,
        },
      ],
    },
    infra: { vmSpec: "n2-standard-4 x 4", monthlyCost: 45000000, teamSize: 9 },
    featureInvestments: [
      {
        path: "/approval/pending",
        module: "Approval",
        investedIDR: 320_000_000,
        classification: "HIGH VALUE",
        trend: "flat",
        recommendation:
          "Core workflow operasional — jaga SLA dan tambahkan notifikasi untuk approval yang tertahan.",
        spark: buildSpark("flat", 48),
      },
      {
        path: "/recon/daily",
        module: "Reconciliation",
        investedIDR: 280_000_000,
        classification: "AT RISK",
        trend: "flat",
        recommendation:
          "P95 menembus 500ms di akhir bulan — jadwalkan batch rekonsiliasi di luar jam sibuk.",
        spark: buildSpark("flat", 36),
      },
    ],
  },
  {
    id: "APP-005",
    name: "Treasury System",
    shortName: "Treasury",
    team: "Finance",
    type: "Internal",
    cost: { development: 5800000000, opPerMonth: 280000000, months: 6, total: 7480000000 },
    value: { totalRevenue: 18200000000 },
    metrics: {
      mau: 340,
      responseMs: 220,
      uptime: 99.99,
      p50Ms: 140,
      p95Ms: 322.4,
      p99Ms: 638,
      errorRate: 0.34,
      totalRequests: 146000,
      requestBytes: 3040000,
      uniqueUsers: 330,
      tokenIn: 210,
      tokenOut: 16,
      hourlyP95: buildHourlyP95(322, 18500),
      dailyActivity: buildDailyActivity(12),
    },
    budget: {
      total: 8000000000,
      months: 12,
      history: [580, 610, 595, 620, 640, 650].map((v) => v * 1000000),
    },
    api: {
      totalReqs: 680000,
      endpoints: [
        {
          path: "/fx/trade",
          calls: 245000,
          adoption: 91,
          method: "POST",
          p95Ms: 518.73,
          errorRate: 0.41,
          status: 200,
        },
        {
          path: "/bond/settlement",
          calls: 189000,
          adoption: 70,
          method: "POST",
          p95Ms: 246.31,
          errorRate: 0.22,
          status: 200,
        },
      ],
    },
    infra: { vmSpec: "n2-highmem-32 x 8", monthlyCost: 280000000, teamSize: 14 },
    featureInvestments: [
      {
        path: "/fx/trade",
        module: "Trading",
        investedIDR: 2_400_000_000,
        classification: "HIGH VALUE",
        trend: "up",
        recommendation:
          "Backbone revenue — pastikan kapasitas auto-scale dan simulasikan beban puncak bulanan.",
        spark: buildSpark("up", 70),
      },
      {
        path: "/bond/settlement",
        module: "Settlement",
        investedIDR: 1_250_000_000,
        classification: "HIGH VALUE",
        trend: "flat",
        recommendation:
          "Volume stabil dengan error rate rendah — pertahankan SLA dan dokumentasikan disaster recovery.",
        spark: buildSpark("flat", 55),
      },
    ],
  },
];

export const SLOW_QUERIES: SlowQuery[] = [
  {
    action: "http",
    durationMs: 638,
    group: "Testing Migration",
    createdAt: "2026-04-20T14:55:25.000Z",
    endpoint: "/etl/api/v1/etl/execute",
  },
  {
    action: "http",
    durationMs: 775,
    group: "Testing Migration",
    createdAt: "2026-04-20T14:29:16.000Z",
    endpoint: "/etl/api/v1/etl/execute",
  },
  {
    action: "http",
    durationMs: 791,
    group: "Testing Migration",
    createdAt: "2026-04-20T14:27:31.000Z",
    endpoint: "/etl/api/v1/etl/execute",
  },
  {
    action: "file-transfer",
    durationMs: 817,
    group: "Testing Migration",
    createdAt: "2026-04-20T14:55:42.000Z",
    endpoint: "/ctj/api/v1/s3/execute",
  },
  {
    action: "file-transfer",
    durationMs: 821,
    group: "AI Squad",
    createdAt: "2026-04-20T09:46:21.000Z",
    endpoint: "/ctj/api/v1/s3/execute",
  },
  {
    action: "db",
    durationMs: 912,
    group: "Operations",
    createdAt: "2026-04-19T22:12:00.000Z",
    endpoint: "/db/reconciliation/run",
  },
  {
    action: "http",
    durationMs: 1261,
    group: "Lending",
    createdAt: "2026-04-19T20:44:37.000Z",
    endpoint: "/kpr/apply",
  },
  {
    action: "db",
    durationMs: 1468,
    group: "Digital Channel",
    createdAt: "2026-04-19T17:12:19.000Z",
    endpoint: "/report/statement",
  },
  {
    action: "http",
    durationMs: 2109,
    group: "Lending",
    createdAt: "2026-04-19T15:07:11.000Z",
    endpoint: "/kpr/document/upload",
  },
  {
    action: "db",
    durationMs: 2794,
    group: "Lending",
    createdAt: "2026-04-18T06:36:26.000Z",
    endpoint: "/kpr/apply",
  },
];

export const TOP_USERS: TopUser[] = [
  {
    user: "KMC035",
    group: "AI Squad",
    totalReq: 2511,
    avgResMs: 7453,
    totalFiles: 2,
    totalFileSize: 3040000,
  },
  {
    user: "KMC035",
    group: "AI Squad",
    totalReq: 20,
    avgResMs: 438,
    totalFiles: 2,
    totalFileSize: 3040000,
  },
  {
    user: "KMC034",
    group: "AI Squad",
    totalReq: 38,
    avgResMs: 136,
  },
  {
    user: "irzan.kusuma.wijaya",
    group: "AI Squad",
    totalReq: 44,
    avgResMs: 103,
  },
  {
    user: "Chatbot_2",
    group: "AI Squad",
    totalReq: 5,
    avgResMs: 57,
  },
  {
    user: "ops.recon.bot",
    group: "Operations",
    totalReq: 187,
    avgResMs: 244,
    totalFiles: 3,
    totalFileSize: 2200000,
  },
  {
    user: "digital.channel.bot",
    group: "Digital Channel",
    totalReq: 621,
    avgResMs: 311,
    totalFiles: 7,
    totalFileSize: 6500000,
  },
];
