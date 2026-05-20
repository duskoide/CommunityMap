import {
  AlertTriangle,
  Droplets,
  LightbulbOff,
  MapPin,
  Waves,
} from "lucide-react";
import { getCategory } from "@/data/report-metadata";
import { cn } from "@/lib/utils";
import type { ReportCategorySlug } from "@/types/community-map";

const iconMap = {
  triangle: AlertTriangle,
  light: LightbulbOff,
  drop: Droplets,
  wave: Waves,
  dot: MapPin,
};

export function CategoryIcon({
  slug,
  size = "md",
  className,
}: {
  slug: ReportCategorySlug;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const category = getCategory(slug);
  const Icon = iconMap[category.icon];
  const sizes = {
    sm: "size-7",
    md: "size-9",
    lg: "size-12",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgb(7_24_38_/_18%)]",
        sizes[size],
        className,
      )}
      style={{ background: category.color }}
      title={category.name}
    >
      <Icon className="size-[52%]" strokeWidth={2.4} />
    </span>
  );
}
