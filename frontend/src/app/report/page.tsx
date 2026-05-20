import { AppHeader } from "@/components/layout/app-header";
import { ReportForm } from "@/components/report/report-form";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { safeGetCurrentUser } from "@/lib/api";

export default async function ReportPage() {
  const currentUser = await safeGetCurrentUser();

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        {!currentUser ? (
          <Card className="mx-auto max-w-xl p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--amber)]">
              Fitur Warga
            </p>
            <h1 className="mt-3 text-3xl font-black">Lapor jalan butuh login warga</h1>
            <p className="mt-3 text-[var(--muted)]">
              Tamu tetap bisa melihat peta publik, tapi pengiriman laporan hanya
              tersedia untuk akun warga agar riwayat dan statusnya bisa dilacak.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/login">Masuk sebagai Warga</ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                Daftar Akun
              </ButtonLink>
            </div>
          </Card>
        ) : currentUser.role === "admin" ? (
          <Card className="mx-auto max-w-xl p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--teal)]">
              Akun Petugas
            </p>
            <h1 className="mt-3 text-3xl font-black">Form ini khusus untuk warga</h1>
            <p className="mt-3 text-[var(--muted)]">
              Akun petugas difokuskan untuk verifikasi dan monitoring laporan.
              Kalau kamu mau meninjau laporan masuk, langsung buka dashboard petugas.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/admin">Buka Dashboard</ButtonLink>
              <ButtonLink href="/map" variant="secondary">
                Lihat Peta Publik
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <ReportForm />
        )}
      </main>
    </>
  );
}
