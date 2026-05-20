"use client";

import { Menu, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/community-map";

function getNavigation(currentUser: AppUser | null) {
  if (!currentUser) {
    return [{ href: "/map", label: "Peta" }];
  }

  if (currentUser.role === "admin") {
    return [
      { href: "/map", label: "Peta" },
      { href: "/admin", label: "Dashboard" },
    ];
  }

  return [
    { href: "/map", label: "Peta" },
    { href: "/report", label: "Lapor" },
    { href: "/history", label: "Riwayat" },
  ];
}

function getPrimaryAction(currentUser: AppUser | null) {
  if (!currentUser) {
    return {
      href: "/login",
      label: "Masuk Dulu",
    };
  }

  if (currentUser.role === "admin") {
    return {
      href: "/admin",
      label: "Dashboard Petugas",
    };
  }

  return {
    href: "/report",
    label: "Laporkan Jalan",
  };
}

export function SiteHeader({
  dark = false,
  currentUser = null,
}: {
  dark?: boolean;
  currentUser?: AppUser | null;
}) {
  const pathname = usePathname();
  const navItems = getNavigation(currentUser);
  const primaryAction = getPrimaryAction(currentUser);
  const roleLabel =
    currentUser?.role === "admin" ? "Petugas" : currentUser ? "Warga" : "Tamu";
  const statusLabel = currentUser
    ? `Masuk sebagai ${roleLabel}`
    : "Belum login";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        dark
          ? "border-white/10 bg-[rgb(7_24_38_/_88%)] text-white"
          : "border-[var(--border)] bg-white/88 text-[var(--asphalt)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-md bg-[var(--teal)] text-white">
            <MapPin className="size-4" />
          </span>
          CommunityMap
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
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
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em]",
                  dark ? "text-white/62" : "text-[var(--muted)]",
                )}
              >
                {statusLabel}
              </p>
              <p className="text-sm font-semibold">
                {currentUser ? currentUser.fullName : "Peta publik dapat diakses semua orang"}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1 text-xs font-bold",
                currentUser?.role === "admin"
                  ? "bg-[rgb(245_197_24_/_18%)] text-[#806300]"
                  : currentUser
                    ? "bg-[rgb(0_107_98_/_10%)] text-[var(--teal)]"
                    : dark
                      ? "bg-white/10 text-white"
                      : "bg-[var(--surface-strong)] text-[var(--muted)]",
              )}
            >
              {roleLabel}
            </span>
          </div>
          {!currentUser && (
            <ButtonLink href="/register" variant="secondary" className="hidden sm:inline-flex">
              Daftar
            </ButtonLink>
          )}
          {currentUser && <LogoutButton className="hidden sm:flex" />}
          <ButtonLink href={primaryAction.href} className="hidden sm:inline-flex">
            {primaryAction.label}
          </ButtonLink>
          <button className="inline-flex size-10 items-center justify-center rounded-md border border-current/15 md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Buka menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
