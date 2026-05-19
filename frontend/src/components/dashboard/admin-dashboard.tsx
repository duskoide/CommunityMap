"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Eye,
  FileCheck2,
  Search,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PublicMap } from "@/components/map/public-map";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminStats, getCategory, statusLabels } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { Report, ReportStatus } from "@/types/community-map";

const statuses: ReportStatus[] = ["new", "verified", "in_progress", "resolved"];

export function AdminDashboard({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReportStatus | "all">("all");

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesQuery =
          report.title.toLowerCase().includes(query.toLowerCase()) ||
          report.address.toLowerCase().includes(query.toLowerCase()) ||
          report.id.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === "all" || report.status === status;
        return matchesQuery && matchesStatus;
      }),
    [query, reports, status],
  );

  function quickVerify(id: string) {
    setReports((current) =>
      current.map((report) =>
        report.id === id
          ? { ...report, status: "verified", isVerified: true }
          : report,
      ),
    );
  }

  return (
    <AdminShell>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-black">Monitoring & Verifikasi</h1>
            <p className="mt-2 text-[var(--muted)]">
              Pantau laporan warga, verifikasi data, dan update status
              penanganan.
            </p>
          </div>
          <Button variant="secondary">
            <Download className="size-4" />
            Ekspor
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total Laporan" value={adminStats.totalReports} helper="7 hari terakhir" icon={FileCheck2} />
          <MetricCard label="Baru" value={adminStats.newReports} helper="Menunggu verifikasi" icon={Timer} tone="danger" />
          <MetricCard label="Diverifikasi" value={adminStats.verifiedReports} helper="Siap ditindaklanjuti" icon={ShieldCheck} tone="blue" />
          <MetricCard label="Sedang Diperbaiki" value={adminStats.inProgressReports} helper="Proses lapangan" icon={Timer} tone="amber" />
          <MetricCard label="Selesai" value={adminStats.resolvedReports} helper="Ditutup petugas" icon={ShieldCheck} tone="green" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          <section id="reports" className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold">Laporan Terbaru</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                  <Search className="size-4 text-[var(--muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Cari ID, lokasi, pelapor..."
                  />
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ReportStatus | "all")
                  }
                  className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
                >
                  <option value="all">Status: Semua</option>
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {statusLabels[item]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs font-bold text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2">ID Laporan</th>
                    <th className="px-3 py-2">Foto</th>
                    <th className="px-3 py-2">Lokasi</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="bg-[var(--surface-strong)]">
                      <td className="rounded-l-lg px-3 py-3 font-semibold">
                        {report.id}
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative size-12 overflow-hidden rounded-md">
                          <Image
                            src={report.images[0].imageUrl}
                            alt={report.images[0].alt}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{report.address}</p>
                        <p className="text-xs text-[var(--muted)]">{report.district}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <CategoryIcon slug={report.categorySlug} size="sm" />
                          {getCategory(report.categorySlug).name}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="rounded-r-lg px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="min-h-8 px-3 py-1 text-xs"
                            onClick={() => quickVerify(report.id)}
                          >
                            Tinjau
                          </Button>
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-bold"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <Card className="overflow-hidden p-4">
              <h2 className="mb-3 text-lg font-bold">Peta Pratinjau</h2>
              <PublicMap compact />
            </Card>
            <Card className="p-5">
              <h2 className="text-lg font-bold">Distribusi Kategori</h2>
              <div className="mt-5 flex items-center gap-5">
                <div className="size-28 rounded-full bg-[conic-gradient(var(--danger)_0_30%,var(--amber)_30%_50%,var(--blue)_50%_68%,var(--cyan)_68%_84%,#5a6472_84%_100%)]" />
                <div className="flex flex-col gap-2 text-xs">
                  {["pothole", "streetlight", "puddle", "flood", "other"].map(
                    (slug) => (
                      <span key={slug} className="flex items-center gap-2">
                        <span
                          className={cn("size-2 rounded-full")}
                          style={{ background: getCategory(slug as never).color }}
                        />
                        {getCategory(slug as never).name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
