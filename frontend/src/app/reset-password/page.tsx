import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Alert } from "@/components/ui";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;

  return (
    <AuthShell title="Choose a password" subtitle="Pick a password of at least 8 characters to finish.">
      {typeof token === "string" && token ? (
        <ResetForm token={token} />
      ) : (
        <div className="mt-8 space-y-5">
          <Alert tone="error">This link is incomplete. Open it again from your email, or request a new one.</Alert>
          <Link href="/forgot-password" className="text-sm font-medium underline underline-offset-2">
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
