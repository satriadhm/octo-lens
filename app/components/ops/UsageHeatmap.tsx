"use client";

interface UsageHeatmapProps {
  values: number[];
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0.2;
  return (value - min) / (max - min);
}

export function UsageHeatmap({ values }: UsageHeatmapProps) {
  const list = values.slice(0, 70);
  if (list.length === 0) {
    return <div className="mt-2 text-xs text-txt-dim">No activity data.</div>;
  }
  const min = Math.min(...list);
  const max = Math.max(...list);
  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-start gap-1.5">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-0">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-3 flex items-center">
              <span className="text-[9px] text-txt-dim font-mono w-4">{d}</span>
            </div>
          ))}
        </div>
        {/* Grid — 10 columns × 7 rows = 70 days */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(7, 1fr)",
            gridAutoFlow: "column",
          }}
        >
          {list.map((value, idx) => {
            const level = normalize(value, min, max);
            const opacity = 0.12 + level * 0.88;
            return (
              <div
                key={`${idx}-${value}`}
                className="h-3 w-3 rounded-[2px] bg-brand"
                style={{ opacity }}
                title={`Day ${idx + 1} · Traffic index: ${value}`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-txt-dim font-mono">
        <span>10 weeks · Last 70 days</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex gap-1">
            {[0.15, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-3 h-2 rounded-[2px] bg-brand" style={{ opacity: v }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
