import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Lupa Kata Sandi — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content: "Atur ulang kata sandi akun Cek Sehat Bisnis UMKM Anda melalui email.",
      },
      { property: "og:title", content: "Lupa Kata Sandi — Cek Sehat Bisnis UMKM" },
      {
        property: "og:description",
        content: "Atur ulang kata sandi akun Anda melalui email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message || "Gagal mengirim email reset password.");
      return;
    }

    setSent(true);
    toast.success("Email reset kata sandi telah dikirim. Silakan cek kotak masuk Anda.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">Lupa kata sandi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Bila email tersebut terdaftar, tautan reset kata sandi telah dikirim. Periksa kotak masuk dan folder spam Anda.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Kembali ke halaman masuk</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="nama@email.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Mengirim…" : "Kirim tautan reset"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/auth" className="underline-offset-4 hover:underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
