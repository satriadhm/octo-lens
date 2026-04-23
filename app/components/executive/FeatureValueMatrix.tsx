"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function featureRowKey(r: Row) {
  return `${r.app.id}-${r.investment.path}`;
}

type SortKey = "name" | "module" | "usage" | "trend" | "classification" | "investment";
type SortDir = "asc" | "desc";

const CLASS_ORDER: Record<FeatureClassification, number> = {
  "STRATEGIC ASSET": 1,
  "EMERGING ASSET": 2,
  "UNDERPERFORMING": 3,
  "DEPRECATION CANDIDATE": 4,
};

const TREND_ORDER: Record<FeatureTrend, number> = {
  up: 1,
  flat: 2,
  down: 3,
  dead: 4,
};

const PAGE_SIZE = 6;

type PageItem = number | "ellipsis";

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: PageItem[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push("ellipsis");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

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
  const [sidebarRow, setSidebarRow] = useState<Row | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarRow(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

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

  const totalPages =
    sorted.length === 0 ? 0 : Math.ceil(sorted.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
    setSidebarRow(null);
  }, [sortKey, sortDir, selectedApp?.id, apps.length]);

  useEffect(() => {
    if (totalPages === 0) return;
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  useEffect(() => {
    setSidebarRow(null);
  }, [page]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const zombies = rows.filter(
    (r) => r.investment.classification === "DEPRECATION CANDIDATE",
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
    <>
    <section className="bg-surface border border-border rounded-xl overflow-hidden">
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
        <span className="text-[11px] font-medium text-txt-dim tabular-nums">
          {sorted.length} features
        </span>
      </header>

      {/* Summary row */}
      <div
        className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b ${
          zombies.length > 0
            ? "border-danger/20 bg-danger/5"
            : "border-border bg-surface-dim/60"
        }`}
      >
        <p className="text-xs sm:text-sm text-txt leading-snug max-w-[65ch] flex items-start gap-2">
          {zombies.length > 0 ? (
            <>
              <span
                aria-hidden
                className="mt-[3px] inline-block size-2 rounded-full bg-danger shrink-0"
              />
              <span>
                <span className="font-semibold text-txt">
                  {zombies.length} fitur zombie terdeteksi
                </span>
                <span className="text-txt-muted">
                  {" "}
                  · {idr(zombieIDR)} investasi pada fitur yang jarang dipakai
                </span>
              </span>
            </>
          ) : (
            <span className="text-txt-muted">
              Tidak ada fitur zombie — portofolio sehat
            </span>
          )}
        </p>
        {zombies.length > 0 && (
          <span className="text-[11px] font-semibold text-danger shrink-0 uppercase tracking-[0.08em]">
            Tinjau rasionalisasi portofolio
          </span>
        )}
      </div>

      <div className="block md:hidden px-3 py-3 space-y-2">
        {pageRows.map((row) => {
          const rKey = featureRowKey(row);
          const isOpen =
            sidebarRow !== null && featureRowKey(sidebarRow) === rKey;
          const isZombie =
            row.investment.classification === "DEPRECATION CANDIDATE";
          return (
            <div
              key={rKey}
              className={`rounded-xl border px-3.5 py-3 ${
                isZombie
                  ? "border-danger/30 bg-danger/5"
                  : "border-border bg-surface"
              }`}
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
              <div className="mt-3">
                <p className="text-[10px] font-display font-semibold uppercase tracking-[0.12em] text-brand">
                  AI Recommendation
                </p>
                <p className="mt-1 text-[11px] text-txt-muted line-clamp-2">
                  {row.investment.recommendation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSidebarRow(isOpen ? null : row);
                }}
                aria-expanded={isOpen}
                className="mt-2.5 h-11 px-3 rounded-md border border-border text-[12px] font-semibold text-txt hover:bg-surface-dim focus-visible:outline-2 focus-visible:outline-brand/40"
              >
                Show details →
              </button>
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
                AI Recommendation
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const rKey = featureRowKey(row);
              const isOpen =
                sidebarRow !== null && featureRowKey(sidebarRow) === rKey;
              return (
                <FeatureRow
                  key={rKey}
                  row={row}
                  isOpen={isOpen}
                  onToggle={() => {
                    setSidebarRow(isOpen ? null : row);
                  }}
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

      {totalPages > 1 && (
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-border bg-surface-dim/40">
          <p className="text-[11px] text-txt-muted tabular-nums">
            Menampilkan{" "}
            <span className="font-medium text-txt">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, sorted.length)}
            </span>{" "}
            dari {sorted.length} fitur
          </p>
          <nav
            aria-label="Pagination"
            className="flex items-center gap-1.5 flex-wrap"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
              className="h-9 px-3 rounded-md border border-border text-[11px] font-semibold text-txt hover:bg-surface disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-brand/40"
            >
              ← Prev
            </button>
            <ul className="flex items-center gap-1">
              {getPageItems(page, totalPages).map((item, i) =>
                item === "ellipsis" ? (
                  <li
                    key={`e-${i}`}
                    aria-hidden
                    className="px-1.5 text-[11px] text-txt-dim tabular-nums select-none"
                  >
                    …
                  </li>
                ) : (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => setPage(item)}
                      aria-label={`Halaman ${item}`}
                      aria-current={item === page ? "page" : undefined}
                      className={`h-9 min-w-9 px-2.5 rounded-md border text-[11px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-brand/40 ${
                        item === page
                          ? "border-brand bg-brand text-white"
                          : "border-border text-txt hover:bg-surface"
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ),
              )}
            </ul>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Halaman berikutnya"
              className="h-9 px-3 rounded-md border border-border text-[11px] font-semibold text-txt hover:bg-surface disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-brand/40"
            >
              Next →
            </button>
          </nav>
        </footer>
      )}
    </section>
    <RecommendationSidebar
      row={sidebarRow}
      onClose={() => setSidebarRow(null)}
    />
    </>
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
  const isZombie = row.investment.classification === "DEPRECATION CANDIDATE";
  const rowTone = isZombie
    ? isOpen
      ? "bg-danger/15"
      : "bg-danger/[0.06] hover:bg-danger/10"
    : isOpen
      ? "bg-brand-light/40"
      : "hover:bg-brand-light/20";
  return (
    <tr
      className={`border-b transition-colors ${rowTone} ${
        isZombie ? "border-danger/20" : "border-border"
      }`}
    >
      <td
        className={`px-4 py-3 whitespace-nowrap relative ${
          isZombie
            ? "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-danger"
            : ""
        }`}
      >
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
        <span className="line-clamp-2">
          <span className="text-[10px] font-semibold text-brand uppercase tracking-wider mr-1">
            AI
          </span>
          {row.investment.recommendation}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="mt-2 h-11 px-3 rounded-md border border-border text-[11px] font-semibold text-txt hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand/40"
        >
          Details →
        </button>
      </td>
    </tr>
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
    "STRATEGIC ASSET": {
      bg: "bg-ok/12",
      text: "text-ok",
      border: "border-ok/25",
    },
    "UNDERPERFORMING": {
      bg: "bg-warn/15",
      text: "text-warn",
      border: "border-warn/30",
    },
    "DEPRECATION CANDIDATE": {
      bg: "bg-danger/12",
      text: "text-danger",
      border: "border-danger/25",
    },
    "EMERGING ASSET": {
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

const SIDEBAR_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function RecommendationSidebar({
  row,
  onClose,
}: {
  row: Row | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (row == null) return;
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 280);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [row, onClose]);

  useEffect(() => {
    if (row == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [row]);

  if (row == null) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none opacity-100"
        style={{ transitionTimingFunction: SIDEBAR_EASE }}
      />
      <aside
        aria-label="AI feature recommendation details"
        className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-surface border-l border-border z-50 flex flex-col shadow-[-16px_0_48px_-16px_rgba(0,0,0,0.25)] will-change-transform transition-transform duration-[320ms] motion-reduce:transition-none translate-x-0"
        style={{ transitionTimingFunction: SIDEBAR_EASE }}
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand font-semibold">
              AI Feature Details
            </p>
            <code className="mt-1.5 block text-[12px] text-txt font-mono break-all leading-snug">
              {row.endpoint.path}
            </code>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <ClassBadge classification={row.investment.classification} />
              <span className="text-[11px] text-txt-muted truncate">
                {row.investment.module}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="h-9 w-9 rounded-md hover:bg-surface-dim text-txt-muted hover:text-txt flex items-center justify-center text-lg shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-brand/40"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <SidebarBody row={row} />
        </div>
      </aside>
    </>
  );
}

function SidebarBody({ row }: { row: Row }) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-[11px] font-display font-semibold uppercase tracking-[0.12em] text-txt-dim mb-2">
          AI Recommendation
        </p>
        <p className="text-xs text-txt leading-relaxed">
          {row.investment.recommendation}
        </p>
      </section>

      <section>
        <p className="text-[11px] font-display font-semibold uppercase tracking-[0.12em] text-txt-dim mb-2.5">
          Feature Metrics
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <MiniStat label="Adoption" value={`${row.endpoint.adoption}%`} />
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
      </section>

      <section>
        <p className="text-[11px] font-display font-semibold uppercase tracking-[0.12em] text-txt-dim mb-2.5">
          Investment &amp; Trend
        </p>
        <div className="rounded-md border border-border bg-surface px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-txt-dim font-semibold">
              Est. Investment
            </div>
            <div className="text-[13px] font-display font-bold text-txt tabular-nums truncate">
              {idr(row.investment.investedIDR)}
            </div>
          </div>
          <TrendCell trend={row.investment.trend} />
        </div>
      </section>
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
