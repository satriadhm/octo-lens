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
  const p95Val = Math.round(endpoint.p95Ms ?? 0);
  const errPct = (endpoint.errorRate ?? 0).toFixed(2);
  const idrText = idr(investedIDR);

  const isHighInvestment = investedIDR > HIGH_INVESTMENT_IDR;
  const isLowAdoption = adoption < LOW_ADOPTION_PCT;
  const isHighAdoption = adoption >= HIGH_ADOPTION_PCT;

  if (isHighAdoption && trend === "down" && classification === "STRATEGIC ASSET") {
    return (
        "Pemakaian fitur pilar melemah meski minat sempat tinggi, sehingga jalan kritis percepatan pelanggan terasa guncang. " +
        `Dengan adopsi ${adoption}%, P95 di ${p95Val}ms, error rate ${errPct}%, dan investasi ${idrText} masih tercatat, sinyal teknis harus disandingkan laju penurunan minat supaya puncak beban aman. ` +
        "Raporkan data pemakaian 14 hari ke depan, pilih tiga alur paling sibuk, lalu rencanakan uji coba perbaikan kecil yang terukur sebelum puncak trafik berikutnya."
    );
  }

  if (isLowAdoption && trend === "up") {
    return (
      "Friksi pendaftaran sudah mendingan dan traksi tumbuh, tapi basis pengguna relatif sempit. " +
        `Dengan adopsi ${adoption}%, P95 di ${p95Val}ms, error rate ${errPct}%, sementara investasi ${idrText} belum penuh terbayar, hambatannya hampir pasti bukan murni keandalan. ` +
        "Tempelkan pemanduan tiga layar pasca-login dan sorot ajakan bertindak ke fitur di halaman depan, lalu ukur lonjakan pemakaian dalam 14 hari."
    );
  }

  if (isLowAdoption && trend === "dead") {
    return (
      "Fitur ini hampir tidak tumbuh: minat sekarat, basis pengguna tipis, dan sinyal pertumbuhan hilang. " +
        `Adopsi hanya ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, sementara investasi ${idrText} terus tercatat sehingga perawatan makan daya tim tanpa laju bisnis. ` +
        "Tetapkan workshop 90 menit pekan depan, susun pilihan sunset atau pengalihan lalu lintas ke modul inti, lalu pilih tanggal teknis penonaktifan."
    );
  }

  if (classification === "STRATEGIC ASSET") {
    if (trend === "down") {
      return (
        "Laju minat melemah di jalur pilar, sehingga perhatian pengguna sering terseret ke pilihan lain. " +
          `Dengan adopsi ${adoption}%, P95 di ${p95Val}ms, error ${errPct}%, dan porsi dana ${idrText} sudah ditanam, keseimbangan perawatan kembali tergelincir. ` +
          "Agendakan audit tiga hari fokus regresi UX, tampilkan lima poin temuan, lalu rilis perbaikan terukur pada alur tumpahan terbesar."
      );
    }
    if (trend === "flat") {
      return (
        "Lalu lintas fitur pilar rata, jadi sinyal pertumbuhan alami tidak muncul meski puncak panggilan belum terganggu. " +
          `Adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, serta investasi ${idrText} menunjukkan kebutuhan cadangan puncak, bukan ledakan. ` +
          `Jalankan uji puncak beban 30 menit di staging, bandingkan waktu p95 uji terhadap ${p95Val}ms produksi, lalu setel pemberitahuan on-call bila produksi melebihi p95 uji.`
      );
    }
    return (
      "Tulang punggung layanan stabil dan tren minat cenderung naik, jadi waktu mendorong pemanfaatan sebelum tekanan biaya. " +
        `Dengan adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, plus investasi ${idrText} yang perlu divalidasi hasil, risiko tumpukan fitur tampil kecil. ` +
        `Bandingkan waktu p95 produksi tiap puncak mingguan; jika melampaui ${p95Val}ms berturut-turut, tambah sumber puncak, lalu cek cadangan puncak sebelum rilis kritis.`
    );
  }

  if (classification === "EMERGING ASSET") {
    if (trend === "flat") {
      return (
        "Fitur muda tampil di peluncuran, tapi pemanfaatannya dangkal sehingga sinyal nilai hanya setengah tercium. " +
          `Hanya ${adoption}% yang mengaktifkan alur, P95 di ${p95Val}ms, error ${errPct}%, sementara investasi ${idrText} belum tercatat penuh di perilaku. ` +
          "Taruh pemanduan tiga layar pasca-aktivasi, ukur laju selesai tiap layar, lalu sederhanakan layar tersumbat paling lama bila laju selesai tidak naik 14 hari ke depan."
      );
    }
    if (trend === "up") {
      return (
        "Gelombang pemanfaatan fitur muda tumbuh, tapi cakupan pengguna kian tipis. " +
          `Dengan adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, plus investasi ${idrText} yang harus ditarik, jendela penguatan sinyal terbuka. ` +
          "Kirim notifikasi hari-tiga hanya ke kohort pendaftar baru, targetkan 15% batas tercapai dalam 30 hari, lalu matikan pemberitahuan jika respons di bawah ambang."
      );
    }
    if (trend === "down") {
      return (
        "Gairah awal mendingin sebelum problem–solution fit tercatat, jadi sinyal pasar tampak bercampur. " +
          `Adopsi hanya ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, dan porsi ${idrText} tercatat belum cukup menekan penurunan minat. ` +
          "Jadwalkan lima wawancara pengguna 45 menit, rekam top tiga poin pergeseran kebutuhan, lalu sederhanakan alur paling sibuk dalam satu rilis 30 hari."
      );
    }
    return (
      "Kegairahan fitur muda gugur sebelum jejak pertumbuhan muncul, sehingga utang teknis dini menggantung. " +
        `Dengan adopsi ${adoption}%, P95 di ${p95Val}ms, error ${errPct}%, sementara sisa investasi ${idrText} menanti keputusan, sinyal mati tampir pasti. ` +
        "Buat dokumen go/no-go dua halaman, tetapkan batas 14 hari, lalu pilih kill, pivot fitur, atau sederhanakan cakupan sebelum siklus pengerjaan menumpuk."
    );
  }

  if (classification === "UNDERPERFORMING") {
    if (isHighInvestment) {
      return (
        "Banyak uang tampak tercatat di sini, namun nilai yang dirasakan jatuh saat panggilan tumbuh, jadi porsi papan tulis menipis. " +
          `Investasi tercatat ${idrText}, adopsi ${adoption}%, P95 di ${p95Val}ms, error ${errPct}% bukan tanda sempurna kecocokan, melainkan tekanan biaya. ` +
          "Luncurkan root cause 5-why pekan depan, kunci tiga temuan, lalu sempitkan cakupan fitur paling mahal bila laju p95 memburuk dua pemeriksaan berturut-turut."
      );
    }
    return (
      "Nilai yang dirasakan berada jauh di bawah tuntutan, sehingga kepercayaan mudah terkikis di titik paling sensitif. " +
        `Dengan adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, dan sisa sinyal dana sekitar ${idrText} yang diminta validasi, tekanan teknis tampil nyata. ` +
        "Tugaskan pembenahan dua bug paling ribut dari log produksi, tindak 48 jam, lalu baca ulang p95 bila panggilan puncak tercapai."
    );
  }

  if (classification === "DEPRECATION CANDIDATE") {
    if (trend === "dead" || isLowAdoption) {
      return (
        "Banyak ruang tersisa, kegairahan pengguna sempit, sehingga fitur ini makan biaya sehari-hari. " +
          `Hanya ${adoption}% basis aktif, P95 di ${p95Val}ms, error ${errPct}%, sementara investasi ${idrText} sukar dibuktikan lewat dampak pemakaian. ` +
        "Hentikan rilis perbaikan; arahkan sumber daya ke modul paling sibuk, lalu tandai batas 60 hari sebelum pencadangan penuh fitur dinyalakan."
      );
    }
    return (
      "Sinyal pemanfaatan campuran, jadi tindakan keras belum tuntas namun tren tidak penuh melemah. " +
        `Dengan adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, dan cakupan dana tercatat ${idrText}, waktu cukup untuk baca ulang. ` +
        "Simpan bacaan panggilan, biaya, dan waktu p95 tiap hari Jumat, lalu putuskan ambang 30% penurunan permintaan sebagai syarat rencana retire sebelum siklus rilis ganda."
    );
  }

  return (
    "Portofolio meminta baca siklus: belum cukup sinyal untuk mendorong investasi tajam, namun tren tidak penuh mati. " +
      `Dengan adopsi ${adoption}%, P95 ${p95Val}ms, error ${errPct}%, sementara cakupan dana tercatat ${idrText} menanti keputusan, sinyal perlu waktu. ` +
      "Tempel tabel tujuh hari: adopsi, waktu p95, jumlah panggilan, lalu tahan eskalasi investasi bila tiga sinyal tren tidak melambung dalam 30 hari ke depan."
  );
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
