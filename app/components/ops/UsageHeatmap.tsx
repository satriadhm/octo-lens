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

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="grid grid-cols-10 gap-1">
        {list.map((value, idx) => {
          const level = normalize(value, min, max);
          const opacity = 0.15 + level * 0.85;
          return (
            <div
              key={`${idx}-${value}`}
              className="h-3 rounded-[2px] bg-brand"
              style={{ opacity }}
              title={`Traffic index: ${value}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 text-[10px] text-txt-dim font-mono">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.2, 0.35, 0.5, 0.7, 0.9].map((value) => (
            <div key={value} className="w-3 h-2 rounded-[2px] bg-brand" style={{ opacity: value }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
