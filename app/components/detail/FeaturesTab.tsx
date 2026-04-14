"use client";

import type { App } from "@/app/lib/types";
import { Label, Badge } from "@/app/components/shared/Card";

interface FeaturesTabProps {
  app: App;
}

function adoptionColor(adoption: number) {
  if (adoption > 30) return "var(--color-green)";
  if (adoption > 10) return "var(--color-amber)";
  if (adoption > 2) return "var(--color-orange)";
  return "var(--color-red)";
}

export function FeaturesTab({ app }: FeaturesTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label>Goal-to-Feature Tracker (API Adoption)</Label>

      {app.api.endpoints.map((ep, i) => {
        const adColor = adoptionColor(ep.adoption);
        const isZombie = ep.adoption < 2;

        return (
          <div
            key={i}
            className="rounded-lg px-4 py-3"
            style={{
              background: isZombie
                ? "color-mix(in oklch, var(--color-red) 5%, transparent)"
                : "var(--color-surface)",
              border: `1px solid ${isZombie ? "color-mix(in oklch, var(--color-red) 20%, transparent)" : "var(--color-border)"}`,
            }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <code className="text-[11px] text-txt-muted font-mono">
                {ep.path}
              </code>
              {isZombie && (
                <Badge color="var(--color-red)" bg="var(--color-red-dim)">
                  Zombie
                </Badge>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <div className="text-[10px] text-txt-dim font-display font-medium uppercase tracking-wider">
                  Adoption
                </div>
                <div
                  className="text-lg font-display font-extrabold"
                  style={{ color: adColor }}
                >
                  {ep.adoption}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-txt-dim font-display font-medium uppercase tracking-wider">
                  Calls/mo
                </div>
                <div className="text-lg font-display font-extrabold text-txt font-mono tabular-nums">
                  {ep.calls.toLocaleString()}
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-surface-dim rounded-full h-1.5">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      background: adColor,
                      width: `${Math.min(100, ep.adoption)}%`,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            </div>
            {isZombie && (
              <p className="text-xs text-danger mt-2 leading-relaxed">
                This feature was built but is barely used. Evaluate whether to
                keep it.
              </p>
            )}
          </div>
        );
      })}

      <div className="bg-surface border border-border rounded-lg px-4 py-3 mt-1">
        <div className="text-xs text-txt-muted">
          Total API calls this month:{" "}
          <span className="text-txt font-mono font-semibold tabular-nums">
            {app.api.totalReqs.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
