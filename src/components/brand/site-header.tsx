import { Link, useNavigate } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Anda telah keluar.");
    void navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          Cek Sehat Bisnis
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-4 text-sm">
          <Link to="/tentang" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            Cara kerja
          </Link>
          {loading ? null : user ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="text-muted-foreground hover:text-foreground"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">
              Masuk
            </Link>
          )}
          <Link
            to="/assessment/start"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Cek bisnis saya
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/60">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Cek Sehat Bisnis UMKM</p>
        <p className="mt-2 max-w-2xl">
          Hasil pemeriksaan merupakan alat bantu untuk memahami kondisi usaha berdasarkan jawaban yang diberikan. Hasil
          ini bukan audit keuangan, penilaian kredit, atau nasihat hukum.
        </p>
        <p className="mt-4 text-xs">
          Jawaban Anda tersimpan di perangkat sendiri selama belum membuat akun. Kami tidak membagikan data usaha Anda.
        </p>
      </div>
    </footer>
  );
}
