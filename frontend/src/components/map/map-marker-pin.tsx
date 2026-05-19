"use client";

import { CategoryIcon } from "@/components/ui/category-icon";
import { statusColors } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { Report } from "@/types/community-map";

export function MapMarkerPin({
  report,
  selected,
}: {
  report: Report;
  selected?: boolean;
}) {
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center transition hover:-translate-y-1",
        selected && "-translate-y-1",
      )}
      aria-label={report.title}
    >
      <span
        className={cn(
          "rounded-full ring-4 ring-white",
          selected && "shadow-[0_0_0_8px_rgb(245_197_24_/_24%)]",
        )}
      >
        <CategoryIcon slug={report.categorySlug} size={selected ? "lg" : "md"} />
      </span>
      <span
        className="mt-1 h-2 w-0.5 rounded-full"
        style={{ background: statusColors[report.status] }}
      />
    </button>
  );
}
