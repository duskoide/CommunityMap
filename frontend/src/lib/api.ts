import { adminStats, reports } from "@/data/mock-data";
import type { Report, ReportStatus } from "@/types/community-map";

export async function getReports(): Promise<Report[]> {
  return reports;
}

export async function getReportById(id: string): Promise<Report | undefined> {
  return reports.find((report) => report.id === id);
}

export async function getMyReports(): Promise<Report[]> {
  return reports.filter((report) => report.reporterId === "user-1");
}

export async function getAdminStats() {
  return adminStats;
}

export function updateReportStatus(report: Report, nextStatus: ReportStatus) {
  return {
    ...report,
    status: nextStatus,
    isVerified: nextStatus !== "new",
    updatedAt: new Date().toISOString(),
    statusLogs: [
      ...report.statusLogs,
      {
        id: `log-${report.id}-${nextStatus}`,
        previousStatus: report.status,
        nextStatus,
        note: "Status diperbarui pada sesi demo frontend.",
        updatedBy: "Admin DPU",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
