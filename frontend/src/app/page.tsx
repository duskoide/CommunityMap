import {
  Bell,
  CheckCircle2,
  MapPinned,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { PublicMap } from "@/components/map/public-map";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/layout/app-header";
import { HeroScene } from "@/components/landing/hero-scene";
import { getReports } from "@/lib/api";

const steps = [
  {
    title: "Laporkan titik masalah",
    copy: "Pilih kategori, unggah foto, dan tandai lokasi dengan GPS atau pin manual.",
    icon: Upload,
  },
  {
    title: "Data muncul di peta",
    copy: "Warga lain dapat melihat marker, detail foto, status, dan memberi upvote.",
    icon: MapPinned,
  },
  {
    title: "Petugas memverifikasi",
    copy: "Dashboard membantu petugas melihat prioritas dan memperbarui progres.",
    icon: ShieldCheck,
  },
];

const adminHighlights = [
  { value: "312", label: "Laporan Baru", icon: Bell },
  { value: "356", label: "Diverifikasi", icon: ShieldCheck },
  { value: "282", label: "Selesai", icon: CheckCircle2 },
];

export default async function HomePage() {
  const reports = await getReports();

  return (
    <>
      <AppHeader dark />
      <main>
        <HeroScene />

        <section className="bg-white py-16 scroll-reveal">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black text-[var(--asphalt)]">
                Cara kerja yang mudah untuk jalan yang lebih aman
              </h2>
              <p className="mt-3 text-[var(--muted)]">
                Semua alur dibuat singkat agar warga bisa melapor dari ponsel
                tanpa proses yang melelahkan.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="p-5">
                    <span className="flex size-11 items-center justify-center rounded-md bg-[rgb(0_107_98_/_10%)] text-[var(--teal)]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {step.copy}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[var(--background)] py-16 scroll-reveal">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black text-[var(--asphalt)]">
                  Peta publik dengan marker kategori dan status
                </h2>
                <p className="mt-3 max-w-2xl text-[var(--muted)]">
                  Filter laporan jalan berlubang, lampu jalan mati, genangan,
                  banjir lokal, dan status penanganan dalam satu tampilan.
                </p>
              </div>
              <ButtonLink href="/map" variant="secondary">
                Buka Peta Lengkap
              </ButtonLink>
            </div>
            <PublicMap compact initialReports={reports} />
          </div>
        </section>

        <section className="bg-white py-16 scroll-reveal">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div className="sticky top-24 h-fit">
              <h2 className="text-3xl font-black text-[var(--asphalt)]">
                Dashboard petugas yang fokus pada prioritas
              </h2>
              <p className="mt-3 text-[var(--muted)]">
                Laporan warga dipusatkan menjadi daftar operasional: verifikasi,
                update status, dan pantau distribusi kategori.
              </p>
              <div className="mt-6 flex gap-3">
                <ButtonLink href="/admin">Lihat Dashboard</ButtonLink>
                <ButtonLink href="/history" variant="secondary">
                  Riwayat Warga
                </ButtonLink>
              </div>
            </div>
            <div className="grid gap-4">
              {adminHighlights.map(({ value, label, icon: Icon }) => (
                <Card
                  key={label}
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <p className="text-4xl font-black text-[var(--asphalt)]">
                      {value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                      {label}
                    </p>
                  </div>
                  <span className="flex size-12 items-center justify-center rounded-md bg-[rgb(245_197_24_/_18%)] text-[#806300]">
                    <Icon className="size-5" />
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
