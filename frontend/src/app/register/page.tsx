import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AppHeader } from "@/components/layout/app-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { safeGetCurrentUser } from "@/lib/api";

export default async function RegisterPage() {
  const currentUser = await safeGetCurrentUser();

  return (
    <>
      <AppHeader />
      <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
        <div className="w-full">
          {currentUser ? (
            <Card className="mx-auto max-w-xl p-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--teal)]">
                Akun Aktif
              </p>
              <h1 className="mt-3 text-3xl font-black">Akun baru tidak diperlukan</h1>
              <p className="mt-3 text-[var(--muted)]">
                Kamu sudah login sebagai <strong>{currentUser.fullName}</strong>.
                Kalau ingin memakai fitur lain, langsung lanjut ke area yang sesuai.
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
              <AuthCard mode="register" />
              <p className="mt-5 text-center text-sm text-[var(--muted)]">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-[var(--teal)]">
                  Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
