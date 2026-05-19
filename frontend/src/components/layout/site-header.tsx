"use client";

import { Menu, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/map", label: "Peta" },
  { href: "/report", label: "Lapor" },
  { href: "/history", label: "Riwayat" },
  { href: "/admin", label: "Dashboard" },
];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();

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
          <ButtonLink href="/report" className="hidden sm:inline-flex">
            Laporkan Jalan
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
