import { getStatusLabel, statusColors } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/community-map";

export function StatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        className,
      )}
      style={{
        borderColor: `${statusColors[status]}55`,
        background: `${statusColors[status]}12`,
        color: statusColors[status],
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: statusColors[status] }}
      />
      {getStatusLabel(status)}
    </span>
  );
}

export function MiniBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "amber" | "danger";
}) {
  const tones = {
    neutral: "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]",
    teal: "border-[rgb(0_107_98_/_25%)] bg-[rgb(0_107_98_/_9%)] text-[var(--teal)]",
    amber:
      "border-[rgb(245_197_24_/_35%)] bg-[rgb(245_197_24_/_16%)] text-[#806300]",
    danger:
      "border-[rgb(239_59_45_/_25%)] bg-[rgb(239_59_45_/_9%)] text-[var(--danger)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
