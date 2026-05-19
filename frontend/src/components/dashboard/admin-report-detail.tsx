"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ReportDetail } from "@/components/report/report-detail";
import { statusLabels } from "@/data/mock-data";
import { updateReportStatus } from "@/lib/api";
import type { Report, ReportStatus } from "@/types/community-map";

const statuses: ReportStatus[] = ["new", "verified", "in_progress", "resolved"];

export function AdminReportDetail({ report: initialReport }: { report: Report }) {
  const [report, setReport] = useState(initialReport);
  const [nextStatus, setNextStatus] = useState<ReportStatus>(initialReport.status);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black">Kontrol Verifikasi</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Update status ini berjalan lokal untuk demo frontend.
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as ReportStatus)}
            className="h-11 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          <Button onClick={() => setReport(updateReportStatus(report, nextStatus))}>
            Simpan Status
          </Button>
        </div>
      </Card>
      <ReportDetail report={report} admin />
    </div>
  );
}
