"use client";

import { useState, useTransition } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniBadge } from "@/components/ui/badge";
import { login, register } from "@/lib/api/client";
import type { UserRole } from "@/types/community-map";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState<UserRole>("citizen");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isRegister = mode === "register";

  function switchRole(nextRole: UserRole) {
    setRole(nextRole);
    setFeedback(null);
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <MiniBadge tone="teal">{isRegister ? "Daftar Akun" : "Masuk"}</MiniBadge>
      <h1 className="mt-4 text-3xl font-black">
        {isRegister ? "Buat akun CommunityMap" : "Masuk ke CommunityMap"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {isRegister
          ? "Pendaftaran publik dibuka untuk akun warga. Akun petugas masuk lewat halaman login yang sudah disiapkan."
          : "Masukkan email dan password akun kamu untuk masuk ke CommunityMap."}
      </p>
      {!isRegister ? (
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-[var(--surface-strong)] p-1">
          {(["citizen", "admin"] as UserRole[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => switchRole(item)}
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
      ) : (
        <div className="mt-5 rounded-lg bg-[rgb(0_107_98_/_8%)] px-4 py-3 text-sm font-semibold text-[var(--teal)]">
          Akun yang dibuat dari sini otomatis bertipe Warga.
        </div>
      )}
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            try {
              setFeedback(null);

              const trimmedEmail = email.trim();
              const trimmedPassword = password;

              if (!trimmedEmail || !trimmedPassword) {
                setFeedback("Email dan password wajib diisi.");
                return;
              }

              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                setFeedback("Format email tidak valid.");
                return;
              }

              if (isRegister) {
                const trimmedUsername = username.trim();
                const trimmedFullName = fullName.trim();
                if (!trimmedUsername || !trimmedFullName) {
                  setFeedback("Username dan nama lengkap wajib diisi.");
                  return;
                }
                await register({
                  username: trimmedUsername,
                  fullName: trimmedFullName,
                  email: trimmedEmail,
                  password: trimmedPassword,
                  role: "citizen",
                });
                window.location.assign("/settings");
              } else {
                await login({ email: trimmedEmail, password: trimmedPassword });
                window.location.assign(role === "admin" ? "/admin" : "/history");
              }
            } catch (error) {
              setFeedback(
                error instanceof Error ? error.message : "Autentikasi gagal.",
              );
            }
          });
        }}
      >
        {feedback && (
          <div className="rounded-lg border border-[rgb(239_59_45_/_24%)] bg-[rgb(239_59_45_/_8%)] px-4 py-3 text-sm text-[var(--danger)]">
            {feedback}
          </div>
        )}
        {isRegister && (
          <AuthField
            icon={UserRound}
            label="Username"
            placeholder="Contoh: budi_santoso"
            value={username}
            onChange={setUsername}
          />
        )}
        {isRegister && (
          <AuthField
            icon={UserRound}
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            value={fullName}
            onChange={setFullName}
          />
        )}
        <AuthField
          icon={Mail}
          label="Email"
          type="email"
          placeholder={isRegister ? "Contoh: budi@email.com" : "Email akun kamu"}
          value={email}
          onChange={setEmail}
        />
        <AuthField
          icon={LockKeyhole}
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
        </Button>
      </form>
    </Card>
  );
}

function AuthField({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold">
      {label}
      <span className="flex h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 focus-within:border-[var(--teal)] focus-within:ring-1 focus-within:ring-[var(--teal)]">
        <Icon className="size-4 text-[var(--muted)]" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]/50"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}
