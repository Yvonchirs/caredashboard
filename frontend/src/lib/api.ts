import "server-only";
import { cookies } from "next/headers";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "care_session";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type ApiInit = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

export async function api<T>(path: string, { body, auth = true, headers, ...init }: ApiInit = {}): Promise<T> {
  const requestHeaders = new Headers(headers);
  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) requestHeaders.set("authorization", `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    requestHeaders.set("content-type", "application/json");
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init, headers: requestHeaders, body: payload });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(message ?? res.statusText, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
