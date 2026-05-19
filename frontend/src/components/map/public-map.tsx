"use client";

import Image from "next/image";
import { Filter, Search, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Map, MapControls, MapMarker, MapRoute } from "@/components/ui/map";
import { MiniBadge, StatusBadge } from "@/components/ui/badge";
import { categories, getReportsByFilters, statusLabels } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type {
  Report,
  ReportCategorySlug,
  ReportStatus,
} from "@/types/community-map";
import { MapMarkerPin } from "./map-marker-pin";

const statuses: ReportStatus[] = ["new", "verified", "in_progress", "resolved"];

export function PublicMap({ compact = false }: { compact?: boolean }) {
  const [categoryFilters, setCategoryFilters] = useState<ReportCategorySlug[]>([]);
  const [statusFilters, setStatusFilters] = useState<ReportStatus[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});

  const filteredReports = useMemo(
    () => getReportsByFilters(categoryFilters, statusFilters),
    [categoryFilters, statusFilters],
  );

  const visibleSelected = selectedReport ?? filteredReports[0];

  function toggleCategory(slug: ReportCategorySlug) {
    setCategoryFilters((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  function toggleStatus(status: ReportStatus) {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  return (
    <div
      className={cn(
        "relative grid overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow)]",
        compact ? "h-[460px] grid-cols-1" : "min-h-[calc(100vh-5rem)] lg:grid-cols-[290px_1fr_340px]",
      )}
    >
      {!compact && (
        <aside className="z-10 border-b border-[var(--border)] bg-white p-4 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-[var(--teal)]" />
              <h2 className="text-sm font-bold">Filter</h2>
            </div>
            <button
              className="text-xs font-semibold text-[var(--teal)]"
              onClick={() => {
                setCategoryFilters([]);
                setStatusFilters([]);
              }}
            >
              Reset
            </button>
          </div>
          <FilterGroup title="Kategori">
            {categories.map((category) => (
              <label
                key={category.slug}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--surface-strong)]"
              >
                <input
                  type="checkbox"
                  checked={categoryFilters.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                  className="accent-[var(--teal)]"
                />
                <CategoryIcon slug={category.slug} size="sm" />
                <span>{category.name}</span>
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Status">
            {statuses.map((status) => (
              <label
                key={status}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--surface-strong)]"
              >
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-[var(--teal)]"
                />
                <span className="size-2 rounded-full bg-current" />
                <span>{statusLabels[status]}</span>
              </label>
            ))}
          </FilterGroup>
          <div className="mt-5 flex flex-col gap-3">
            <label className="text-xs font-bold text-[var(--muted)]">
              Rentang Waktu
            </label>
            <select className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
              <option>Semua Data</option>
            </select>
            <label className="text-xs font-bold text-[var(--muted)]">Area</label>
            <select className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm">
              <option>Semua Wilayah</option>
              <option>Jakarta Pusat</option>
              <option>Jakarta Selatan</option>
              <option>Bekasi</option>
            </select>
            <Button className="mt-2">Terapkan Filter</Button>
          </div>
        </aside>
      )}

      <div className="relative min-h-[460px]">
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 shadow-[var(--shadow)] lg:left-8 lg:right-auto lg:w-[420px]">
          <Search className="size-4 text-[var(--muted)]" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cari lokasi atau alamat..."
          />
        </div>
        <Map
          initialViewState={{ longitude: 106.8456, latitude: -6.2088, zoom: 10.5 }}
          className="h-full min-h-[460px] w-full"
        >
          <MapControls position="top-right" />
          <MapRoute
            coordinates={filteredReports.map((report) => [
              report.coordinates.longitude,
              report.coordinates.latitude,
            ])}
          />
          {filteredReports.map((report) => (
            <MapMarker
              key={report.id}
              longitude={report.coordinates.longitude}
              latitude={report.coordinates.latitude}
              onClick={() => setSelectedReport(report)}
            >
              <MapMarkerPin
                report={report}
                selected={visibleSelected?.id === report.id}
              />
            </MapMarker>
          ))}
        </Map>
        <div className="absolute bottom-4 left-4 z-10 hidden rounded-lg border border-[var(--border)] bg-white p-3 shadow-[var(--shadow)] md:block">
          <p className="mb-2 text-xs font-bold">Legenda</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {categories.map((category) => (
              <span key={category.slug} className="flex items-center gap-2">
                <CategoryIcon slug={category.slug} size="sm" />
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!compact && visibleSelected && (
        <aside className="z-10 border-t border-[var(--border)] bg-white p-4 lg:border-l lg:border-t-0">
          <ReportMapPanel
            report={visibleSelected}
            upvoted={Boolean(upvoted[visibleSelected.id])}
            onUpvote={() =>
              setUpvoted((current) => ({
                ...current,
                [visibleSelected.id]: !current[visibleSelected.id],
              }))
            }
          />
        </aside>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-bold text-[var(--muted)]">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function ReportMapPanel({
  report,
  upvoted,
  onUpvote,
}: {
  report: Report;
  upvoted: boolean;
  onUpvote: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <MiniBadge tone="neutral">#{report.id}</MiniBadge>
          <h2 className="mt-3 text-xl font-bold text-[var(--asphalt)]">
            {report.title}
          </h2>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface-strong)]">
        <Image
          src={report.images[0].imageUrl}
          alt={report.images[0].alt}
          fill
          sizes="340px"
          priority
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        <p>{report.address}</p>
        <p>Dilaporkan hari ini, 09:24</p>
      </div>
      <p className="text-sm leading-6 text-[var(--asphalt)]">
        {report.description}
      </p>
      <button
        onClick={onUpvote}
        className={cn(
          "flex items-center justify-between rounded-lg border p-4 text-left transition",
          upvoted
            ? "border-[var(--danger)] bg-[rgb(239_59_45_/_8%)]"
            : "border-[var(--border)] bg-white hover:border-[var(--danger)]",
        )}
      >
        <span>
          <span className="block text-sm font-bold">
            {report.upvoteCount + (upvoted ? 1 : 0)} Upvote
          </span>
          <span className="text-xs text-[var(--muted)]">
            +12 warga merasakan hal serupa
          </span>
        </span>
        <ThumbsUp className={upvoted ? "size-5 text-[var(--danger)]" : "size-5"} />
      </button>
      <Button variant="secondary" className="mt-auto w-full">
        Lihat Detail
      </Button>
    </div>
  );
}
