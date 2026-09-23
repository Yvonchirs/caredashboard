import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiError } from "./api";
import type { User } from "./types";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    return await api<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/account/password");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/workspace");
  return user;
}
