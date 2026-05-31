import { safeGetCurrentUser } from "@/lib/api/server";
import Image from "next/image";
import Link from "next/link";

const baseFooterLinks = [
  {
    title: "Navigasi",
    links: [
      { href: "/map", label: "Peta Publik" },
      { href: "/report", label: "Laporkan Jalan" },
      { href: "/history", label: "Riwayat Laporan" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { href: "/about", label: "Tentang Kami" },
      { href: "/contact", label: "Kontak" },
      { href: "/privacy", label: "Kebijakan Privasi" },
    ],
  },
];

const adminFooterLinks = {
  title: "Admin",
  links: [
    { href: "/admin", label: "Dashboard" },
    { href: "/login", label: "Masuk" },
    { href: "/register", label: "Daftar" },
  ],
};

export async function SiteFooter() {
  const currentUser = await safeGetCurrentUser();
  const footerLinks = [...baseFooterLinks];
  if (currentUser?.role === "admin") {
    footerLinks.splice(1, 0, adminFooterLinks); // Insert admin before "Informasi"
  }

  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image
                src="/main-logo.png"
                alt="CommunityMap Logo"
                width={40}
                height={40}
                className="rounded-md object-contain"
              />
              <span className="text-lg font-bold text-white">
                CommunityMap
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
              Platform crowdsourcing untuk pelaporan kondisi jalan dan peta
              kerawanan real-time di seluruh Indonesia.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/58 transition hover:text-[var(--amber)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/42">
            &copy; {new Date().getFullYear()} CommunityMap. Semua hak
            dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/42">
            <Link
              href="/about"
              className="transition hover:text-[var(--amber)]"
            >
              Tentang Kami
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/privacy"
              className="transition hover:text-[var(--amber)]"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
