"use client";

import { useMemo, useState } from "react";
import type {
  App,
  ApiEndpoint,
  FeatureClassification,
  FeatureInvestment,
  FeatureTrend,
} from "@/app/lib/types";
import { idr } from "@/app/lib/calculators";

interface FeatureValueMatrixProps {
  apps: App[];
  selectedApp: App | null;
}

interface Row {
  app: App;
  endpoint: ApiEndpoint;
  investment: FeatureInvestment;
  usage30d: number;
}

type SortKey = "name" | "module" | "usage" | "trend" | "classification" | "investment";
type SortDir = "asc" | "desc";

const CLASS_ORDER: Record<FeatureClassification, number> = {
  "HIGH VALUE": 1,
  "HIDDEN GEM": 2,
  "AT RISK": 3,
  "ZOMBIE CANDIDATE": 4,
};

const TREND_ORDER: Record<FeatureTrend, number> = {
  up: 1,
  flat: 2,
  down: 3,
  dead: 4,
};

export function FeatureValueMatrix({
  apps,
  selectedApp,
}: FeatureValueMatrixProps) {
  const rows = useMemo<Row[]>(() => {
    const source = selectedApp ? [selectedApp] : apps;
    return source.flatMap((app) => {
      const investments = app.featureInvestments ?? [];
      return investments.map<Row | null>((inv) => {
        const endpoint = app.api.endpoints.find((e) => e.path === inv.path);
        if (!endpoint) return null;
        return {
          app,
          endpoint,
          investment: inv,
          usage30d: endpoint.calls,
        };
      }).filter((r): r is Row => r !== null);
    });
  }, [apps, selectedApp]);

  const [sortKey, setSortKey] = useState<SortKey>("classification");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.endpoint.path.localeCompare(b.endpoint.path) * dir;
        case "module":
          return a.investment.module.localeCompare(b.investment.module) * dir;
        case "usage":
          return (a.usage30d - b.usage30d) * dir;
        case "trend":
          return (
            (TREND_ORDER[a.investment.trend] - TREND_ORDER[b.investment.trend]) *
            dir
          );
        case "classification":
          return (
            (CLASS_ORDER[a.investment.classification] -
              CLASS_ORDER[b.investment.classification]) *
            dir
          );
        case "investment":
          return (a.investment.investedIDR - b.investment.investedIDR) * dir;
        default:
          return 0;
      }
    });
  }, [rows, sortKey, sortDir]);

  const zombies = rows.filter(
    (r) => r.investment.classification === "ZOMBIE CANDIDATE",
  );
  const zombieIDR = zombies.reduce((s, r) => s + r.investment.investedIDR, 0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  return (
    <section className="bg-surface border border-border rounded-2xl overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
        <div>
          <h2 className="text-sm font-display font-bold text-txt">
            Feature Value Matrix
          </h2>
          <p className="text-[11px] text-txt-muted">
            {selectedApp
              ? `Fitur untuk ${selectedApp.name}`
              : `Semua fitur di ${apps.length} aplikasi`}
          </p>
        </div>
        <span className="text-[10px] font-display font-semibold uppercase tracking-[0.14em] text-txt-dim">
          {sorted.length} features
        </span>
      </header>

      {/* Summary row */}
      <div
        className="px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklch, var(--color-foreground) 90%, transparent) 0%, color-mix(in oklch, var(--color-brand) 40%, var(--color-foreground)) 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/15 text-white">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <p className="text-xs sm:text-sm font-display font-semibold leading-tight">
            {zombies.length > 0
              ? `${zombies.length} zombie candidate${zombies.length > 1 ? "s" : ""} found`
              : "Tidak ada fitur zombie pada saat ini"}
            {zombies.length > 0 && (
              <span className="font-normal text-white/80">
                {" "}· estimasi {idr(zombieIDR)} terinvestasi di fitur yang
                underutilized
              </span>
            )}
          </p>
        </div>
        {zombies.length > 0 && (
          <span className="text-[11px] font-semibold tracking-wide uppercase bg-white/15 px-2 py-1 rounded-md">
            Review quarterly
          </span>
        )}
      </div>

      <div className="block md:hidden px-3 py-3 space-y-2">
        {sorted.map((row) => {
          const rowKey = `${row.app.id}-${row.investment.path}`;
          const isOpen = expanded === rowKey;
          return (
            <div
              key={rowKey}
              className="rounded-xl border border-border bg-surface px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <code className="text-[11px] text-txt font-mono">
                    {row.endpoint.path}
                  </code>
                  {!selectedApp && (
                    <div className="text-[11px] text-txt-dim mt-0.5">
                      {row.app.name}
                    </div>
                  )}
                </div>
                <ClassBadge classification={row.investment.classification} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <MiniStat label="Usage (30d)" value={row.usage30d.toLocaleString()} />
                <MiniStat label="Investment" value={idr(row.investment.investedIDR)} />
              </div>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : rowKey)}
                aria-expanded={isOpen}
                className="mt-2.5 h-11 px-3 rounded-md border border-border text-[12px] font-semibold text-txt hover:bg-surface-dim focus-visible:outline-2 focus-visible:outline-brand/40"
              >
                {isOpen ? "Hide details" : "Show details"}
              </button>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-border">
                  <ExpandedPanel row={row} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full min-w-[780px] border-collapse text-xs">
          <thead>
            <tr className="bg-surface-dim/60 border-b border-border">
              <Th
                onSort={() => handleSort("name")}
                indicator={sortIndicator("name")}
                ariaSort={sortKey === "name" ? sortDir : undefined}
              >
                Feature
              </Th>
              <Th
                onSort={() => handleSort("module")}
                indicator={sortIndicator("module")}
                ariaSort={sortKey === "module" ? sortDir : undefined}
              >
                Module
              </Th>
              <Th
                onSort={() => handleSort("usage")}
                indicator={sortIndicator("usage")}
                ariaSort={sortKey === "usage" ? sortDir : undefined}
              >
                Usage (30d)
              </Th>
              <Th
                onSort={() => handleSort("trend")}
                indicator={sortIndicator("trend")}
                ariaSort={sortKey === "trend" ? sortDir : undefined}
              >
                Trend
              </Th>
              <Th
                onSort={() => handleSort("classification")}
                indicator={sortIndicator("classification")}
                ariaSort={sortKey === "classification" ? sortDir : undefined}
              >
                AI Classification
              </Th>
              <Th
                onSort={() => handleSort("investment")}
                indicator={sortIndicator("investment")}
                ariaSort={sortKey === "investment" ? sortDir : undefined}
              >
                Est. Investment
              </Th>
              <th className="px-4 py-2.5 text-left text-txt-dim font-semibold font-display text-[11px] tracking-[0.04em]">
                Recommendation
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const rowKey = `${row.app.id}-${row.investment.path}`;
              const isOpen = expanded === rowKey;
              return (
                <FeatureRow
                  key={rowKey}
                  row={row}
                  isOpen={isOpen}
                  onToggle={() => setExpanded(isOpen ? null : rowKey)}
                  hideAppName={!!selectedApp}
                />
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-txt-dim text-xs"
                >
                  Tidak ada data fitur untuk aplikasi ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  onSort,
  indicator,
  ariaSort,
}: {
  children: React.ReactNode;
  onSort: () => void;
  indicator: string;
  ariaSort?: SortDir;
}) {
  return (
    <th
      aria-sort={
        ariaSort === "asc"
          ? "ascending"
          : ariaSort === "desc"
            ? "descending"
            : "none"
      }
      className="px-4 py-2.5 text-left text-txt-dim font-semibold font-display text-[11px] tracking-[0.04em] whitespace-nowrap"
    >
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1 hover:text-txt focus-visible:outline-2 focus-visible:outline-brand/40 rounded-sm"
      >
        {children}
        <span aria-hidden>{indicator}</span>
      </button>
    </th>
  );
}

function FeatureRow({
  row,
  isOpen,
  onToggle,
  hideAppName,
}: {
  row: Row;
  isOpen: boolean;
  onToggle: () => void;
  hideAppName: boolean;
}) {
  return (
    <>
      <tr
        className={`border-b border-border transition-colors ${
          isOpen ? "bg-brand-light/40" : "hover:bg-brand-light/20"
        }`}
      >
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex flex-col gap-0.5">
            <code className="text-[11px] text-txt font-mono">
              {row.endpoint.path}
            </code>
            {!hideAppName && (
              <span className="text-[10px] text-txt-dim">{row.app.name}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-txt-muted whitespace-nowrap">
          {row.investment.module}
        </td>
        <td className="px-4 py-3">
          <UsageCell spark={row.investment.spark} calls={row.usage30d} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <TrendCell trend={row.investment.trend} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <ClassBadge classification={row.investment.classification} />
        </td>
        <td className="px-4 py-3 text-txt font-mono tabular-nums whitespace-nowrap">
          {idr(row.investment.investedIDR)}
        </td>
        <td className="px-4 py-3 text-txt-muted text-[11px] max-w-[320px]">
          <span className="line-clamp-2">{row.investment.recommendation}</span>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="mt-2 h-11 px-3 rounded-md border border-border text-[11px] font-semibold text-txt hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand/40"
          >
            {isOpen ? "Hide details" : "Details"}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-border bg-surface-dim/40">
          <td colSpan={7} className="px-4 py-4">
            <ExpandedPanel row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

function UsageCell({ spark, calls }: { spark?: number[]; calls: number }) {
  const bars = spark ?? [];
  const max = Math.max(1, ...bars);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-end gap-[2px] h-5 w-[72px]"
        aria-label={`30 day usage trend, ${calls.toLocaleString()} calls`}
      >
        {bars.slice(-30).map((v, i) => (
          <span
            key={i}
            className="flex-1 bg-brand/30 rounded-[1px]"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono tabular-nums text-txt-muted">
        {calls.toLocaleString()}
      </span>
    </div>
  );
}

function TrendCell({ trend }: { trend: FeatureTrend }) {
  const label: Record<FeatureTrend, string> = {
    up: "↑ Growing",
    flat: "→ Stable",
    down: "↓ Declining",
    dead: "✗ Dead",
  };
  const tone: Record<FeatureTrend, string> = {
    up: "text-ok",
    flat: "text-txt-muted",
    down: "text-alert",
    dead: "text-danger",
  };
  return (
    <span
      className={`text-[11px] font-semibold tabular-nums ${tone[trend]}`}
    >
      {label[trend]}
    </span>
  );
}

function ClassBadge({ classification }: { classification: FeatureClassification }) {
  const config: Record<
    FeatureClassification,
    { bg: string; text: string; border: string }
  > = {
    "HIGH VALUE": {
      bg: "bg-ok/12",
      text: "text-ok",
      border: "border-ok/25",
    },
    "AT RISK": {
      bg: "bg-warn/15",
      text: "text-warn",
      border: "border-warn/30",
    },
    "ZOMBIE CANDIDATE": {
      bg: "bg-danger/12",
      text: "text-danger",
      border: "border-danger/25",
    },
    "HIDDEN GEM": {
      bg: "bg-[color-mix(in_oklch,_oklch(0.55_0.22_300)_12%,_transparent)]",
      text: "text-[oklch(0.55_0.22_300)]",
      border: "border-[color-mix(in_oklch,_oklch(0.55_0.22_300)_28%,_transparent)]",
    },
  };
  const c = config[classification];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase border ${c.bg} ${c.text} ${c.border}`}
    >
      {classification}
    </span>
  );
}

function ExpandedPanel({ row }: { row: Row }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-display font-semibold uppercase tracking-[0.12em] text-txt-dim">
          AI Recommendation
        </p>
        <p className="text-xs text-txt leading-relaxed">
          {row.investment.recommendation}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 min-w-[280px]">
        <MiniStat
          label="Adoption"
          value={`${row.endpoint.adoption}%`}
        />
        <MiniStat
          label="Calls (30d)"
          value={row.endpoint.calls.toLocaleString()}
        />
        <MiniStat
          label="P95"
          value={`${Math.round(row.endpoint.p95Ms ?? 0)}ms`}
        />
        <MiniStat
          label="Error rate"
          value={`${(row.endpoint.errorRate ?? 0).toFixed(2)}%`}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.12em] text-txt-dim font-semibold">
        {label}
      </div>
      <div className="text-[13px] font-display font-bold text-txt tabular-nums">
        {value}
      </div>
    </div>
  );
}
