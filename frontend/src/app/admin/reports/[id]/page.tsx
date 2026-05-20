import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminReportDetail } from "@/components/dashboard/admin-report-detail";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getReportById, safeGetCurrentUser } from "@/lib/api";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await safeGetCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <h1 className="text-3xl font-black">Akses detail admin dibatasi</h1>
          <p className="mt-3 text-[var(--muted)]">
            {currentUser?.role === "citizen"
              ? "Kamu sedang masuk sebagai warga, jadi halaman verifikasi ini tidak tersedia. Petugas yang login bisa membuka detail admin."
              : "Login sebagai petugas untuk membuka halaman verifikasi laporan ini."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/login">Masuk Admin</ButtonLink>
            <ButtonLink href="/admin" variant="secondary">
              Kembali ke Dashboard
            </ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <AdminShell currentUser={currentUser}>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <AdminReportDetail report={report} />
      </main>
    </AdminShell>
  );
}
