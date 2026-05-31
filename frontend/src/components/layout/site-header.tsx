"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/community-map";

function getNavigation(currentUser: AppUser | null) {
  if (!currentUser) {
    return [
      { href: "/map", label: "Peta" },
      { href: "/feeds", label: "Feeds" },
    ];
  }

  if (currentUser.role === "admin") {
    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/reports", label: "Laporan" },
      { href: "/admin/verification", label: "Verifikasi" },
      { href: "/map", label: "Peta" },
    ];
  }

  return [
    { href: "/map", label: "Peta" },
    { href: "/feeds", label: "Feeds" },
    { href: "/report", label: "Lapor" },
    { href: "/history", label: "Riwayat" },
  ];
}

function getSettingsHref(currentUser: AppUser) {
  return currentUser.role === "admin" ? "/admin/settings" : "/settings";
}

function getPrimaryAction(currentUser: AppUser | null) {
  if (!currentUser) {
    return { href: "/login", label: "Masuk" };
  }

  if (currentUser.role === "admin") {
    return { href: "/admin", label: "Dashboard" };
  }

  return { href: "/report", label: "Laporkan Jalan" };
}

export function SiteHeader({
  dark = false,
  currentUser = null,
}: {
  dark?: boolean;
  currentUser?: AppUser | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navItems = getNavigation(currentUser);
  const primaryAction = getPrimaryAction(currentUser);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        dark
          ? "border-white/10 bg-[rgb(7_24_38_/_88%)] text-white"
          : "border-[var(--border)] bg-white/90 text-[var(--asphalt)]",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-5 lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
          <Image
            src="/main-logo.png"
            alt="CommunityMap Logo"
            width={36}
            height={36}
            className="rounded-md object-contain"
          />
          <span className="hidden sm:inline">CommunityMap</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition",
                pathname === item.href
                  ? dark
                    ? "bg-white/10 text-white"
                    : "bg-[var(--surface-strong)] text-[var(--teal)]"
                  : dark
                    ? "text-white/78 hover:text-white"
                    : "text-[var(--muted)] hover:text-[var(--asphalt)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {currentUser ? (
            <>
              <Link
                href={getSettingsHref(currentUser)}
                className={cn(
                  "hidden min-h-10 max-w-[180px] items-center truncate rounded-md border px-3 text-sm font-semibold transition sm:inline-flex",
                  dark
                    ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                    : "border-[var(--border)] bg-white text-[var(--asphalt)] hover:border-[var(--teal)]",
                )}
              >
                {currentUser.fullName}
              </Link>
              <LogoutButton className="hidden sm:flex" />
            </>
          ) : (
            <ButtonLink href="/register" variant="secondary" className="hidden sm:inline-flex">
              Daftar
            </ButtonLink>
          )}
          <ButtonLink href={primaryAction.href} className="hidden sm:inline-flex">
            {primaryAction.label}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-current/15 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Buka menu</span>
          </button>
        </div>
      </div>

      {open && (
        <div className={cn("border-t px-4 py-3 md:hidden", dark ? "border-white/10" : "border-[var(--border)]")}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-black/5"
              >
                {item.label}
              </Link>
            ))}
            {currentUser && (
              <Link
                href={getSettingsHref(currentUser)}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-black/5"
              >
                {currentUser.fullName}
              </Link>
            )}
            {!currentUser && (
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-black/5"
              >
                Daftar
              </Link>
            )}
            {currentUser && (
              <div className="mt-1 border-t border-current/10 pt-2">
                <LogoutButton className="w-full justify-start px-3" />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
