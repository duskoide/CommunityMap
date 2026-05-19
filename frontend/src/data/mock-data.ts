import type {
  AdminStats,
  Report,
  ReportCategory,
  ReportCategorySlug,
  ReportStatus,
} from "@/types/community-map";

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

export const reports: Report[] = [
  {
    id: "RPT-2024-0512",
    reporterId: "user-1",
    reporterName: "Budi Santoso",
    categorySlug: "pothole",
    title: "Jalan Berlubang di Jl. Ahmad Yani",
    description:
      "Lubang cukup besar di tengah jalan, berbahaya untuk motor terutama saat malam hari.",
    address: "Jl. Ahmad Yani No. 45, Kec. Cempaka Putih",
    district: "Jakarta Pusat",
    coordinates: { latitude: -6.1817, longitude: 106.8663 },
    status: "new",
    isVerified: false,
    upvoteCount: 32,
    createdAt: "2024-05-12T09:24:00.000Z",
    updatedAt: "2024-05-12T09:24:00.000Z",
    images: [
      {
        id: "img-1",
        imageUrl:
          "/images/report-pothole.svg",
        storageKey: "reports/RPT-2024-0512/main.jpg",
        alt: "Permukaan jalan berlubang dan rusak",
      },
    ],
    statusLogs: [
      {
        id: "log-1",
        nextStatus: "new",
        note: "Laporan diterima dari warga.",
        updatedBy: "System",
        createdAt: "2024-05-12T09:24:00.000Z",
      },
    ],
  },
  {
    id: "RPT-2024-0489",
    reporterId: "user-1",
    reporterName: "Budi Santoso",
    categorySlug: "streetlight",
    title: "Lampu Jalan Mati di Jl. Kenanga",
    description:
      "Tiga lampu penerangan mati berurutan sehingga area menjadi gelap dan rawan.",
    address: "Jl. Kenanga No. 12, Jakarta Selatan",
    district: "Jakarta Selatan",
    coordinates: { latitude: -6.2389, longitude: 106.8121 },
    status: "verified",
    isVerified: true,
    upvoteCount: 18,
    createdAt: "2024-05-02T20:11:00.000Z",
    updatedAt: "2024-05-03T08:00:00.000Z",
    images: [
      {
        id: "img-2",
        imageUrl:
          "/images/report-streetlight.svg",
        storageKey: "reports/RPT-2024-0489/main.jpg",
        alt: "Jalan kota saat malam hari",
      },
    ],
    statusLogs: [
      {
        id: "log-2",
        nextStatus: "new",
        note: "Laporan diterima dari warga.",
        updatedBy: "System",
        createdAt: "2024-05-02T20:11:00.000Z",
      },
      {
        id: "log-3",
        previousStatus: "new",
        nextStatus: "verified",
        note: "Lokasi dan foto laporan sudah diverifikasi.",
        updatedBy: "Admin DPU",
        createdAt: "2024-05-03T08:00:00.000Z",
      },
    ],
  },
  {
    id: "RPT-2024-0410",
    reporterId: "user-2",
    reporterName: "Siti Rahma",
    categorySlug: "puddle",
    title: "Genangan Air di Jl. Melati",
    description:
      "Genangan muncul setelah hujan dan menutup sebagian lajur kiri.",
    address: "Jl. Melati Raya, Jakarta Timur",
    district: "Jakarta Timur",
    coordinates: { latitude: -6.2196, longitude: 106.8996 },
    status: "in_progress",
    isVerified: true,
    upvoteCount: 41,
    createdAt: "2024-04-28T16:45:00.000Z",
    updatedAt: "2024-05-01T10:30:00.000Z",
    images: [
      {
        id: "img-3",
        imageUrl:
          "/images/report-puddle.svg",
        storageKey: "reports/RPT-2024-0410/main.jpg",
        alt: "Jalan basah setelah hujan",
      },
    ],
    statusLogs: [
      {
        id: "log-4",
        nextStatus: "new",
        note: "Laporan diterima dari warga.",
        updatedBy: "System",
        createdAt: "2024-04-28T16:45:00.000Z",
      },
      {
        id: "log-5",
        previousStatus: "verified",
        nextStatus: "in_progress",
        note: "Tim lapangan dijadwalkan mengecek saluran air.",
        updatedBy: "Admin DPU",
        createdAt: "2024-05-01T10:30:00.000Z",
      },
    ],
  },
  {
    id: "RPT-2024-0322",
    reporterId: "user-1",
    reporterName: "Budi Santoso",
    categorySlug: "flood",
    title: "Banjir Lokal di Perumahan Cendana",
    description:
      "Air masuk ke bahu jalan dan kendaraan kecil harus memutar.",
    address: "Perumahan Cendana, Bekasi",
    district: "Bekasi",
    coordinates: { latitude: -6.2615, longitude: 106.9732 },
    status: "resolved",
    isVerified: true,
    upvoteCount: 57,
    createdAt: "2024-04-20T08:30:00.000Z",
    updatedAt: "2024-04-24T15:10:00.000Z",
    images: [
      {
        id: "img-4",
        imageUrl:
          "/images/report-flood.svg",
        storageKey: "reports/RPT-2024-0322/main.jpg",
        alt: "Banjir lokal di jalan lingkungan",
      },
    ],
    statusLogs: [
      {
        id: "log-6",
        nextStatus: "new",
        note: "Laporan diterima dari warga.",
        updatedBy: "System",
        createdAt: "2024-04-20T08:30:00.000Z",
      },
      {
        id: "log-7",
        previousStatus: "in_progress",
        nextStatus: "resolved",
        note: "Saluran air dibersihkan dan jalan sudah dapat dilewati.",
        updatedBy: "Admin DPU",
        createdAt: "2024-04-24T15:10:00.000Z",
      },
    ],
  },
  {
    id: "RPT-2024-0508",
    reporterId: "user-3",
    reporterName: "Nadia Putri",
    categorySlug: "pothole",
    title: "Lubang di Jl. Kebon Raya",
    description: "Lubang memanjang dekat belokan dan belum ada penanda.",
    address: "Jl. Kebon Raya, Jakarta Barat",
    district: "Jakarta Barat",
    coordinates: { latitude: -6.1699, longitude: 106.7591 },
    status: "resolved",
    isVerified: true,
    upvoteCount: 25,
    createdAt: "2024-05-08T07:19:00.000Z",
    updatedAt: "2024-05-10T11:00:00.000Z",
    images: [
      {
        id: "img-5",
        imageUrl:
          "/images/report-road.svg",
        storageKey: "reports/RPT-2024-0508/main.jpg",
        alt: "Permukaan jalan perkotaan",
      },
    ],
    statusLogs: [
      {
        id: "log-8",
        nextStatus: "resolved",
        note: "Perbaikan selesai.",
        updatedBy: "Admin DPU",
        createdAt: "2024-05-10T11:00:00.000Z",
      },
    ],
  },
];

export const adminStats: AdminStats = {
  totalReports: 1248,
  newReports: 312,
  verifiedReports: 356,
  inProgressReports: 298,
  resolvedReports: 282,
  upvotes: 128,
};

export function getCategory(slug: ReportCategorySlug) {
  return categories.find((category) => category.slug === slug) ?? categories[4];
}

export function getStatusLabel(status: ReportStatus) {
  return statusLabels[status];
}

export function getReportsByFilters(
  selectedCategories: ReportCategorySlug[],
  selectedStatuses: ReportStatus[],
) {
  return reports.filter((report) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(report.categorySlug);
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(report.status);

    return matchesCategory && matchesStatus;
  });
}
