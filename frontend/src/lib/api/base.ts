/** Client-side: use relative path so requests go through Next.js rewrites (same origin as the cookie). */
export const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Server-side (RSC / Route Handler): talk to the backend directly.
 * Gunakan fungsi (bukan konstanta) agar process.env dibaca saat runtime,
 * bukan di-inline oleh webpack saat build time.
 */
export function getServerApiBaseUrl(): string {
  // Bracket notation mencegah webpack DefinePlugin meng-inline nilai ini
  // saat build time — nilai dibaca dari environment Lambda saat request.
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const url = process.env["INTERNAL_API_URL"] || process.env.INTERNAL_API_URL;
  return url ? `${url}/api` : "http://127.0.0.1:4000/api";
}

type ErrorFactory<TError extends Error> = (
  status: number,
  message: string,
  code?: string,
  details?: unknown,
  requestId?: string | null,
) => TError;

export async function readApiResponse<T, TError extends Error>(
  response: Response,
  createError: ErrorFactory<TError>,
  defaultMessage: string,
): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorPayload = payload?.error || {};
    throw createError(
      response.status,
      errorPayload.message || defaultMessage,
      errorPayload.code,
      errorPayload.details,
      errorPayload.requestId || response.headers.get("x-request-id"),
    );
  }

  return payload.data as T;
}

export function isNetworkError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  const causeMessage =
    cause instanceof Error
      ? cause.message
      : typeof cause === "string"
        ? cause
        : "";
  const message = [error.message, causeMessage].filter(Boolean).join(" ");

  return /fetch failed|failed to fetch|econnrefused|enotfound|ehostunreach|socket/i.test(
    message,
  );
}
