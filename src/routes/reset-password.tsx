import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Atur Ulang Kata Sandi — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content: "Buat kata sandi baru untuk akun Cek Sehat Bisnis UMKM Anda.",
      },
      { property: "og:title", content: "Atur Ulang Kata Sandi — Cek Sehat Bisnis UMKM" },
      {
        property: "og:description",
        content: "Buat kata sandi baru untuk akun Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [valid, setValid] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");

    if (type === "recovery") {
      setValid(true);
    }
    setChecked(true);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error(error.message || "Gagal mengatur ulang kata sandi.");
      return;
    }

    toast.success("Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.");
    void navigate({ to: "/auth" });
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Memeriksa tautan…
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
          <h1 className="font-display text-2xl font-semibold text-foreground">Tautan tidak valid</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tautan ini kadaluarsa atau bukan tautan reset kata sandi. Minta tautan baru melalui halaman lupa kata sandi.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/forgot-password">Minta tautan baru</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">Buat kata sandi baru</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan kata sandi baru untuk mengamankan akun Anda.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="password">Kata sandi baru</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi kata sandi baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Menyimpan…" : "Simpan kata sandi baru"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
