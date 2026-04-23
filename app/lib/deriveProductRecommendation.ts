import type { ApiEndpoint, FeatureInvestment } from "./types";
import { idr } from "./calculators";

const HIGH_INVESTMENT_IDR = 500_000_000;
const LOW_ADOPTION_PCT = 10;
const HIGH_ADOPTION_PCT = 35;

/**
 * Deterministic, portfolio-style coaching copy for the Feature Value Matrix
 * (replaces static demo strings tied to seed data).
 */
export function deriveProductRecommendation(
  inv: FeatureInvestment,
  endpoint: ApiEndpoint,
): string {
  const { classification, trend, investedIDR } = inv;
  const adoption = endpoint.adoption;

  const isHighInvestment = investedIDR > HIGH_INVESTMENT_IDR;
  const isLowAdoption = adoption < LOW_ADOPTION_PCT;
  const isHighAdoption = adoption >= HIGH_ADOPTION_PCT;

  if (isHighAdoption && trend === "down" && classification === "STRATEGIC ASSET") {
    return (
      "Optimize — Fitur dengan adopsi luas mengalami degradasi minat; investigasi regresi performa, " +
      "pergeseran kebutuhan pasar, atau friksi UX. Lindungi pengalaman utama dengan SLA, observabilitas, " +
      "dan headroom kapasitas di puncak trafik."
    );
  }

  if (isLowAdoption && trend === "up") {
    return (
      "Scale — Fitur mulai mendapat traksi; beri dukungan go-to-market tambahan dan permudah onboarding " +
      "untuk mempercepat siklus adopsi."
    );
  }

  if (isLowAdoption && trend === "dead") {
    return (
      "Rationalize — Fitur zombie: adopsi " +
      adoption +
      "% dengan tren mati. Aset ini memakan biaya pemeliharaan tanpa imbal hasil bisnis yang jelas; " +
      "jadwalkan rencana sunset atau konsolidasi ke modul utama."
    );
  }

  if (classification === "STRATEGIC ASSET") {
    if (trend === "down") {
      return (
        "Defend & excel — Sinyal market saturation atau friction detection: audit UX dan alur kritis. " +
        "Pastikan headroom kapasitas aman saat trafik puncak agar pengalaman inti tetap stabil."
      );
    }
    if (trend === "flat") {
      return (
        "Defend & excel — Trafik datar: pantau friksi dan cannibalization fitur. Pertahankan P95 di bawah SLA " +
        "dan cadangan kapasitas untuk segmen pengguna terbesar."
      );
    }
    return (
      "Defend & excel — Backbone layanan stabil; jaga performa P95 konsisten dan biaya variabel tetap terkendali " +
      "saat skala bertumbuh."
    );
  }

  if (classification === "EMERGING ASSET") {
    if (trend === "flat") {
      return (
        "Discover — Discovery gap: potensi fitur belum terbuka sepenuhnya; pertimbangkan optimasi onboarding " +
        "dan penyorotan nilai di produk agar pengguna baru lebih cepat menemukan manfaat."
      );
    }
    if (trend === "up") {
      return (
        "Discover — Momentum adopsi positif; perkuat edukasi in-app, aktivasi kohort, dan sinyal sukses awal " +
        "untuk mempercepat product-market fit."
      );
    }
    if (trend === "down") {
      return (
        "Discover — Validasi ulang problem–solution fit; sesuaikan positioning atau kurangi kompleksitas " +
        "sebelum investasi engineering bertambah."
      );
    }
    return (
      "Rationalize — Tren mati pada fitur muda; putuskan kill atau pivot singkat untuk menghindari utang teknis prematur."
    );
  }

  if (classification === "UNDERPERFORMING") {
    if (isHighInvestment) {
      return (
        "Optimize — Investment pivot: " +
        idr(investedIDR) +
        " pada fitur dengan efisiensi rendah relatif terhadap trafik. Lakukan root cause pada alur UX " +
        "atau pertimbangkan membatasi scope fungsionalitas."
      );
    }
    return (
      "Optimize — Value vs. friction di bawah ekspektasi; fokus pada stabilitas teknis, penyederhanaan alur, " +
      "dan penurunan error rate untuk memulihkan kepercayaan pengguna."
    );
  }

  if (classification === "DEPRECATION CANDIDATE") {
    if (trend === "dead" || isLowAdoption) {
      return (
        "Rationalize — Efisiensi biaya: fitur ini hanya dipakai sekitar " +
        adoption +
        "% basis pengguna. Rekomendasi retire atau konsolidasi ke jalur utama untuk mengurangi beban operasional."
      );
    }
    return (
      "Monitor — Tinjau pemakaian dan biaya tetap secara mingguan; tentukan cutoff berbasis data sebelum komitmen rilis berikutnya."
    );
  }

  return "Monitor — Pantau metrik penggunaan mingguan untuk menentukan siklus investasi berikutnya.";
}

export type ProductImpactLevel = "TINGGI" | "SEDANG" | "RENDAH";

export interface ProductImpactLine {
  /** FinOps / exec-friendly one-liner, e.g. cost vs satisfaction */
  label: string;
  level: ProductImpactLevel;
}

/**
 * Short estimated-impact line for executives (prefix/suffix in UI).
 */
export function deriveProductImpactLine(
  inv: FeatureInvestment,
  endpoint: ApiEndpoint,
): ProductImpactLine {
  const { classification, trend, investedIDR } = inv;
  const adoption = endpoint.adoption;
  const isLowAdoption = adoption < LOW_ADOPTION_PCT;
  const isHighInvestment = investedIDR > HIGH_INVESTMENT_IDR;
  const isHighAdoption = adoption >= HIGH_ADOPTION_PCT;

  if (
    classification === "DEPRECATION CANDIDATE" ||
    (isLowAdoption && trend === "dead")
  ) {
    return {
      label: "Potensi efisiensi biaya operasional",
      level: "TINGGI",
    };
  }

  if (classification === "UNDERPERFORMING" && isHighInvestment) {
    return {
      label: "Potensi efisiensi biaya operasional",
      level: "TINGGI",
    };
  }

  if (classification === "STRATEGIC ASSET" && (trend === "down" || trend === "flat")) {
    return {
      label: "Risiko kepuasan pelanggan",
      level: trend === "down" ? "TINGGI" : "SEDANG",
    };
  }

  if (isHighAdoption && trend === "down") {
    return {
      label: "Risiko kepuasan pelanggan",
      level: "TINGGI",
    };
  }

  if (classification === "EMERGING ASSET" && trend === "up") {
    return {
      label: "Peluang pertumbuhan adopsi",
      level: "TINGGI",
    };
  }

  if (classification === "EMERGING ASSET" && (trend === "flat" || trend === "down")) {
    return {
      label: "Peluang pertumbuhan adopsi",
      level: "SEDANG",
    };
  }

  if (classification === "UNDERPERFORMING" && !isHighInvestment) {
    return {
      label: "Risiko kepuasan pelanggan",
      level: "SEDANG",
    };
  }

  if (isLowAdoption && trend === "up") {
    return {
      label: "Peluang pertumbuhan adopsi",
      level: "SEDANG",
    };
  }

  if (classification === "STRATEGIC ASSET" && trend === "up") {
    return {
      label: "Risiko kepuasan pelanggan",
      level: "RENDAH",
    };
  }

  return {
    label: "Dampak pada portofolio produk",
    level: "SEDANG",
  };
}

export function formatProductImpactLine(impact: ProductImpactLine): string {
  return `${impact.label}: ${impact.level}`;
}
