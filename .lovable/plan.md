# Business Health Check UMKM — Rencana Pembangunan

Sumber kebenaran: Measurement Framework v0.2 (31 indikator, 7 dimensi, 20 Critical Flags) lalu PRD v1.0. Tidak ada pertanyaan, bobot, threshold, atau flag baru yang dikarang.

## Catatan stack (penting)

Build prompt meminta Next.js App Router. Project ini berjalan di TanStack Start (React 19 + Vite + TypeScript + Tailwind + shadcn/ui) dan router tidak bisa diganti. Semua kebutuhan setara terpenuhi: file-based routing, server functions (pengganti Server Actions), SSR. Database/Auth memakai Lovable Cloud (PostgreSQL + Auth + RLS). Zod + React Hook Form, Recharts untuk radar chart.

## Milestone 1 — Alur inti tanpa login (fokus utama)

Yang dibangun end-to-end sehingga tamu bisa: isi profil usaha → 31 pertanyaan adaptif → hasil lengkap.

1. **Data layer questionnaire (config-driven, versioned)**
   Seluruh 31 indikator diimpor dari framework ke tabel `questionnaire_versions`, `dimensions`, `indicators`, `questions`, `answer_options` — teks pertanyaan user-facing dan 5 opsi per pertanyaan diambil persis dari sheet "Questionnaire v0.2". Tidak ada pertanyaan yang di-hardcode di komponen React.
2. **Profil usaha** (`/assessment/start`): nama usaha, nama pemilik, produk/jasa, kategori, lama usaha, jumlah pekerja, kisaran omzet, pakai stok/bahan baku, repeat purchase relevan, tahap usaha. Dipakai untuk applicability, bukan kosmetik.
3. **Rule engine** generik (`equals, not_equals, gt, lt, gte, lte, in, not_in, exists` + ALL/ANY) dipakai untuk applicability, branching, dan trigger flag.
4. **Applicability sesuai framework**: CUS-02 N/A bila repeat purchase tidak relevan; OPS-03 N/A bila tanpa stok/bahan baku; OPS-01 & OPS-05 disesuaikan tim/tahap usaha; GRW-02 legalitas per kategori usaha (konfigurasi sederhana).
5. **UI assessment mobile-first**: satu pertanyaan per kartu, helper text, progress + nama dimensi, tombol Kembali/Lanjut, opsi "Tidak relevan" bila diizinkan, autosave ke localStorage untuk tamu.
6. **Scoring engine (pure functions, deterministik)**: skor indikator = raw/4×100; skor dimensi = Σ(raw×bobot)/Σ(4×bobot applicable)×100; overall = bobot 20/15/15/15/10/15/10; status dari tabel `health_status_rules` (39/54/69/84). Presisi 4 desimal disimpan, integer ditampilkan. Dimensi tanpa indikator applicable = `INSUFFICIENT_DATA`, bukan 0.
7. **Critical Flag engine**: 20 flag dari framework, lapisan terpisah dari skor. FIN-06 menyimpan `semantic_value` (`unknown` vs `less_than_2_weeks`) dengan diagnosis berbeda meski skor sama.
8. **Diagnosis + Top 3 Priorities + Action Plan 30 hari**: template diagnosis per dimensi dan cross-dimension (CD-01..CD-04) tersimpan sebagai data; prioritas diranking `severity 0.35 + impact 0.30 + urgency 0.20 + actionability 0.15` (skala 1–5), maksimal 3; action plan Minggu 1–4 dengan langkah konkret dan kriteria selesai.
9. **Halaman hasil** `/results/[id]` sesuai urutan PRD: skor + status → diagnosis → risiko kritis → Top 3 Prioritas → 7 dimensi → kekuatan → rencana 30 hari → CTA simpan/daftar. Radar chart lazy-load dan tidak dominan. Disclaimer singkat.
10. **Landing page** `/`: hero "Cek Kesehatan Bisnis Anda", cara kerja, 7 area yang diperiksa, contoh hasil, CTA "Cek Bisnis Saya" (7–10 menit), trust copy.
11. **Unit test scoring**: skor 0, skor 4, campuran, satu N/A, banyak N/A, semua N/A, dimensi, overall berbobot, flag, FIN-06 unknown vs <2 minggu.

## Milestone 2 — Akun, dashboard, riwayat

Auth email/password Lovable Cloud, simpan hasil tamu ke akun setelah daftar, dashboard UMKM (skor terkini, risiko, prioritas, progres action plan, 7 dimensi, riwayat), reassessment immutable (assessment lama tidak ditimpa), perbandingan hanya bila `questionnaire_version` + `scoring_version` cocok, halaman detail dimensi, action plan tracking (todo/doing/done).

## Milestone 3 — Laporan & mentor dasar

PDF/print laporan, lalu mentor/program dashboard minimal: ringkasan portofolio, masalah umum, daftar UMKM + filter, hanya untuk bisnis yang di-assign.

## Detail teknis

- **Skema DB** (Lovable Cloud): `businesses`, `business_profiles`, `questionnaire_versions`, `dimensions`, `indicators`, `questions`, `answer_options`, `assessments`, `assessment_answers` (menyimpan `semantic_value`, `raw_value`, `score`, `is_applicable`), `dimension_scores`, `assessment_results`, `critical_flags`, `assessment_flags`, `diagnosis_rules`, `diagnosis_results`, `priority_results`, `action_plans`, `action_items`, `user_roles` (tabel terpisah, enum: umkm/mentor/program_manager/admin), plus `programs`/`program_memberships`/`mentor_assignments` di Milestone 3. Setiap tabel dengan GRANT + RLS; tanpa RLS dinonaktifkan.
- **Struktur kode**: `src/lib/rules/` (rule engine), `src/lib/scoring/` (pure functions: `calculateIndicatorScore`, `calculateDimensionScore`, `calculateOverallScore`, `resolveHealthStatus`, `evaluateApplicability`, `evaluateCriticalFlags`, `rankPriorities`), `src/lib/diagnosis/`, `src/config/` (bobot, threshold, versi), `src/features/*`, `src/components/*`. Tidak ada business rule di JSX.
- **Guest**: assessment berjalan di client dengan data questionnaire dari server function; hasil dihitung deterministik dan baru dipersist saat user membuat akun.
- **AI**: tidak dipakai di MVP; engine deterministik dulu, arsitektur menyisakan lapisan interpretasi opsional.
- **Seed demo**: 3 UMKM (makanan dengan stok+repeat, jasa event tanpa keduanya, profesional solo) untuk membuktikan branching dan N/A tidak menghukum.

## Asumsi

- Kalimat pertanyaan dan opsi memakai sheet "Questionnaire v0.2" (hasil audit), bukan kalimat lama di Master Framework.
- Severity framework dipetakan: Kritis→critical, Tinggi→high, Sedang→medium.
- Flag bertanda `*` (CF-CUS-02, CF-GRW-01) hanya aktif bila kondisi applicability terpenuhi.
- Legalitas per kategori usaha memakai konfigurasi sederhana dan tidak diklaim sebagai nasihat hukum.
