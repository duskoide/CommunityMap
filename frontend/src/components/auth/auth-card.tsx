"use client";

import { useState } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniBadge } from "@/components/ui/badge";
import type { UserRole } from "@/types/community-map";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState<UserRole>("citizen");
  const isRegister = mode === "register";

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <MiniBadge tone="teal">{isRegister ? "Daftar Akun" : "Masuk"}</MiniBadge>
      <h1 className="mt-4 text-3xl font-black">
        {isRegister ? "Buat akun CommunityMap" : "Masuk ke CommunityMap"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Simulasi autentikasi frontend untuk warga dan petugas. Integrasi JWT
        akan mengikuti backend nanti.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-[var(--surface-strong)] p-1">
        {(["citizen", "admin"] as UserRole[]).map((item) => (
          <button
            key={item}
            onClick={() => setRole(item)}
            className={
              role === item
                ? "rounded-md bg-white px-3 py-2 text-sm font-bold shadow"
                : "rounded-md px-3 py-2 text-sm font-bold text-[var(--muted)]"
            }
          >
            {item === "citizen" ? "Warga" : "Petugas"}
          </button>
        ))}
      </div>
      <form className="mt-5 flex flex-col gap-4">
        {isRegister && (
          <AuthField icon={UserRound} label="Nama Lengkap" defaultValue="Budi Santoso" />
        )}
        <AuthField icon={Mail} label="Email" defaultValue={role === "admin" ? "admin@dpu.go.id" : "warga@email.com"} />
        <AuthField icon={LockKeyhole} label="Password" type="password" defaultValue="password" />
        <Button
          type="button"
          onClick={() => window.location.assign(role === "admin" ? "/admin" : "/history")}
        >
          {isRegister ? "Daftar" : "Masuk"}
        </Button>
      </form>
    </Card>
  );
}

function AuthField({
  icon: Icon,
  label,
  type = "text",
  defaultValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold">
      {label}
      <span className="flex h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3">
        <Icon className="size-4 text-[var(--muted)]" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          type={type}
          defaultValue={defaultValue}
        />
      </span>
    </label>
  );
}
