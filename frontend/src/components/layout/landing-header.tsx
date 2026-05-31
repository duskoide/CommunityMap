"use client";

import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { ButtonLink } from "@/components/ui/button";
import type { AppUser } from "@/types/community-map";

const landingNav = [
  { href: "#hero", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#alur", label: "Alur" },
  { href: "#peta-preview", label: "Peta Publik" },
];

export function LandingHeader({ currentUser }: { currentUser: AppUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgb(7_24_38_/_88%)] text-white backdrop-blur-xl">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-5 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/main-logo.png"
            alt="CommunityMap Logo"
            width={36}
            height={36}
            className="rounded-md object-contain"
          />
          <span className="hidden sm:inline">CommunityMap</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {landingNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
          {currentUser ? (
            <>
              <ButtonLink
                href={currentUser.role === "admin" ? "/admin/settings" : "/settings"}
                variant="secondary"
                className="hidden border-white/18 bg-white text-[#071826]! sm:inline-flex"
              >
                {currentUser.fullName}
              </ButtonLink>
              <LogoutButton className="hidden sm:flex" />
            </>
          ) : (
            <>
              <ButtonLink
                href="/register"
                variant="secondary"
                className="hidden border-white/18 bg-white text-[#071826]! sm:inline-flex"
              >
                Daftar
              </ButtonLink>
              <ButtonLink href="/login">Masuk</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
