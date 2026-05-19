import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SiteHeader } from "@/components/layout/site-header";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
        <div className="w-full">
          <AuthCard mode="register" />
          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[var(--teal)]">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
