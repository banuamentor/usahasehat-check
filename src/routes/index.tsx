import { createFileRoute, Link } from "@tanstack/react-router";

import heroIllustration from "../assets/hero-illustration.jpg.asset.json";
import { ArrowRight, ClipboardList, Compass, ListChecks, ShieldAlert } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { ScoreBar, StatusBadge, toneForScore } from "@/components/results/score-display";
import { Card, CardContent } from "@/components/ui/card";
import { DIMENSIONS } from "@/config/framework";
import { DEMO_SCENARIOS, demoAnswers } from "@/features/assessment/demo";
import { buildAssessmentResult } from "@/lib/assessment/result-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cek Kesehatan Bisnis Anda — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content:
          "Periksa kondisi usaha Anda dalam 7–10 menit: skor kesehatan bisnis, risiko yang perlu diwaspadai, 3 prioritas perbaikan, dan rencana 30 hari.",
      },
      { property: "og:title", content: "Cek Kesehatan Bisnis Anda dalam 7–10 Menit" },
      {
        property: "og:description",
        content:
          "Alat bantu diagnosis untuk pelaku UMKM: tahu bagian usaha yang kuat, masalah utama, dan apa yang sebaiknya dikerjakan lebih dulu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const steps = [
  { icon: ClipboardList, title: "Isi profil usaha", text: "Sekitar 1 menit. Dipakai agar pertanyaan sesuai jenis usaha Anda." },
  { icon: Compass, title: "Jawab pertanyaan", text: "Pertanyaan sehari-hari tentang uang, penjualan, pelanggan, produk, promosi, dan cara kerja." },
  { icon: ShieldAlert, title: "Lihat risiko", text: "Bagian yang berisiko tetap ditampilkan walaupun skor keseluruhan bagus." },
  { icon: ListChecks, title: "Kerjakan 3 prioritas", text: "Dapatkan rencana perbaikan 30 hari yang bisa langsung dijalankan." },
];

function LandingPage() {
  const scenario = DEMO_SCENARIOS[0]!;
  const example = buildAssessmentResult(scenario.profile, demoAnswers(scenario), {
    id: "contoh",
    createdAt: "2026-08-23T00:00:00.000Z",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-12">
          <p className="text-sm font-medium text-primary">Medical check-up untuk usaha Anda</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Cek Kesehatan Bisnis Anda
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Dalam sekitar 7–10 menit, lihat bagian usaha yang sudah kuat, masalah yang perlu diperbaiki, dan tiga hal
            yang sebaiknya Anda kerjakan lebih dulu.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/assessment/start"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Cek Bisnis Saya
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="text-sm text-muted-foreground">Sekitar 7–10 menit. Tanpa perlu membuat akun.</p>
          </div>
          <p className="mt-6 max-w-2xl rounded-xl border border-border bg-surface p-4 text-sm text-surface-foreground">
            Hasil digunakan untuk membantu Anda memahami kondisi usaha, bukan menentukan kelayakan kredit atau
            memberikan penilaian hukum.
          </p>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-foreground">Yang Anda dapatkan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Kondisi usaha secara menyeluruh", "Skor 0–100 beserta penjelasan singkat kondisi usaha Anda."],
              ["Peringatan risiko", "Masalah serius tetap ditampilkan walaupun skor keseluruhan terlihat baik."],
              ["Tiga prioritas perbaikan", "Bukan daftar panjang, hanya tiga hal terpenting untuk dikerjakan dulu."],
              ["Rencana 30 hari", "Langkah mingguan yang kecil, jelas, dan bisa diperiksa hasilnya."],
            ].map(([title, text]) => (
              <Card key={title} className="border-border/80">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-foreground">Cara kerjanya</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <step.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-foreground">7 area yang diperiksa</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map((dimension) => (
              <div key={dimension.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{dimension.shortName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{dimension.scope}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-foreground">Contoh hasil</h2>
          <Card className="mt-5">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{example.profile.businessName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="font-display text-3xl font-bold text-foreground">
                  {example.displayScore}
                  <span className="text-base font-medium text-muted-foreground"> / 100</span>
                </p>
                <StatusBadge tone={example.status.tone} label={example.status.label} />
              </div>
              <p className="mt-3 text-sm text-foreground">{example.diagnosis.summary}</p>
              <div className="mt-5 space-y-3">
                {example.priorities.map((priority) => (
                  <div key={priority.rank} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-sm font-semibold text-foreground">
                      Prioritas #{priority.rank}: {priority.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{priority.whatToDo}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {example.dimensionScores.map((dimension) => (
                  <div key={dimension.dimensionId} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-muted-foreground">
                      {DIMENSIONS.find((item) => item.id === dimension.dimensionId)?.shortName}
                    </span>
                    <ScoreBar
                      score={dimension.displayScore}
                      label={DIMENSIONS.find((item) => item.id === dimension.dimensionId)?.shortName ?? ""}
                    />
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-foreground">
                      {dimension.status === "SCORED" ? dimension.displayScore : "–"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Contoh di atas memakai data usaha fiktif. Status ditentukan dari skor
                {" "}
                {toneForScore(example.displayScore) === "fair" ? "pada rentang cukup sehat" : "yang dihitung sistem"}.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <h2 className="text-xl font-semibold">Siap memeriksa usaha Anda?</h2>
            <p className="mt-2 text-sm opacity-90">
              Mulai sekarang tanpa membuat akun. Jawaban tersimpan otomatis di perangkat Anda.
            </p>
            <Link
              to="/assessment/start"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground hover:bg-background/90"
            >
              Cek Bisnis Saya
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
