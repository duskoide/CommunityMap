import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getReports, safeGetCurrentUser } from "@/lib/api";

export default async function AdminPage() {
  const currentUser = await safeGetCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--amber)]">
            Akses Admin
          </p>
          <h1 className="mt-3 text-3xl font-black">Dashboard petugas butuh login admin</h1>
          <p className="mt-3 text-[var(--muted)]">
            {currentUser?.role === "citizen"
              ? "Kamu sedang masuk sebagai warga. Dashboard ini khusus petugas untuk verifikasi, update status, dan monitoring laporan."
              : "Masuk memakai akun petugas untuk melihat laporan masuk, statistik, dan kontrol verifikasi."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/login">Masuk Admin</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Kembali ke Beranda
            </ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  const reports = await getReports();

  return <AdminDashboard initialReports={reports} currentUser={currentUser} />;
}
