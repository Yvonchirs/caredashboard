"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, errorMessage, SESSION_COOKIE } from "./api";
import type { FormState, User } from "./types";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const ids = (formData: FormData, key: string) => formData.getAll(key).map(Number);

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  let result: { accessToken: string; user: User };
  try {
    result = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: { email: text(formData, "email"), password: String(formData.get("password") ?? "") },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  (await cookies()).set(SESSION_COOKIE, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });

  const next = text(formData, "next");
  if (result.user.mustChangePassword) redirect("/account/password");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/workspace");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== formData.get("confirmPassword")) return { error: "The new passwords don't match." };
  try {
    await api("/auth/change-password", {
      method: "POST",
      body: { currentPassword: String(formData.get("currentPassword") ?? ""), newPassword },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  redirect("/workspace");
}

export async function createActivity(_state: FormState, formData: FormData): Promise<FormState> {
  const payload = new FormData();
  for (const key of ["title", "description", "date", "startTime", "location", "projectId", "status"]) {
    const value = text(formData, key);
    if (value) payload.set(key, value);
  }
  for (const id of ids(formData, "collaboratorIds")) payload.append("collaboratorIds[]", String(id));
  for (const photo of formData.getAll("photos")) {
    if (photo instanceof File && photo.size > 0) payload.append("photos", photo);
  }

  try {
    await api("/activities", { method: "POST", body: payload });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/", "layout");
  redirect(`/workspace?date=${text(formData, "date")}&created=1`);
}

export async function deleteActivity(id: number) {
  await api(`/activities/${id}`, { method: "DELETE" });
  revalidatePath("/", "layout");
}

function projectBody(formData: FormData) {
  return {
    name: text(formData, "name"),
    code: text(formData, "code"),
    location: text(formData, "location"),
    description: text(formData, "description"),
  };
}

export async function createProject(_state: FormState, formData: FormData): Promise<FormState> {
  try {
    await api("/projects", { method: "POST", body: projectBody(formData) });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/admin/projects");
  return { success: "Project created." };
}

export async function updateProject(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/projects/${id}`, { method: "PATCH", body: projectBody(formData) });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/admin/projects");
  return { success: "Project updated." };
}

export async function setProjectActive(id: number, isActive: boolean) {
  await api(`/projects/${id}`, { method: "PATCH", body: { isActive } });
  revalidatePath("/", "layout");
}

function userBody(formData: FormData) {
  return {
    name: text(formData, "name"),
    email: text(formData, "email"),
    jobTitle: text(formData, "jobTitle"),
    role: text(formData, "role"),
    projectIds: ids(formData, "projectIds"),
  };
}

export async function createUser(_state: FormState, formData: FormData): Promise<FormState> {
  try {
    const { temporaryPassword } = await api<{ temporaryPassword: string }>("/users", {
      method: "POST",
      body: userBody(formData),
    });
    revalidatePath("/admin/users");
    return { success: `Account created for ${text(formData, "name")}.`, secret: temporaryPassword };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function updateUser(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/users/${id}`, { method: "PATCH", body: userBody(formData) });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/admin/users");
  return { success: "User updated." };
}

export async function setUserActive(id: number, isActive: boolean): Promise<FormState> {
  try {
    await api(`/users/${id}`, { method: "PATCH", body: { isActive } });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/admin/users");
  return { success: isActive ? "User activated." : "User deactivated." };
}

export async function resetUserPassword(id: number): Promise<FormState> {
  try {
    const { temporaryPassword } = await api<{ temporaryPassword: string }>(`/users/${id}/reset-password`, {
      method: "POST",
    });
    revalidatePath("/admin/users");
    return { success: "Password reset.", secret: temporaryPassword };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
