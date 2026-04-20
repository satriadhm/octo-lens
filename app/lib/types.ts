export interface AppCost {
  development: number;
  opPerMonth: number;
  months: number;
  total: number;
}

export interface AppValue {
  totalRevenue: number;
}

export interface AppMetrics {
  mau: number;
  responseMs: number;
  uptime: number;
  lastMonthRoi: number;
  p50Ms?: number;
  p95Ms?: number;
  p99Ms?: number;
  errorRate?: number;
  totalRequests?: number;
  requestBytes?: number;
  uniqueUsers?: number;
  tokenIn?: number;
  tokenOut?: number;
  hourlyP95?: { h: string; p95: number; hits: number }[];
  dailyActivity?: number[];
}

export interface AppBudget {
  total: number;
  months: number;
  history: number[];
}

export interface FeatureScore {
  f: string;
  s: number;
}

export interface AppUX {
  score: number;
  history: number[];
  feedbackPos: number;
  feedbackTotal: number;
  byFeature: FeatureScore[];
  hourlyDrop: number | null;
  themes: string[];
}

export interface ApiEndpoint {
  path: string;
  calls: number;
  adoption: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  p95Ms?: number;
  errorRate?: number;
  status?: number;
}

export interface AppApi {
  totalReqs: number;
  endpoints: ApiEndpoint[];
}

export interface App {
  id: string;
  name: string;
  shortName: string;
  team: string;
  type: string;
  cost: AppCost;
  value: AppValue;
  metrics: AppMetrics;
  budget: AppBudget;
  ux: AppUX;
  api: AppApi;
}

export interface ROIResult {
  pct: number;
  label: "Excellent" | "On Track" | "At Risk" | "Underperforming";
  color: string;
  bg: string;
  trend: number;
  netValue: number;
}

export interface BudgetFuture {
  month: number;
  spend: number;
  cum: number;
}

export interface BudgetChartDatum {
  m: string;
  actual?: number;
  cumAct?: number;
  proj?: number;
  cumProj?: number;
  ceiling: number;
}

export interface BudgetResult {
  spent: number;
  proj: number;
  total: number;
  pct: number;
  overPct: number;
  level: "CRITICAL" | "WARNING" | "SAFE";
  levelColor: string;
  breach: BudgetFuture | undefined;
  chartData: BudgetChartDatum[];
  n: number;
  rem: number;
}

export interface EnrichedApp {
  app: App;
  roi: ROIResult;
  budget: BudgetResult;
}

export type ViewMode = "executive" | "ops";

export interface SlowQuery {
  action: "http" | "file-transfer" | "db";
  durationMs: number;
  group: string;
  createdAt: string;
  endpoint: string;
}

export interface TopUser {
  user: string;
  group: string;
  totalReq: number;
  avgResMs: number;
  totalFiles?: number;
  totalFileSize?: number;
}
