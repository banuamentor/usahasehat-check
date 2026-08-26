import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content:
          "Buat akun gratis untuk menyimpan hasil cek kesehatan bisnis, memantau rencana 30 hari, dan melihat perkembangan usaha Anda.",
      },
      { property: "og:title", content: "Masuk atau Daftar — Cek Sehat Bisnis UMKM" },
      {
        property: "og:description",
        content: "Simpan hasil pemeriksaan usaha Anda dan pantau perkembangannya dari waktu ke waktu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Silakan cek email bila diminta konfirmasi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memproses permintaan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {mode === "signin" ? "Masuk ke akun Anda" : "Buat akun gratis"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akun dipakai untuk menyimpan hasil pemeriksaan dan memantau rencana 30 hari.
        </p>
        <Card className="mt-6">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Nama Anda</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama pemilik usaha"
                  />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Kata sandi</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-4 w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
            </button>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            Kembali ke beranda
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
