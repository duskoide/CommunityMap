import { SiteHeader } from "@/components/layout/site-header";
import { ReportForm } from "@/components/report/report-form";

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <ReportForm />
      </main>
    </>
  );
}
