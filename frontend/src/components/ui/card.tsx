import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow)]",
        className,
      )}
      {...props}
    />
  );
}

export function Panel({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow)]",
        className,
      )}
      {...props}
    />
  );
}
