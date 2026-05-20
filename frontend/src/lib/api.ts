import "server-only";

import { cookies } from "next/headers";
import type { AdminStats, AppUser, Report } from "@/types/community-map";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

class ServerApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ServerApiError";
    this.status = status;
  }
}

async function serverRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const headers = new Headers(init?.headers);

  headers.set("Content-Type", "application/json");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ServerApiError(
      response.status,
      payload?.error?.message || "Gagal mengambil data dari backend.",
    );
  }

  return payload.data as T;
}

export async function getReports(): Promise<Report[]> {
  return serverRequest<Report[]>("/reports");
}

export async function getReportById(id: string): Promise<Report | undefined> {
  try {
    return await serverRequest<Report>(`/reports/${id}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}

export async function getMyReports(): Promise<Report[]> {
  return serverRequest<Report[]>("/reports/me");
}

export async function getCurrentUser(): Promise<AppUser> {
  const data = await serverRequest<{ user: AppUser }>("/auth/me");
  return data.user;
}

export async function safeGetCurrentUser(): Promise<AppUser | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (
      error instanceof ServerApiError &&
      [401, 403].includes(error.status)
    ) {
      return null;
    }

    throw error;
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  return serverRequest<AdminStats>("/admin/stats");
}

export { ServerApiError };
