"use client";

import { Badge } from "@/app/components/shared/Card";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: HttpMethod;
}

function methodColor(method: HttpMethod) {
  switch (method) {
    case "GET":
      return { color: "var(--color-blue)", bg: "color-mix(in oklch, var(--color-blue) 12%, transparent)" };
    case "POST":
      return { color: "var(--color-green)", bg: "color-mix(in oklch, var(--color-green) 12%, transparent)" };
    case "PUT":
      return { color: "var(--color-amber)", bg: "color-mix(in oklch, var(--color-amber) 12%, transparent)" };
    case "DELETE":
      return { color: "var(--color-red)", bg: "color-mix(in oklch, var(--color-red) 12%, transparent)" };
    default:
      return { color: "var(--color-text-dim)", bg: "var(--color-surface-dim)" };
  }
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const tone = methodColor(method);
  return (
    <Badge color={tone.color} bg={tone.bg}>
      {method}
    </Badge>
  );
}
