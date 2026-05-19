import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { ReportDetail } from "@/components/report/report-detail";
import { getReportById } from "@/lib/api";

export default async function ReportDetailPage({
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
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <ReportDetail report={report} />
      </main>
    </>
  );
}
