import type { AppUser, Report, ReportStatus } from "@/types/community-map";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export class ClientApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
  }
}

async function clientRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ClientApiError(
      response.status,
      payload?.error?.message || "Gagal memproses permintaan.",
    );
  }

  return payload.data as T;
}

export async function login(input: {
  email: string;
  password: string;
}) {
  return clientRequest<{ user: AppUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(input: {
  fullName: string;
  email: string;
  password: string;
  role: AppUser["role"];
}) {
  return clientRequest<{ user: AppUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout() {
  return clientRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function createReport(input: {
  categorySlug: Report["categorySlug"];
  title: string;
  description: string;
  address: string;
  district?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  imageAlt?: string;
  storageKey?: string;
}) {
  return clientRequest<Report>("/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function upvoteReport(id: string) {
  return clientRequest<Report>(`/reports/${id}/upvote`, {
    method: "POST",
  });
}

export async function removeUpvote(id: string) {
  return clientRequest<Report>(`/reports/${id}/upvote`, {
    method: "DELETE",
  });
}

export async function verifyReport(id: string, note?: string) {
  return clientRequest<Report>(`/admin/reports/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export async function updateReportStatus(id: string, nextStatus: ReportStatus) {
  return clientRequest<Report>(`/admin/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      nextStatus,
      note: "Status diperbarui dari dashboard admin.",
    }),
  });
}
