import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AppHeader } from "@/components/layout/app-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { safeGetCurrentUser } from "@/lib/api";

export default async function LoginPage() {
  const currentUser = await safeGetCurrentUser();

  return (
    <>
      <AppHeader />
      <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
        <div className="w-full">
          {currentUser ? (
            <Card className="mx-auto max-w-xl p-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--teal)]">
                Sudah Login
              </p>
              <h1 className="mt-3 text-3xl font-black">
                Kamu sudah masuk sebagai {currentUser.role === "admin" ? "petugas" : "warga"}
              </h1>
              <p className="mt-3 text-[var(--muted)]">
                Akun aktif: <strong>{currentUser.fullName}</strong>. Lanjutkan ke
                area yang sesuai biar nggak bingung dengan fitur yang tersedia.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <ButtonLink href={currentUser.role === "admin" ? "/admin" : "/history"}>
                  Lanjutkan
                </ButtonLink>
                <ButtonLink href="/map" variant="secondary">
                  Lihat Peta
                </ButtonLink>
              </div>
            </Card>
          ) : (
            <>
              <AuthCard mode="login" />
              <p className="mt-5 text-center text-sm text-[var(--muted)]">
                Belum punya akun?{" "}
                <Link href="/register" className="font-bold text-[var(--teal)]">
                  Daftar sekarang
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
