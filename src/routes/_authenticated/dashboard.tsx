import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { StatusBadge } from "@/components/results/score-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  countActionProgress,
  deleteAssessment,
  listAssessments,
  type SavedAssessmentSummary,
} from "@/lib/assessment/persistence";
import { STATUS_LEVELS } from "@/config/framework";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Kesehatan Bisnis — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content: "Riwayat pemeriksaan usaha, perkembangan skor, dan progres rencana tindakan 30 hari Anda.",
      },
      { property: "og:title", content: "Dashboard Kesehatan Bisnis UMKM" },
      { property: "og:description", content: "Pantau skor kesehatan usaha dan progres rencana perbaikan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function toneFor(statusId: string) {
  return STATUS_LEVELS.find((level) => level.id === statusId)?.tone ?? "fair";
}

function DashboardPage() {
  const assessmentsQuery = useQuery({ queryKey: ["assessments"], queryFn: listAssessments });
  const rows: SavedAssessmentSummary[] = assessmentsQuery.data ?? [];
  const progressQuery = useQuery({
    queryKey: ["action-progress", rows.map((row) => row.id)],
    queryFn: () => countActionProgress(rows.map((row) => row.id)),
    enabled: rows.length > 0,
  });

  const latest = rows[0];
  const previous = rows[1];
  const delta = latest && previous ? latest.displayScore - previous.displayScore : null;

  async function handleDelete(id: string) {
    try {
      await deleteAssessment(id);
      toast.success("Pemeriksaan dihapus.");
      await assessmentsQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard usaha Anda</h1>
          <Button asChild size="sm">
            <Link to="/assessment/start">Cek ulang sekarang</Link>
          </Button>
        </div>

        {assessmentsQuery.isPending ? (
          <Skeleton className="mt-6 h-40 w-full" />
        ) : assessmentsQuery.isError ? (
          <p className="mt-6 text-sm text-critical">Gagal memuat data. Coba muat ulang halaman.</p>
        ) : rows.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">
                Belum ada pemeriksaan tersimpan. Mulai pemeriksaan pertama Anda sekarang.
              </p>
              <Button asChild>
                <Link to="/assessment/start">Mulai pemeriksaan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted-foreground">Skor terbaru — {latest!.businessName}</p>
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <p className="font-display text-5xl font-semibold text-foreground">{latest!.displayScore}</p>
                <span className="pb-2 text-sm text-muted-foreground">dari 100</span>
                <StatusBadge tone={toneFor(latest!.statusId)} label={latest!.statusLabel} className="mb-1" />
              </div>
              {delta !== null ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {delta === 0
                    ? "Skor sama dengan pemeriksaan sebelumnya."
                    : delta > 0
                      ? `Naik ${delta} poin dibanding pemeriksaan sebelumnya.`
                      : `Turun ${Math.abs(delta)} poin dibanding pemeriksaan sebelumnya.`}
                </p>
              ) : null}
            </section>

            <h2 className="mt-8 font-display text-lg font-semibold text-foreground">Riwayat pemeriksaan</h2>
            <div className="mt-3 space-y-3">
              {rows.map((row) => {
                const progress = progressQuery.data?.[row.id];
                return (
                  <Card key={row.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                      <div>
                        <p className="font-medium text-foreground">{row.businessName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                        {progress ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Rencana 30 hari: {progress.done}/{progress.total} selesai
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-display text-xl font-semibold text-foreground">{row.displayScore}</p>
                          <StatusBadge tone={toneFor(row.statusId)} label={row.statusLabel} />
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/results/$assessmentId" params={{ assessmentId: row.id }}>
                            Lihat
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Hapus pemeriksaan ${row.businessName}`}
                          onClick={() => void handleDelete(row.id)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
