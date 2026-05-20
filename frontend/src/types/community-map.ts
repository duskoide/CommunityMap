export type UserRole = "citizen" | "admin";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type ReportCategorySlug =
  | "pothole"
  | "streetlight"
  | "puddle"
  | "flood"
  | "other";

export type ReportStatus = "new" | "verified" | "in_progress" | "resolved";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ReportCategory = {
  id: number;
  slug: ReportCategorySlug;
  name: string;
  shortName: string;
  color: string;
  accent: string;
  icon: "triangle" | "light" | "drop" | "wave" | "dot";
};

export type ReportImage = {
  id: string;
  imageUrl: string;
  storageKey: string;
  alt: string;
};

export type StatusLog = {
  id: string;
  previousStatus?: ReportStatus;
  nextStatus: ReportStatus;
  note: string;
  updatedBy: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  reporterName: string;
  categorySlug: ReportCategorySlug;
  title: string;
  description: string;
  address: string;
  district: string;
  coordinates: Coordinates;
  status: ReportStatus;
  isVerified: boolean;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
  images: ReportImage[];
  statusLogs: StatusLog[];
  hasUpvoted?: boolean;
};

export type AdminStats = {
  totalReports: number;
  newReports: number;
  verifiedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  upvotes: number;
};
