import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "bg-[var(--amber)] text-[var(--asphalt)] shadow-[0_12px_28px_rgb(245_197_24_/_26%)] hover:bg-[#f8d648]",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--asphalt)] hover:border-[var(--teal)] hover:text-[var(--teal)]",
  ghost:
    "text-[var(--asphalt)] hover:bg-[rgb(7_24_38_/_6%)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[0_12px_28px_rgb(239_59_45_/_22%)] hover:bg-[#d72f23]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-offset-2",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
