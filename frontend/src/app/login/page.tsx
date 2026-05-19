import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SiteHeader } from "@/components/layout/site-header";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
        <div className="w-full">
          <AuthCard mode="login" />
          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-[var(--teal)]">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
