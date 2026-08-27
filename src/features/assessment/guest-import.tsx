import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDraft, listDrafts, type AssessmentDraft } from "@/features/assessment/storage";
import { useAuth } from "@/hooks/use-auth";
import { saveAssessment } from "@/lib/assessment/persistence";
import { buildAssessmentResult, isAssessmentComplete } from "@/lib/assessment/result-engine";

/**
 * Kartu migrasi draft tamu: hasil yang tersimpan di perangkat (sebelum punya akun)
 * bisa dipindahkan ke akun setelah pengguna masuk.
 */
export function GuestDraftImport({ onImported }: { onImported?: () => void }) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<AssessmentDraft[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(listDrafts());
  }, []);

  if (!user || drafts.length === 0) return null;

  async function handleImport(draft: AssessmentDraft) {
    if (!user) return;
    setBusyId(draft.id);
    try {
      const result = buildAssessmentResult(draft.profile, draft.answers);
      await saveAssessment(user.id, result);
      deleteDraft(draft.id);
      setDrafts(listDrafts());
      toast.success("Hasil dari perangkat berhasil disimpan ke akun.");
      onImported?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan hasil.");
    } finally {
      setBusyId(null);
    }
  }

  function handleDiscard(draft: AssessmentDraft) {
    deleteDraft(draft.id);
    setDrafts(listDrafts());
    toast.success("Draft berhasil dihapus dari perangkat.");
  }

  return (
    <Card className="mt-6 border-primary/40">
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Pemeriksaan tersimpan di perangkat ini
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pindahkan ke akun Anda agar tidak hilang dan bisa dipantau perkembangannya.
          </p>
        </div>
        <ul className="space-y-3">
          {drafts.map((draft) => {
            const complete = isAssessmentComplete(draft.profile, draft.answers);
            return (
              <li
                key={draft.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{draft.profile.businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(draft.updatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {complete ? "Selesai" : "Belum selesai"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {complete ? (
                    <Button size="sm" disabled={busyId === draft.id} onClick={() => void handleImport(draft)}>
                      {busyId === draft.id ? "Menyimpan…" : "Simpan ke akun"}
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/assessment/$assessmentId" params={{ assessmentId: draft.id }}>
                        Lanjutkan
                      </Link>
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        Buang
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus draft pemeriksaan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Draft untuk &quot;{draft.profile.businessName}&quot; akan dihapus dari perangkat ini dan tidak bisa dipulihkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDiscard(draft)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
