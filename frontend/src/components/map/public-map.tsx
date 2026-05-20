"use client";

import Image from "next/image";
import { Filter, Search, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Map, MapControls, MapMarker, MapRoute } from "@/components/ui/map";
import { MiniBadge, StatusBadge } from "@/components/ui/badge";
import { categories, statusLabels } from "@/data/report-metadata";
import { removeUpvote, upvoteReport } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type {
  Report,
  ReportCategorySlug,
  ReportStatus,
} from "@/types/community-map";
import { MapMarkerPin } from "./map-marker-pin";

const statuses: ReportStatus[] = ["new", "verified", "in_progress", "resolved"];

export function PublicMap({
  compact = false,
  initialReports,
}: {
  compact?: boolean;
  initialReports: Report[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [categoryFilters, setCategoryFilters] = useState<ReportCategorySlug[]>([]);
  const [statusFilters, setStatusFilters] = useState<ReportStatus[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialReports[0]?.id || null,
  );
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        categoryFilters.length === 0 || categoryFilters.includes(report.categorySlug);
      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(report.status);
      const matchesDistrict =
        districtFilter === "all" || report.district === districtFilter;
      const matchesSearch =
        search.trim().length === 0 ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.address.toLowerCase().includes(search.toLowerCase()) ||
        report.id.toLowerCase().includes(search.toLowerCase());

      let matchesDateRange = true;
      if (dateRange === "7d") {
        matchesDateRange =
          Date.now() - new Date(report.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === "30d") {
        matchesDateRange =
          Date.now() - new Date(report.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
      }

      return (
        matchesCategory &&
        matchesStatus &&
        matchesDistrict &&
        matchesSearch &&
        matchesDateRange
      );
    });
  }, [categoryFilters, dateRange, districtFilter, reports, search, statusFilters]);

  useEffect(() => {
    if (!filteredReports.some((report) => report.id === selectedReportId)) {
      setSelectedReportId(filteredReports[0]?.id || null);
    }
  }, [filteredReports, selectedReportId]);

  const visibleSelected =
    filteredReports.find((report) => report.id === selectedReportId) ||
    filteredReports[0] ||
    null;
  const districts = useMemo(
    () => Array.from(new Set(reports.map((report) => report.district))).sort(),
    [reports],
  );

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

  function handleUpvote(report: Report) {
    setFeedback(null);
    startTransition(async () => {
      try {
        const updated = report.hasUpvoted
          ? await removeUpvote(report.id)
          : await upvoteReport(report.id);

        setReports((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui upvote.",
        );
      }
    });
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
                setSearch("");
                setDistrictFilter("all");
                setDateRange("all");
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
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="all">Semua Data</option>
            </select>
            <label className="text-xs font-bold text-[var(--muted)]">Area</label>
            <select
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="all">Semua Wilayah</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <Button className="mt-2" variant="secondary">
              {filteredReports.length} laporan ditemukan
            </Button>
          </div>
        </aside>
      )}

      <div className="relative min-h-[460px]">
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 shadow-[var(--shadow)] lg:left-8 lg:right-auto lg:w-[420px]">
          <Search className="size-4 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cari lokasi atau alamat..."
          />
        </div>
        <Map
          initialViewState={{ longitude: 106.8456, latitude: -6.2088, zoom: 10.5 }}
          className="h-full min-h-[460px] w-full"
        >
          <MapControls position="top-right" />
          {filteredReports.length > 1 && (
            <MapRoute
              coordinates={filteredReports.map((report) => [
                report.coordinates.longitude,
                report.coordinates.latitude,
              ])}
            />
          )}
          {filteredReports.map((report) => (
            <MapMarker
              key={report.id}
              longitude={report.coordinates.longitude}
              latitude={report.coordinates.latitude}
              onClick={() => setSelectedReportId(report.id)}
            >
              <MapMarkerPin
                report={report}
                selected={visibleSelected?.id === report.id}
              />
            </MapMarker>
          ))}
        </Map>
        {feedback && (
          <div className="absolute bottom-4 right-4 z-10 max-w-xs rounded-lg border border-[rgb(239_59_45_/_24%)] bg-white px-4 py-3 text-sm shadow-[var(--shadow)]">
            {feedback}
          </div>
        )}
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
            pending={pending}
            onUpvote={() => handleUpvote(visibleSelected)}
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
  onUpvote,
  pending,
}: {
  report: Report;
  onUpvote: () => void;
  pending: boolean;
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
        <p>
          Dilaporkan{" "}
          {new Date(report.createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <p className="text-sm leading-6 text-[var(--asphalt)]">
        {report.description}
      </p>
      <button
        disabled={pending}
        onClick={onUpvote}
        className={cn(
          "flex items-center justify-between rounded-lg border p-4 text-left transition",
          report.hasUpvoted
            ? "border-[var(--danger)] bg-[rgb(239_59_45_/_8%)]"
            : "border-[var(--border)] bg-white hover:border-[var(--danger)]",
        )}
      >
        <span>
          <span className="block text-sm font-bold">
            {report.upvoteCount} Upvote
          </span>
          <span className="text-xs text-[var(--muted)]">
            +12 warga merasakan hal serupa
          </span>
        </span>
        <ThumbsUp className={report.hasUpvoted ? "size-5 text-[var(--danger)]" : "size-5"} />
      </button>
      <Button
        variant="secondary"
        className="mt-auto w-full"
        onClick={() => window.location.assign(`/reports/${report.id}`)}
      >
        Lihat Detail
      </Button>
    </div>
  );
}
