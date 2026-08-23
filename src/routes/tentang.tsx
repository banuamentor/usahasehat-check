import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { DIMENSIONS, HEALTH_STATUS_RULES, INDICATORS, QUESTIONNAIRE_VERSION, SCORING_VERSION } from "@/config/framework";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Cara Kerja Pemeriksaan — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content:
          "Penjelasan cara pemeriksaan kesehatan bisnis UMKM: 31 pertanyaan, 7 area usaha, cara skor dihitung, dan bagaimana risiko ditandai.",
      },
      { property: "og:title", content: "Cara Kerja Pemeriksaan Kesehatan Bisnis UMKM" },
      {
        property: "og:description",
        content: "31 pertanyaan, 7 area usaha, skor 0–100, peringatan risiko, dan tiga prioritas perbaikan.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">Cara kerja pemeriksaan</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pemeriksaan memakai {INDICATORS.length} pertanyaan inti pada {DIMENSIONS.length} area usaha. Semua perhitungan
          memakai aturan tetap (versi kuesioner {QUESTIONNAIRE_VERSION}, versi perhitungan {SCORING_VERSION}), bukan
          perkiraan bebas.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Area yang diperiksa dan porsinya</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {DIMENSIONS.map((dimension) => (
            <li key={dimension.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-3">
              <span>
                <span className="font-medium text-foreground">{dimension.name}</span>
                <span className="mt-1 block text-muted-foreground">{dimension.purpose}</span>
              </span>
              <span className="shrink-0 font-semibold text-foreground">{Math.round(dimension.weight * 100)}%</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Arti skor</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {HEALTH_STATUS_RULES.map((rule) => (
            <li key={rule.id} className="rounded-lg border border-border bg-card p-3">
              <span className="font-medium text-foreground">
                {rule.min}–{rule.max}: {rule.label}
              </span>
              <span className="mt-1 block text-muted-foreground">{rule.summary}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Pertanyaan yang tidak relevan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bila sebuah pertanyaan tidak sesuai dengan model usaha Anda, misalnya pembelian ulang pada usaha acara atau
          stok bahan pada usaha jasa, pertanyaan tersebut ditandai tidak relevan dan tidak ikut dihitung. Usaha Anda
          tidak dirugikan karena modelnya berbeda.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Batasan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hasil ini adalah alat bantu untuk memahami kondisi usaha berdasarkan jawaban yang diberikan. Hasil bukan audit
          keuangan, penilaian kredit, atau nasihat hukum. Batas nilai masih berupa acuan awal dan akan disempurnakan
          melalui uji lapangan.
        </p>

        <Link
          to="/assessment/start"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Mulai pemeriksaan
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
