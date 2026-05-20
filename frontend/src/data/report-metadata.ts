import type { ReportCategory, ReportCategorySlug, ReportStatus } from "@/types/community-map";

export const categories: ReportCategory[] = [
  {
    id: 1,
    slug: "pothole",
    name: "Jalan Berlubang",
    shortName: "Berlubang",
    color: "#ef3b2d",
    accent: "danger",
    icon: "triangle",
  },
  {
    id: 2,
    slug: "streetlight",
    name: "Lampu Jalan Mati",
    shortName: "Lampu Mati",
    color: "#f28c18",
    accent: "amber",
    icon: "light",
  },
  {
    id: 3,
    slug: "puddle",
    name: "Genangan Air",
    shortName: "Genangan",
    color: "#2477d9",
    accent: "blue",
    icon: "drop",
  },
  {
    id: 4,
    slug: "flood",
    name: "Banjir Lokal",
    shortName: "Banjir",
    color: "#17aeb8",
    accent: "cyan",
    icon: "wave",
  },
  {
    id: 5,
    slug: "other",
    name: "Lainnya",
    shortName: "Lainnya",
    color: "#5a6472",
    accent: "slate",
    icon: "dot",
  },
];

export const statusLabels: Record<ReportStatus, string> = {
  new: "Baru",
  verified: "Diverifikasi",
  in_progress: "Sedang Diperbaiki",
  resolved: "Selesai",
};

export const statusColors: Record<ReportStatus, string> = {
  new: "#ef3b2d",
  verified: "#2477d9",
  in_progress: "#f28c18",
  resolved: "#3ba765",
};

export function getCategory(slug: ReportCategorySlug) {
  return categories.find((category) => category.slug === slug) ?? categories[4];
}

export function getStatusLabel(status: ReportStatus) {
  return statusLabels[status];
}
