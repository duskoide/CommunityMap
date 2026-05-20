import {
  BarChart3,
  ClipboardList,
  MapPinned,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import type { AppUser } from "@/types/community-map";

const adminNav = [
  { label: "Ringkasan", href: "/admin", icon: BarChart3 },
  { label: "Laporan Masuk", href: "/admin#reports", icon: ClipboardList },
  { label: "Verifikasi", href: "/admin#verification", icon: ShieldCheck },
  { label: "Peta Pantau", href: "/map", icon: MapPinned },
  { label: "Pengaturan", href: "/admin#settings", icon: Settings },
];

export function AdminShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: AppUser;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col bg-[var(--asphalt)] text-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex size-11 items-center justify-center rounded-md border border-[var(--amber)] text-[var(--amber)]">
            DPU
          </span>
          <div>
            <p className="text-sm font-bold">{currentUser.fullName}</p>
            <p className="text-xs text-white/58">Petugas monitoring</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {adminNav.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  index === 0
                    ? "flex items-center gap-3 rounded-md bg-[var(--teal)] px-3 py-2.5 text-sm font-semibold"
                    : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/68 transition hover:bg-white/8 hover:text-white"
                }
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton className="m-3" variant="sidebar" />
      </aside>
      <main className="lg:pl-56">{children}</main>
    </div>
  );
}
