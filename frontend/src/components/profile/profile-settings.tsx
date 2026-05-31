"use client";

import Image from "next/image";
import { Camera, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateProfile, uploadAsset } from "@/lib/api/client";
import type { AppUser } from "@/types/community-map";

export function ProfileSettings({ currentUser }: { currentUser: AppUser }) {
  const [username, setUsername] = useState(currentUser.username || "");
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setFeedback(null);
    startTransition(async () => {
      try {
        await updateProfile({
          username,
          fullName,
          email,
          avatarUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        });
        window.location.assign("/feeds");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Gagal memperbarui profil.",
        );
      }
    });
  }

  function uploadAvatar(file: File | null) {
    if (!file) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const uploaded = await uploadAsset({
          file,
          purpose: "avatar",
          alt: fullName,
        });
        setAvatarUrl(uploaded.imageUrl);
        setFeedback("Avatar diunggah. Simpan profil untuk memakai avatar ini.");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Gagal mengunggah avatar.",
        );
      }
    });
  }

  return (
    <Card className="mx-auto max-w-3xl p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-28 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-strong)]">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={fullName} fill sizes="112px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl font-black text-[var(--teal)]">
                {fullName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--teal)]">
            <Camera className="size-4" />
            Ganti Avatar
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => uploadAvatar(event.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="text-2xl font-black">Pengaturan Profil</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Perbarui identitas akun, email, avatar, dan password.
            </p>
          </div>
          {feedback && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm">
              {feedback}
            </div>
          )}
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Nama Lengkap
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Password Saat Ini
              <input
                value={currentPassword}
                type="password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Password Baru
              <input
                value={newPassword}
                type="password"
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
              />
            </label>
          </div>
          <Button disabled={pending} onClick={submit} className="self-start">
            <Save className="size-4" />
            {pending ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
