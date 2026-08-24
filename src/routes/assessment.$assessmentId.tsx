import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DIMENSIONS } from "@/config/framework";
import { loadDraft, saveDraft, type AssessmentDraft } from "@/features/assessment/storage";
import { getApplicableIndicators } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { AnswerMap } from "@/types/assessment";

export const Route = createFileRoute("/assessment/$assessmentId")({
  head: () => ({
    meta: [
      { title: "Pemeriksaan Kesehatan Bisnis — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content: "Jawab pertanyaan singkat tentang keuangan, penjualan, pelanggan, produk, pemasaran, dan operasional.",
      },
      { property: "og:title", content: "Pemeriksaan Kesehatan Bisnis UMKM" },
      { property: "og:description", content: "Satu pertanyaan per layar, jawaban tersimpan otomatis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { assessmentId } = Route.useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<AssessmentDraft | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDraft(loadDraft(assessmentId));
    setLoaded(true);
  }, [assessmentId]);

  const indicators = useMemo(() => (draft ? getApplicableIndicators(draft.profile) : []), [draft]);

  if (!loaded) {
    return <Shell>{null}</Shell>;
  }

  if (!draft) {
    return (
      <Shell>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h1 className="font-display text-xl font-semibold">Pemeriksaan tidak ditemukan</h1>
            <p className="text-sm text-muted-foreground">
              Data pemeriksaan tersimpan di perangkat yang Anda pakai saat mengisi. Mulai pemeriksaan baru untuk
              melanjutkan.
            </p>
            <Button asChild>
              <Link to="/assessment/start">Mulai pemeriksaan baru</Link>
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const index = Math.min(draft.currentIndex, indicators.length - 1);
  const indicator = indicators[index];
  if (!indicator) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Tidak ada pertanyaan yang relevan untuk profil usaha ini.</p>
      </Shell>
    );
  }

  const dimension = DIMENSIONS.find((item) => item.id === indicator.dimensionId);
  const answered = Object.values(draft.answers).filter((answer) =>
    indicators.some((item) => item.id === answer.indicatorId),
  ).length;
  const current = draft.answers[indicator.id];

  function persist(next: AssessmentDraft) {
    setDraft(next);
    saveDraft(next);
  }

  function answer(optionId: string | null, notApplicable: boolean) {
    if (!draft) return;
    const option = indicator!.options.find((item) => item.id === optionId);
    const answers: AnswerMap = {
      ...draft.answers,
      [indicator!.id]: {
        indicatorId: indicator!.id,
        optionId: notApplicable ? null : (option?.id ?? null),
        score: notApplicable ? null : (option?.score ?? null),
        semanticValue: notApplicable ? null : (option?.semanticValue ?? null),
        notApplicable,
        answeredAt: new Date().toISOString(),
      },
    };
    persist({ ...draft, answers, updatedAt: new Date().toISOString() });
  }

  function go(delta: number) {
    if (!draft) return;
    const next = index + delta;
    if (next < 0) return;
    if (next >= indicators.length) {
      persist({
        ...draft,
        currentIndex: indicators.length - 1,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      void navigate({ to: "/results/$assessmentId", params: { assessmentId } });
      return;
    }
    persist({ ...draft, currentIndex: next, updatedAt: new Date().toISOString() });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  const canContinue = Boolean(current && (current.notApplicable || current.score !== null));

  return (
    <Shell>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{dimension?.name ?? indicator.dimensionId}</span>
          <span className="text-muted-foreground">
            Pertanyaan {index + 1} dari {indicators.length}
          </span>
        </div>
        <Progress value={(answered / indicators.length) * 100} />
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-5 pt-6">
          <div>
            <h1 className="font-display text-lg font-semibold leading-snug text-foreground">{indicator.question}</h1>
            {indicator.helperText ? (
              <p className="mt-2 text-sm text-muted-foreground">{indicator.helperText}</p>
            ) : null}
          </div>

          <div className="space-y-2" role="radiogroup" aria-label={indicator.question}>
            {indicator.options.map((option) => {
              const selected = !current?.notApplicable && current?.optionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => answer(option.id, false)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left text-sm transition",
                    selected
                      ? "border-primary bg-primary/10 font-medium text-foreground"
                      : "border-border bg-background hover:border-primary/50 hover:bg-surface",
                  )}
                >
                  {option.label}
                </button>
              );
            })}

            {indicator.allowUserNotApplicable ? (
              <button
                type="button"
                role="radio"
                aria-checked={Boolean(current?.notApplicable)}
                onClick={() => answer(null, true)}
                className={cn(
                  "w-full rounded-xl border border-dashed px-4 py-3 text-left text-sm transition",
                  current?.notApplicable
                    ? "border-primary bg-primary/10 font-medium text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                Tidak relevan untuk usaha saya
              </button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Button>
        <Button onClick={() => go(1)} disabled={!canContinue}>
          {index === indicators.length - 1 ? "Lihat hasil" : "Lanjut"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
