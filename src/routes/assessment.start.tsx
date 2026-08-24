import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BUSINESS_CATEGORIES, BUSINESS_STAGES, OFFERING_TYPES, REVENUE_RANGES } from "@/config/profile";
import { createDraftId, saveDraft } from "@/features/assessment/storage";
import type { BusinessProfile, BusinessStage, OfferingType } from "@/types/assessment";

export const Route = createFileRoute("/assessment/start")({
  head: () => ({
    meta: [
      { title: "Mulai Cek Kesehatan Bisnis — Cek Sehat Bisnis UMKM" },
      {
        name: "description",
        content:
          "Isi profil singkat usaha Anda agar pertanyaan pemeriksaan menyesuaikan jenis, ukuran, dan tahap bisnis.",
      },
      { property: "og:title", content: "Mulai Cek Kesehatan Bisnis UMKM" },
      {
        property: "og:description",
        content: "Profil usaha singkat menentukan pertanyaan mana yang relevan untuk bisnis Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StartPage,
});

const defaultProfile: BusinessProfile = {
  businessName: "",
  ownerName: "",
  offeringType: "produk",
  category: "makanan_minuman",
  operatingYears: 1,
  employeeCount: 1,
  revenueRange: "5_20jt",
  hasInventory: true,
  repeatPurchaseApplicable: true,
  usesPaidAds: false,
  stage: "rintisan",
};

function fieldClass() {
  return "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground";
}

function StartPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function onCategoryChange(value: string) {
    const category = BUSINESS_CATEGORIES.find((item) => item.value === value);
    setProfile((prev) => ({
      ...prev,
      category: value,
      hasInventory: category?.defaults.hasInventory ?? prev.hasInventory,
      repeatPurchaseApplicable: category?.defaults.repeatPurchaseApplicable ?? prev.repeatPurchaseApplicable,
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!profile.businessName.trim()) nextErrors["businessName"] = "Nama usaha wajib diisi.";
    if (!profile.ownerName.trim()) nextErrors["ownerName"] = "Nama pemilik wajib diisi.";
    if (profile.operatingYears < 0) nextErrors["operatingYears"] = "Lama usaha tidak boleh negatif.";
    if (profile.employeeCount < 1) nextErrors["employeeCount"] = "Minimal 1 orang (termasuk pemilik).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const id = createDraftId();
    const now = new Date().toISOString();
    saveDraft({ id, profile, answers: {}, currentIndex: 0, createdAt: now, updatedAt: now });
    void navigate({ to: "/assessment/$assessmentId", params: { assessmentId: id } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">Profil usaha Anda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Jawaban di halaman ini menentukan pertanyaan mana yang relevan. Pertanyaan yang tidak sesuai dengan jenis
          usaha Anda tidak akan ditanyakan dan tidak menurunkan skor.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama usaha</Label>
                <Input
                  id="businessName"
                  value={profile.businessName}
                  onChange={(event) => update("businessName", event.target.value)}
                  placeholder="Contoh: Sambal Roa Neng Sari"
                />
                {errors["businessName"] ? <p className="text-sm text-critical">{errors["businessName"]}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Nama pemilik</Label>
                <Input
                  id="ownerName"
                  value={profile.ownerName}
                  onChange={(event) => update("ownerName", event.target.value)}
                  placeholder="Nama Anda"
                />
                {errors["ownerName"] ? <p className="text-sm text-critical">{errors["ownerName"]}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="offeringType">Yang dijual</Label>
                <select
                  id="offeringType"
                  className={fieldClass()}
                  value={profile.offeringType}
                  onChange={(event) => update("offeringType", event.target.value as OfferingType)}
                >
                  {OFFERING_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori usaha</Label>
                <select
                  id="category"
                  className={fieldClass()}
                  value={profile.category}
                  onChange={(event) => onCategoryChange(event.target.value)}
                >
                  {BUSINESS_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="operatingYears">Lama usaha berjalan (tahun)</Label>
                  <Input
                    id="operatingYears"
                    type="number"
                    min={0}
                    value={profile.operatingYears}
                    onChange={(event) => update("operatingYears", Number(event.target.value))}
                  />
                  {errors["operatingYears"] ? (
                    <p className="text-sm text-critical">{errors["operatingYears"]}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Jumlah orang yang bekerja (termasuk Anda)</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min={1}
                    value={profile.employeeCount}
                    onChange={(event) => update("employeeCount", Number(event.target.value))}
                  />
                  {errors["employeeCount"] ? <p className="text-sm text-critical">{errors["employeeCount"]}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenueRange">Kisaran omzet per bulan</Label>
                <select
                  id="revenueRange"
                  className={fieldClass()}
                  value={profile.revenueRange}
                  onChange={(event) => update("revenueRange", event.target.value)}
                >
                  {REVENUE_RANGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Tahap usaha saat ini</Label>
                <select
                  id="stage"
                  className={fieldClass()}
                  value={profile.stage}
                  onChange={(event) => update("stage", event.target.value as BusinessStage)}
                >
                  {BUSINESS_STAGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} — {item.description}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <ToggleRow
                id="hasInventory"
                label="Usaha ini menyimpan stok barang atau bahan baku"
                hint="Dipakai untuk menentukan apakah pertanyaan pengelolaan stok relevan."
                checked={profile.hasInventory}
                onChange={(value) => update("hasInventory", value)}
              />
              <ToggleRow
                id="repeatPurchaseApplicable"
                label="Pelanggan biasanya bisa membeli berulang"
                hint="Untuk jasa sekali pakai seperti pernikahan, pilih tidak."
                checked={profile.repeatPurchaseApplicable}
                onChange={(value) => update("repeatPurchaseApplicable", value)}
              />
              <ToggleRow
                id="usesPaidAds"
                label="Usaha ini pernah memasang iklan berbayar"
                hint="Menentukan cara pertanyaan biaya pemasaran dinilai."
                checked={profile.usesPaidAds}
                onChange={(value) => update("usesPaidAds", value)}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full">
            Mulai pemeriksaan
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sekitar 7–10 menit. Jawaban tersimpan otomatis di perangkat Anda.
          </p>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
