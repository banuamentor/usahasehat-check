import type { BusinessStage, OfferingType } from "@/types/assessment";

export const OFFERING_TYPES: Array<{ value: OfferingType; label: string }> = [
  { value: "produk", label: "Menjual barang/produk" },
  { value: "jasa", label: "Menjual jasa/layanan" },
  { value: "keduanya", label: "Keduanya" },
];

export const BUSINESS_CATEGORIES: Array<{ value: string; label: string; defaults: { hasInventory: boolean; repeatPurchaseApplicable: boolean } }> = [
  { value: "makanan_minuman", label: "Makanan & minuman", defaults: { hasInventory: true, repeatPurchaseApplicable: true } },
  { value: "fashion", label: "Fashion & tekstil", defaults: { hasInventory: true, repeatPurchaseApplicable: true } },
  { value: "kerajinan", label: "Kerajinan & dekorasi", defaults: { hasInventory: true, repeatPurchaseApplicable: false } },
  { value: "pertanian", label: "Pertanian & perikanan", defaults: { hasInventory: true, repeatPurchaseApplicable: true } },
  { value: "dagang", label: "Toko/dagang barang", defaults: { hasInventory: true, repeatPurchaseApplicable: true } },
  { value: "jasa_harian", label: "Jasa harian (laundry, servis, salon)", defaults: { hasInventory: false, repeatPurchaseApplicable: true } },
  { value: "jasa_proyek", label: "Jasa proyek/acara (wedding, konstruksi, custom)", defaults: { hasInventory: false, repeatPurchaseApplicable: false } },
  { value: "jasa_profesional", label: "Jasa profesional (desain, konsultan, pengajar)", defaults: { hasInventory: false, repeatPurchaseApplicable: true } },
  { value: "lainnya", label: "Lainnya", defaults: { hasInventory: false, repeatPurchaseApplicable: true } },
];

export const REVENUE_RANGES: Array<{ value: string; label: string }> = [
  { value: "lt_5jt", label: "Kurang dari Rp5 juta per bulan" },
  { value: "5_20jt", label: "Rp5 juta – Rp20 juta per bulan" },
  { value: "20_50jt", label: "Rp20 juta – Rp50 juta per bulan" },
  { value: "50_200jt", label: "Rp50 juta – Rp200 juta per bulan" },
  { value: "gt_200jt", label: "Lebih dari Rp200 juta per bulan" },
  { value: "belum_tahu", label: "Belum tahu pasti" },
];

export const BUSINESS_STAGES: Array<{ value: BusinessStage; label: string; description: string }> = [
  { value: "rintisan", label: "Rintisan", description: "Baru mulai, penjualan belum stabil." },
  { value: "bertumbuh", label: "Bertumbuh", description: "Sudah ada pembeli tetap, penjualan mulai naik." },
  { value: "berkembang", label: "Berkembang", description: "Penjualan stabil, sudah ada tim atau sistem sederhana." },
  { value: "scale_up", label: "Siap membesar", description: "Sedang menyiapkan perluasan usaha." },
];

/** Legalitas dasar per kategori usaha (konfigurasi sederhana untuk MVP, bukan nasihat hukum). */
export const LEGALITY_REQUIREMENTS: Record<string, string[]> = {
  makanan_minuman: ["NIB", "Sertifikat halal (bila relevan)", "SPP-IRT/PIRT untuk produk kemasan"],
  fashion: ["NIB", "Merek terdaftar (opsional)"],
  kerajinan: ["NIB", "Merek terdaftar (opsional)"],
  pertanian: ["NIB", "Izin usaha sesuai komoditas"],
  dagang: ["NIB", "Izin usaha perdagangan sesuai skala"],
  jasa_harian: ["NIB"],
  jasa_proyek: ["NIB", "Legalitas badan usaha bila mengikuti tender"],
  jasa_profesional: ["NIB"],
  lainnya: ["NIB"],
};
