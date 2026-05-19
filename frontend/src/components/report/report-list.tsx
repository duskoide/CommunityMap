import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { StatusBadge } from "@/components/ui/badge";
import type { Report } from "@/types/community-map";

export function ReportList({ reports }: { reports: Report[] }) {
  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={`/reports/${report.id}`}
          className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-3 transition hover:border-[var(--teal)] sm:grid-cols-[88px_1fr_auto]"
        >
          <div className="relative h-24 overflow-hidden rounded-md bg-[var(--surface-strong)] sm:h-20">
            <Image
              src={report.images[0].imageUrl}
              alt={report.images[0].alt}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CategoryIcon slug={report.categorySlug} size="sm" />
              <p className="truncate text-xs font-semibold text-[var(--muted)]">
                #{report.id}
              </p>
            </div>
            <h3 className="mt-2 truncate text-sm font-bold">{report.title}</h3>
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              {report.district}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <StatusBadge status={report.status} />
            <ChevronRight className="size-4 text-[var(--muted)]" />
          </div>
        </Link>
      ))}
    </div>
  );
}
