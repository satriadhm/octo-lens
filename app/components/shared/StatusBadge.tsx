"use client";

import { Badge } from "@/app/components/shared/Card";

interface StatusBadgeProps {
  status: number;
}

function statusTone(status: number) {
  if (status >= 500) {
    return { color: "var(--color-red)", bg: "color-mix(in oklch, var(--color-red) 12%, transparent)" };
  }
  if (status >= 400) {
    return { color: "var(--color-amber)", bg: "color-mix(in oklch, var(--color-amber) 12%, transparent)" };
  }
  if (status >= 300) {
    return { color: "var(--color-blue)", bg: "color-mix(in oklch, var(--color-blue) 12%, transparent)" };
  }
  return { color: "var(--color-green)", bg: "color-mix(in oklch, var(--color-green) 12%, transparent)" };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = statusTone(status);
  return (
    <Badge color={tone.color} bg={tone.bg}>
      {status}
    </Badge>
  );
}
