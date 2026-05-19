import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "blue" | "green" | "danger";
}) {
  const colors = {
    teal: "bg-[rgb(0_107_98_/_10%)] text-[var(--teal)]",
    amber: "bg-[rgb(245_197_24_/_18%)] text-[#806300]",
    blue: "bg-[rgb(36_119_217_/_12%)] text-[var(--blue)]",
    green: "bg-[rgb(59_167_101_/_12%)] text-[var(--green)]",
    danger: "bg-[rgb(239_59_45_/_10%)] text-[var(--danger)]",
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--asphalt)]">
            {value}
          </p>
        </div>
        <span className={`flex size-9 items-center justify-center rounded-md ${colors[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">{helper}</p>
    </div>
  );
}
