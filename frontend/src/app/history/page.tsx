import { Bell, CheckCircle2, Clock3, Flame, MapPinned } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportList } from "@/components/report/report-list";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMyReports, safeGetCurrentUser } from "@/lib/api";

export default async function HistoryPage() {
  const currentUser = await safeGetCurrentUser();

  if (!currentUser) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-xl p-8 text-center">
            <h1 className="text-3xl font-black">Riwayat laporan perlu akun login</h1>
            <p className="mt-3 text-[var(--muted)]">
              Masuk dulu untuk melihat laporan pribadi dan pembaruan status dari petugas.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/login">Masuk</ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                Buat Akun
              </ButtonLink>
            </div>
          </Card>
        </main>
      </>
    );
  }

  if (currentUser.role !== "citizen") {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-xl p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--teal)]">
              Area Warga
            </p>
            <h1 className="mt-3 text-3xl font-black">Riwayat laporan hanya untuk warga</h1>
            <p className="mt-3 text-[var(--muted)]">
              Akun petugas tidak memakai riwayat pribadi ini. Untuk petugas, alur
              utamanya ada di dashboard monitoring dan verifikasi.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/admin">Buka Dashboard</ButtonLink>
              <ButtonLink href="/map" variant="secondary">
                Kembali ke Peta
              </ButtonLink>
            </div>
          </Card>
        </main>
      </>
    );
  }

  const myReports = await getMyReports();
  const totalReports = myReports.length;
  const inProgressReports = myReports.filter((report) =>
    ["verified", "in_progress"].includes(report.status),
  ).length;
  const resolvedReports = myReports.filter(
    (report) => report.status === "resolved",
  ).length;
  const totalUpvotes = myReports.reduce(
    (sum, report) => sum + report.upvoteCount,
    0,
  );

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black">Riwayat Laporan</h1>
              <p className="mt-2 text-[var(--muted)]">
                Pantau laporan pribadi dan pembaruan status dari petugas.
              </p>
            </div>
            <ButtonLink href="/report">+ Laporkan Jalan</ButtonLink>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Laporan" value={totalReports} helper="Sepanjang akun aktif" icon={MapPinned} />
            <MetricCard label="Sedang Diproses" value={inProgressReports} helper="Perlu pemantauan" icon={Clock3} tone="amber" />
            <MetricCard label="Selesai" value={resolvedReports} helper="Sudah ditangani" icon={CheckCircle2} tone="green" />
            <MetricCard label="Upvote Diterima" value={totalUpvotes} helper="Dari warga lain" icon={Flame} tone="danger" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section>
              <h2 className="mb-3 text-lg font-bold">Riwayat Laporan</h2>
              <ReportList reports={myReports} />
            </section>
            <Card className="h-fit p-5">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-[var(--blue)]" />
                <h2 className="text-lg font-bold">Notifikasi Terbaru</h2>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                {myReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold">Laporan #{report.id}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      {report.title} masuk status terbaru.
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
