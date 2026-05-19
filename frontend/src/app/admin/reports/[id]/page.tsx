import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminReportDetail } from "@/components/dashboard/admin-report-detail";
import { getReportById } from "@/lib/api";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <AdminShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <AdminReportDetail report={report} />
      </main>
    </AdminShell>
  );
}
