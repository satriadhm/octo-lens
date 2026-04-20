/** Returns a CSS var string for response time traffic-light coloring */
export function rtColor(ms: number): string {
  if (ms > 700) return "var(--color-red)";
  if (ms > 400) return "var(--color-amber)";
  return "var(--color-green)";
}

/** Returns a CSS var string for UX score traffic-light coloring */
export function uxColor(score: number): string {
  if (score >= 70) return "var(--color-green)";
  if (score >= 50) return "var(--color-amber)";
  return "var(--color-red)";
}

/** Returns a CSS var string for error rate traffic-light coloring */
export function errorRateColor(rate: number): string {
  if (rate > 3) return "var(--color-red)";
  if (rate > 1) return "var(--color-amber)";
  return "var(--color-green)";
}

/** Returns a CSS var string for adoption % traffic-light coloring */
export function adoptionColor(adoption: number): string {
  if (adoption >= 30) return "var(--color-green)";
  if (adoption >= 10) return "var(--color-amber)";
  if (adoption >= 2) return "var(--color-orange)";
  return "var(--color-red)";
}
