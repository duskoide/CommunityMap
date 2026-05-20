"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { logout } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "sidebar";
}) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              setFeedback(null);
              await logout();
              window.location.assign("/");
            } catch (error) {
              setFeedback(
                error instanceof Error ? error.message : "Gagal keluar akun.",
              );
            }
          })
        }
        className={cn(
          "inline-flex items-center gap-2 rounded-md text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          variant === "sidebar"
            ? "px-3 py-2.5 text-white/68 hover:bg-white/8 hover:text-white"
            : "min-h-10 border border-[var(--border)] bg-white px-4 py-2 text-[var(--asphalt)] hover:border-[var(--teal)] hover:text-[var(--teal)]",
        )}
      >
        <LogOut className="size-4" />
        {pending ? "Keluar..." : "Keluar"}
      </button>
      {feedback && (
        <p
          className={cn(
            "text-xs",
            variant === "sidebar" ? "text-white/68" : "text-[var(--danger)]",
          )}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
