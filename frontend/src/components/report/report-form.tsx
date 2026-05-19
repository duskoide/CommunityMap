"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categories } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { ReportCategorySlug } from "@/types/community-map";

const steps = ["Informasi", "Lokasi", "Tinjau & Kirim"];

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ReportCategorySlug>("pothole");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[rgb(59_167_101_/_12%)] text-[var(--green)]">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black">Laporan diterima</h1>
        <p className="mt-3 text-[var(--muted)]">
          Data laporan disimpan sebagai simulasi frontend. Saat backend siap,
          payload ini dapat langsung dikirim ke endpoint `POST /api/reports`.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => setSubmitted(false)} variant="secondary">
            Buat Laporan Lagi
          </Button>
          <Button onClick={() => window.location.assign("/history")}>
            Lihat Riwayat
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center justify-center gap-3">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                  index <= step
                    ? "bg-[var(--teal)] text-white"
                    : "bg-[var(--surface-strong)] text-[var(--muted)]",
                )}
              >
                {index + 1}
              </span>
              <span className="hidden text-sm font-semibold text-[var(--muted)] sm:block">
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="h-px w-8 bg-[var(--border)] sm:w-16" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {step === 0 && (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section>
              <h1 className="text-2xl font-black">Pilih Kategori</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Pilih jenis masalah jalan yang paling sesuai dengan kondisi di
                lapangan.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categories.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setCategory(item.slug)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-4 text-left transition",
                      category === item.slug
                        ? "border-[var(--teal)] bg-[rgb(0_107_98_/_8%)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--teal)]",
                    )}
                  >
                    <CategoryIcon slug={item.slug} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <h2 className="text-sm font-bold">Unggah Foto</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_96px_96px_96px]">
                  <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-4 text-center">
                    <Camera className="size-6 text-[var(--muted)]" />
                    <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                      Klik untuk unggah foto atau drag & drop
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      PNG, JPG maks. 5MB
                    </p>
                  </div>
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="road-texture min-h-24 rounded-lg border border-[var(--border)]"
                    />
                  ))}
                  <button className="flex min-h-24 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)]">
                    <Plus className="size-5" />
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold">Informasi Laporan</h2>
              <div className="mt-3 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Judul Singkat
                  <input
                    className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                    defaultValue="Lubang besar di tengah jalan"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Deskripsi
                  <textarea
                    className="min-h-40 rounded-md border border-[var(--border)] px-3 py-3 text-sm outline-none focus:border-[var(--teal)]"
                    defaultValue="Lubang cukup besar dan dalam, terutama berbahaya saat malam hari. Mohon segera ditindaklanjuti. Terima kasih."
                  />
                </label>
              </div>
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <section>
              <h1 className="text-2xl font-black">Tentukan Lokasi</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Gunakan GPS untuk lokasi otomatis atau geser pin pada peta
                untuk menandai titik masalah secara manual.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button className="justify-start">
                  <LocateFixed className="size-4" />
                  Gunakan Lokasi Saat Ini
                </Button>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Alamat Perkiraan
                  <input
                    className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                    defaultValue="Jl. Ahmad Yani No. 45, Jakarta Pusat"
                  />
                </label>
              </div>
            </section>
            <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[var(--border)] bg-white">
              <div className="map-grid absolute inset-0" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-[0_20px_40px_rgb(239_59_45_/_30%)]">
                  <MapPin className="size-6" />
                </span>
                <span className="h-6 w-px bg-[var(--danger)]" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-black">Tinjau & Kirim</h1>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <ReviewItem label="Kategori" value="Jalan Berlubang" />
              <ReviewItem label="Lokasi" value="Jl. Ahmad Yani No. 45" />
              <ReviewItem label="Status Awal" value="Baru" />
            </div>
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold">Lubang besar di tengah jalan</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Lubang cukup besar dan dalam, terutama berbahaya saat malam hari.
                Mohon segera ditindaklanjuti.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t border-[var(--border)] px-5 py-4">
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <ArrowLeft className="size-4" />
          Batal
        </Button>
        <Button
          onClick={() =>
            step === 2 ? setSubmitted(true) : setStep((current) => current + 1)
          }
        >
          {step === 2 ? "Kirim Laporan" : "Selanjutnya"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
