import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import {
  isUuid,
  loadAssessment,
  saveAssessment,
  updateActionItemStatus,
  type StoredActionItem,
} from "@/lib/assessment/persistence";
import { ScoreBar, SeverityBadge, StatusBadge } from "@/components/results/score-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DIMENSIONS, INDICATORS } from "@/config/framework";
import { loadDraft, type AssessmentDraft } from "@/features/assessment/storage";
import { buildAssessmentResult } from "@/lib/assessment/result-engine";
import type { AssessmentResult } from "@/types/assessment";

const DimensionRadarChart = lazy(() => import("@/components/results/radar-chart"));

export const Route = createFileRoute("/results/$assessmentId")({
  head: () => ({
    meta: [
      { title: "Hasil Cek Kesehatan Bisnis — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content:
          "Skor kesehatan usaha, risiko kritis, tiga prioritas perbaikan, dan rencana tindakan 30 hari berdasarkan jawaban Anda.",
      },
      { property: "og:title", content: "Hasil Cek Kesehatan Bisnis UMKM" },
      {
        property: "og:description",
        content: "Diagnosis per dimensi, risiko kritis, dan rencana 30 hari untuk usaha Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

function dimensionName(id: string): string {
  return DIMENSIONS.find((item) => item.id === id)?.name ?? id;
}

function ResultsPage() {
  const { assessmentId } = Route.useParams();
  const { user } = useAuth();
  const saved = isUuid(assessmentId);
  const [draft, setDraft] = useState<AssessmentDraft | null>(null);
  const [remote, setRemote] = useState<AssessmentResult | null>(null);
  const [actionItems, setActionItems] = useState<StoredActionItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (saved) {
      setLoaded(false);
      void loadAssessment(assessmentId)
        .then((data) => {
          if (!active) return;
          setRemote(data?.result ?? null);
          setActionItems(data?.actionItems ?? []);
        })
        .catch((error: unknown) => {
          if (active) toast.error(error instanceof Error ? error.message : "Gagal memuat hasil.");
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
    } else {
      setDraft(loadDraft(assessmentId));
      setLoaded(true);
    }
    return () => {
      active = false;
    };
  }, [assessmentId, saved]);

  const localResult: AssessmentResult | null = useMemo(
    () =>
      draft
        ? buildAssessmentResult(draft.profile, draft.answers, { id: draft.id, createdAt: draft.createdAt })
        : null,
    [draft],
  );
  const result: AssessmentResult | null = saved ? remote : localResult;

  async function handleSaveToAccount() {
    if (!result || !user) return;
    setSaving(true);
    try {
      const id = await saveAssessment(user.id, result);
      toast.success("Hasil tersimpan ke akun Anda.");
      void navigate({ to: "/results/$assessmentId", params: { assessmentId: id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan hasil.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleItem(item: StoredActionItem, done: boolean) {
    const nextStatus: StoredActionItem["status"] = done ? "done" : "todo";
    setActionItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: nextStatus } : row)));
    try {
      await updateActionItemStatus(item.id, nextStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui status.");
    }
  }

  if (!loaded) {
    return (
      <Shell>
        <Skeleton className="h-40 w-full" />
      </Shell>
    );
  }

  if (!result) {
    return (
      <Shell>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h1 className="font-display text-xl font-semibold">Hasil tidak ditemukan</h1>
            <p className="text-sm text-muted-foreground">
              Hasil tersimpan di perangkat yang Anda pakai saat mengisi pemeriksaan.
            </p>
            <Button asChild>
              <Link to="/assessment/start">Mulai pemeriksaan baru</Link>
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const radarData = result.dimensionScores
    .filter((item) => item.status === "SCORED")
    .map((item) => ({
      dimension: DIMENSIONS.find((d) => d.id === item.dimensionId)?.shortName ?? item.dimensionId,
      score: item.displayScore,
    }));

  return (
    <Shell>
      {!result.complete ? (
        <Card className="mb-6 border-warning/40 bg-warning-soft">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Beberapa pertanyaan belum dijawab, jadi hasil ini masih sementara.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/assessment/$assessmentId" params={{ assessmentId }}>
                Lanjutkan mengisi
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="skor" className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">Hasil pemeriksaan untuk</p>
        <h1 id="skor" className="font-display text-2xl font-semibold text-foreground">
          {result.profile.businessName}
        </h1>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <p className="font-display text-5xl font-semibold text-foreground">{result.displayScore}</p>
          <span className="pb-2 text-sm text-muted-foreground">dari 100</span>
          <StatusBadge tone={result.status.tone} label={result.status.label} className="mb-1" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{result.status.summary}</p>
      </section>

      <Section title="Apa yang terjadi di usaha Anda">
        <p className="text-sm text-foreground">{result.diagnosis.summary}</p>
        {result.diagnosis.crossDimensionStatements.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-foreground">{item.statement}</p>
            {item.possibleCauses.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {item.possibleCauses.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
        {result.diagnosis.semanticNotes.map((note) => (
          <p key={note} className="text-sm text-muted-foreground">
            {note}
          </p>
        ))}
      </Section>

      {result.flags.length > 0 ? (
        <Section title="Risiko yang perlu segera diperhatikan">
          {result.flags.map((flag) => (
            <Card key={flag.flagId} className="border-critical/30">
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 text-critical" aria-hidden="true" />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{flag.name}</p>
                      <SeverityBadge severity={flag.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.userExplanation}</p>
                    <p className="text-sm text-foreground">Saran: {flag.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Section>
      ) : null}

      <Section title="3 prioritas perbaikan Anda">
        {result.priorities.map((priority) => (
          <Card key={priority.rank}>
            <CardContent className="space-y-2 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Prioritas #{priority.rank}</p>
              <p className="font-medium text-foreground">{priority.title}</p>
              <p className="text-sm text-muted-foreground">{priority.why}</p>
              <p className="text-sm text-foreground">Langkah pertama: {priority.whatToDo}</p>
              <p className="text-xs text-muted-foreground">Bagian: {dimensionName(priority.dimensionId)}</p>
            </CardContent>
          </Card>
        ))}
        {result.priorities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada prioritas mendesak dari jawaban Anda saat ini.</p>
        ) : null}
      </Section>

      <Section title="Kondisi 7 bagian usaha">
        {radarData.length >= 3 ? (
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <DimensionRadarChart data={radarData} />
          </Suspense>
        ) : null}
        <div className="space-y-4">
          {result.dimensionScores.map((dimension) => (
            <div key={dimension.dimensionId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{dimensionName(dimension.dimensionId)}</span>
                <span className="text-muted-foreground">
                  {dimension.status === "SCORED" ? `${dimension.displayScore}/100` : "Data belum cukup"}
                </span>
              </div>
              {dimension.status === "SCORED" ? (
                <ScoreBar score={dimension.displayScore} label={dimensionName(dimension.dimensionId)} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tidak ada pertanyaan yang relevan untuk bagian ini, jadi tidak dinilai.
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {result.strengths.length > 0 ? (
        <Section title="Yang sudah Anda lakukan dengan baik">
          {result.strengths.map((strength) => (
            <p key={strength.dimensionId} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 text-healthy" aria-hidden="true" />
              {strength.text}
            </p>
          ))}
        </Section>
      ) : null}

      <Section title="Rencana 30 hari">
        {[1, 2, 3, 4].map((week) => {
          const items = result.actionPlan.filter((item) => item.weekNumber === week);
          if (items.length === 0) return null;
          return (
            <Card key={week}>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm font-semibold text-foreground">Minggu {week}</p>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-lg border border-border bg-background p-3">
                      {saved ? (
                        (() => {
                          const stored = actionItems.find((row) => row.itemKey === item.id);
                          if (!stored) return <p className="text-sm text-foreground">{item.title}</p>;
                          return (
                            <label className="flex items-start gap-2 text-sm text-foreground">
                              <Checkbox
                                checked={stored.status === "done"}
                                onCheckedChange={(value) => void toggleItem(stored, value === true)}
                                className="mt-0.5"
                              />
                              <span className={stored.status === "done" ? "line-through opacity-70" : undefined}>
                                {item.title}
                              </span>
                            </label>
                          );
                        })()
                      ) : (
                        <p className="text-sm text-foreground">{item.title}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.completionCriteria}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </Section>

      <Card className="mt-8 border-primary/30 bg-primary/5">
        <CardContent className="space-y-3 pt-6">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Simpan hasil ini
          </p>
          <p className="text-sm text-muted-foreground">
            {saved
              ? "Hasil ini tersimpan di akun Anda. Lakukan pemeriksaan ulang setelah 30 hari untuk melihat perkembangan."
              : "Hasil saat ini tersimpan di perangkat Anda. Simpan ke akun agar bisa dipantau dan dibandingkan nanti."}
          </p>
          <div className="flex flex-wrap gap-3">
            {!saved ? (
              user ? (
                <Button onClick={() => void handleSaveToAccount()} disabled={saving}>
                  {saving ? "Menyimpan…" : "Simpan ke akun"}
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth">Masuk untuk menyimpan</Link>
                </Button>
              )
            ) : (
              <Button asChild>
                <Link to="/dashboard">Buka dashboard</Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/assessment/start">Cek ulang nanti</Link>
            </Button>
            <Button variant="outline" onClick={() => typeof window !== "undefined" && window.print()}>
              Cetak / simpan PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Pemeriksaan ini berdasarkan {INDICATORS.length} indikator dan jawaban Anda sendiri. Hasilnya alat bantu
        refleksi, bukan audit keuangan atau nasihat hukum.
      </p>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
