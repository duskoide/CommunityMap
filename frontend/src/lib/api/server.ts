import "server-only";

import { cookies } from "next/headers";
import type { AdminStats, AppUser, Report } from "@/types/community-map";
import { SERVER_API_BASE_URL, isNetworkError, readApiResponse } from "./base";

function shouldUseDevFallback(error: unknown) {
  return isNetworkError(error);
}

export class ServerApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string | null;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
    requestId?: string | null,
  ) {
    super(message);
    this.name = "ServerApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
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

  const response = await fetch(`${SERVER_API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  return readApiResponse(
    response,
    (status, message, code, details, requestId) =>
      new ServerApiError(status, message, code, details, requestId),
    "Gagal mengambil data dari backend.",
  );
}

function logDevFallback(path: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[server-api] ${path} memakai fallback data dev karena backend tidak bisa diakses: ${message}`,
  );
}

export async function getReports(params?: {
  referenceCode?: string;
  category?: string;
  status?: string;
  sort?: string;
  district?: string;
  search?: string;
  dateRange?: string;
  reporterId?: string;
}): Promise<Report[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          searchParams.append(key, value);
        }
      }
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/reports?${queryString}` : "/reports";
    const response = await serverRequest<Report[]>(endpoint);
    return response || [];
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      logDevFallback("/reports", error);
      return [];
    }

    throw error;
  }
}

export async function getAdminReports(): Promise<Report[]> {
  try {
    return await serverRequest<Report[]>("/admin/reports");
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      logDevFallback("/admin/reports", error);
      return [];
    }

    throw error;
  }
}

export async function getAdminReportById(id: string): Promise<Report | undefined> {
  try {
    return await serverRequest<Report>(`/admin/reports/${id}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return undefined;
    }

    if (shouldUseDevFallback(error)) {
      logDevFallback(`/admin/reports/${id}`, error);
      return undefined;
    }

    throw error;
  }
}

export async function getReportById(id: string): Promise<Report | undefined> {
  try {
    return await serverRequest<Report>(`/reports/${id}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return undefined;
    }

    if (shouldUseDevFallback(error)) {
      logDevFallback(`/reports/${id}`, error);
      return undefined;
    }

    throw error;
  }
}

export async function getMyReports(): Promise<Report[]> {
  try {
    return await serverRequest<Report[]>("/reports/me");
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      logDevFallback("/reports/me", error);
      return [];
    }

    throw error;
  }
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

    // Di development, kembalikan null saat backend belum jalan (network error).
    // Di production, lempar error agar muncul di log — jangan diam-diam return null,
    // karena itu menyebabkan semua user tampak "belum login" padahal backend tidak terjangkau.
    if (shouldUseDevFallback(error) && process.env.NODE_ENV !== "production") {
      logDevFallback("/auth/me", error);
      return null;
    }

    throw error;
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    return await serverRequest<AdminStats>("/admin/stats");
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      logDevFallback("/admin/stats", error);
      return {
        totalReports: 0,
        newReports: 0,
        verifiedReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        upvotes: 0,
        downvotes: 0,
      };
    }

    throw error;
  }
}

export async function getUserByUsername(username: string): Promise<AppUser | null> {
  try {
    const data = await serverRequest<{ user: AppUser }>(`/users/${username}`);
    return data.user;
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
