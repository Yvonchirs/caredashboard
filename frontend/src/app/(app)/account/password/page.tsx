import type { Metadata } from "next";
import { Alert } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Change password" };

export default async function PasswordPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        {user?.mustChangePassword ? "Choose a new password" : "Change password"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Use at least 8 characters. Avoid passwords you use elsewhere.</p>
      {user?.mustChangePassword && (
        <div className="mt-6">
          <Alert tone="success">You signed in with a one-time password. Set your own password to continue.</Alert>
        </div>
      )}
      <PasswordForm />
    </div>
  );
}
