"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { MiniBadge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportEngagement } from "@/components/report/report-engagement";
import { getCategory } from "@/features/reports/catalog";
import type { Report } from "@/types/community-map";

export function FeedList({ reports }: { reports: Report[] }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleReports = reports.slice(0, visibleCount);
  const hasMore = visibleCount < reports.length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {visibleReports.map((report) => (
        <Card key={report.id} className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <Link href={`/users/${report.reporterUsername}`} className="flex items-center gap-3">
                <div className="relative size-10 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                  {report.reporterAvatarUrl ? (
                    <Image src={report.reporterAvatarUrl} alt={report.reporterName} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-bold text-[var(--teal)]">
                      {report.reporterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold hover:underline">{report.reporterName}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                    <MapPin className="size-3.5" />
                    {report.district}
                  </p>
                </div>
              </Link>
            <StatusBadge status={report.status} />
          </div>
          <Link href={`/reports/${report.id}`} className="block">
            <div className="relative aspect-square bg-[var(--surface-strong)]">
              <Image
                src={report.images[0]?.imageUrl || "/images/report-road.svg"}
                alt={report.images[0]?.alt || report.title}
                fill
                sizes="680px"
                className="object-cover"
              />
            </div>
          </Link>
          <div className="p-5">
            <div className="flex items-center gap-2">
              <MiniBadge tone="teal">{getCategory(report.categorySlug).name}</MiniBadge>
              <MiniBadge tone="neutral">#{report.id}</MiniBadge>
            </div>
            <Link href={`/reports/${report.id}`} className="mt-3 block">
              <h2 className="text-xl font-black text-[var(--asphalt)]">
                {report.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                {report.description}
              </p>
            </Link>
            <div className="mt-4">
              <ReportEngagement report={report} compact />
            </div>
          </div>
        </Card>
      ))}
      
      {hasMore && (
        <div className="mt-2 flex justify-center">
          <Button onClick={() => setVisibleCount((c) => c + 5)} variant="secondary">
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
}
