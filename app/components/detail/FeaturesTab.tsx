"use client";

import type { App } from "@/app/lib/types";
import { Label, Badge } from "@/app/components/shared/Card";

interface FeaturesTabProps {
  app: App;
}

function adoptionColor(adoption: number) {
  if (adoption > 30) return "#059669";
  if (adoption > 10) return "#D97706";
  if (adoption > 2) return "#EA580C";
  return "#DC2626";
}

export function FeaturesTab({ app }: FeaturesTabProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Label>GOAL-TO-FEATURE TRACKER (API Adoption)</Label>

      {app.api.endpoints.map((ep, i) => {
        const adColor = adoptionColor(ep.adoption);
        const isZombie = ep.adoption < 2;

        return (
          <div
            key={i}
            className="rounded-lg px-3 py-2.5"
            style={{
              background: isZombie ? "#FEE2E230" : "var(--color-surface)",
              border: `1px solid ${isZombie ? "#DC262640" : "var(--color-border)"}`,
              borderLeft: `4px solid ${adColor}`,
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <code className="text-[10px] text-txt-muted font-mono">{ep.path}</code>
              {isZombie && (
                <Badge color="#DC2626" bg="#FEE2E2">
                  &#129503; Zombie
                </Badge>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <div>
                <div className="text-[9px] text-txt-dim font-mono">ADOPTION</div>
                <div className="text-lg font-extrabold font-mono" style={{ color: adColor }}>
                  {ep.adoption}%
                </div>
              </div>
              <div>
                <div className="text-[9px] text-txt-dim font-mono">CALLS/MO</div>
                <div className="text-lg font-extrabold font-mono text-txt">
                  {ep.calls.toLocaleString()}
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-surface-dim rounded-sm h-1.5">
                  <div
                    className="h-full rounded-sm transition-[width] duration-500"
                    style={{
                      background: adColor,
                      width: `${Math.min(100, ep.adoption)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            {isZombie && (
              <div className="text-[10px] text-danger mt-1.5 leading-relaxed">
                Fitur ini sudah dibangun tapi hampir tidak dipakai. Evaluasi apakah perlu
                dipertahankan.
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-surface border border-border rounded-lg px-3 py-2.5 mt-1">
        <div className="text-[10px] text-txt-muted">
          Total API calls bulan ini:{" "}
          <span className="text-txt font-mono font-bold">
            {app.api.totalReqs.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
