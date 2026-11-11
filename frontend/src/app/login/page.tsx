import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Alert } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, reset } = await searchParams;
  if (await getCurrentUser().catch(() => null)) redirect("/workspace");

  return (
    <AuthShell title="Sign in" subtitle="Log your field activities and manage projects.">
      {reset && (
        <div className="mt-6">
          <Alert tone="success">Your password has been updated. Sign in with it below.</Alert>
        </div>
      )}
      <LoginForm next={typeof next === "string" ? next : ""} />
      <p className="mt-8 border-t border-line pt-5 text-sm text-ink-subtle">
        Forgot your password? Ask a system administrator to reset it for you.
      </p>
    </AuthShell>
  );
}
