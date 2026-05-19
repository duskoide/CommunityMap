import { Bell, CheckCircle2, Clock3, Flame, MapPinned } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportList } from "@/components/report/report-list";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMyReports } from "@/lib/api";

export default async function HistoryPage() {
  const myReports = await getMyReports();

  return (
    <>
      <SiteHeader />
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
            <MetricCard label="Total Laporan" value={12} helper="Sepanjang akun aktif" icon={MapPinned} />
            <MetricCard label="Sedang Diproses" value={5} helper="Perlu pemantauan" icon={Clock3} tone="amber" />
            <MetricCard label="Selesai" value={7} helper="Sudah ditangani" icon={CheckCircle2} tone="green" />
            <MetricCard label="Upvote Diterima" value={128} helper="Dari warga lain" icon={Flame} tone="danger" />
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
