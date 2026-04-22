/** Returns a CSS var string for response time traffic-light coloring */
export function rtColor(ms: number): string {
  if (ms > 700) return "var(--color-red)";
  if (ms > 400) return "var(--color-amber)";
  return "var(--color-green)";
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

export type Persona = "business" | "technical";

export type MetricKind =
  | "responseMs"
  | "p95Ms"
  | "errorRate"
  | "uptime"
  | "cpuUtil"
  | "mau"
  | "totalRequests"
  | "costPerRequest";

export interface Metric {
  kind: MetricKind;
  value: number;
  /** Optional extra values referenced by the formatter (e.g. threshold). */
  context?: Record<string, number | string | undefined>;
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("id-ID");
}

function fmtIDR(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} miliar`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} juta`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} ribu`;
  return `Rp ${fmtInt(n)}`;
}

/**
 * Render a metric into persona-appropriate copy. Business strings are
 * written as plain-language Indonesian, technical strings stay in the
 * condensed English notation engineers expect.
 */
export function formatForPersona(m: Metric, persona: Persona): string {
  switch (m.kind) {
    case "responseMs": {
      if (persona === "technical") {
        return `Avg response time: ${fmtInt(m.value)}ms`;
      }
      const seconds = (m.value / 1000).toFixed(1);
      if (m.value > 1500) {
        return `Aplikasi terasa lambat bagi pengguna (rata-rata ${seconds} detik per request)`;
      }
      if (m.value > 700) {
        return `Respons aplikasi mulai terasa berat — rata-rata ${seconds} detik per request`;
      }
      return `Respons aplikasi terasa ringan (${seconds} detik per request)`;
    }

    case "p95Ms": {
      if (persona === "technical") {
        return `P95 latency: ${fmtInt(m.value)}ms`;
      }
      const seconds = (m.value / 1000).toFixed(1);
      return `Pada jam sibuk, sebagian pengguna menunggu hingga ${seconds} detik untuk satu aksi`;
    }

    case "errorRate": {
      if (persona === "technical") {
        return `Error rate: ${m.value.toFixed(2)}% (5xx)`;
      }
      const perHundred = Math.max(1, Math.round(m.value));
      return `${perHundred} dari 100 transaksi mengalami kegagalan sistem`;
    }

    case "uptime": {
      if (persona === "technical") {
        return `Uptime: ${m.value.toFixed(2)}%`;
      }
      const downtimeHoursPerMonth = ((100 - m.value) / 100) * 24 * 30;
      return `Layanan sempat tidak tersedia sekitar ${downtimeHoursPerMonth.toFixed(1)} jam bulan ini`;
    }

    case "cpuUtil": {
      if (persona === "technical") {
        return `CPU utilization: ${m.value}% — ${m.value >= 80 ? "approaching threshold" : "within safe range"}`;
      }
      if (m.value >= 80) {
        return `Server hampir tidak kuat menampung beban saat ini dan perlu segera di-upgrade`;
      }
      return `Kapasitas server masih aman untuk beban saat ini`;
    }

    case "mau": {
      if (persona === "technical") {
        return `MAU: ${fmtInt(m.value)}`;
      }
      return `${fmtInt(m.value)} pengguna aktif bulanan`;
    }

    case "totalRequests": {
      if (persona === "technical") {
        return `Total requests: ${fmtInt(m.value)}`;
      }
      const perDay = Math.round(m.value / 30);
      return `Rata-rata ${fmtInt(perDay)} transaksi per hari`;
    }

    case "costPerRequest": {
      if (persona === "technical") {
        return `Cost/req: ${fmtIDR(m.value)}`;
      }
      return `Setiap request rata-rata menelan biaya ${fmtIDR(m.value)}`;
    }

    default:
      return String(m.value);
  }
}

