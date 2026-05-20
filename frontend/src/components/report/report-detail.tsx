import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MapPin, ThumbsUp, UserRound } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { MiniBadge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getCategory, getStatusLabel } from "@/data/report-metadata";
import type { Report } from "@/types/community-map";

export function ReportDetail({ report, admin = false }: { report: Report; admin?: boolean }) {
  const category = getCategory(report.categorySlug);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MiniBadge tone="neutral">#{report.id}</MiniBadge>
            <StatusBadge status={report.status} />
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-black">{report.title}</h1>
          <p className="mt-2 text-[var(--muted)]">{report.address}</p>
        </div>
        <ButtonLink href={admin ? "/admin" : "/map"} variant="secondary">
          Kembali
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-[var(--surface-strong)]">
              <Image
                src={report.images[0].imageUrl}
                alt={report.images[0].alt}
                fill
                sizes="900px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <CategoryIcon slug={report.categorySlug} />
                <div>
                  <p className="text-xs font-bold text-[var(--muted)]">Kategori</p>
                  <p className="font-bold">{category.name}</p>
                </div>
              </div>
              <p className="leading-7 text-[var(--asphalt)]">{report.description}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">Timeline Status</h2>
            <div className="mt-5 flex flex-col gap-4">
              {report.statusLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-[28px_1fr] gap-3">
                  <span className="mt-1 size-3 rounded-full bg-[var(--teal)] ring-4 ring-[rgb(0_107_98_/_12%)]" />
                  <div>
                    <p className="text-sm font-bold">{getStatusLabel(log.nextStatus)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{log.note}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold">Ringkasan</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Info icon={MapPin} label="Wilayah" value={report.district} />
              <Info icon={UserRound} label="Pelapor" value={report.reporterName} />
              <Info
                icon={CalendarClock}
                label="Dilaporkan"
                value={new Date(report.createdAt).toLocaleDateString("id-ID")}
              />
              <Info icon={ThumbsUp} label="Upvote" value={`${report.upvoteCount} warga`} />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="map-grid h-72 border-b border-[var(--border)]" />
            <div className="p-4">
              <p className="text-sm font-bold">Koordinat</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {report.coordinates.latitude}, {report.coordinates.longitude}
              </p>
              <Link href="/map" className="mt-3 inline-block text-sm font-bold text-[var(--teal)]">
                Buka di peta publik
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-[var(--surface-strong)] p-3">
      <Icon className="mt-0.5 size-4 text-[var(--teal)]" />
      <div>
        <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
    </div>
  );
}
