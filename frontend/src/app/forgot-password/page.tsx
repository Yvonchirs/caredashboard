import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" subtitle="Enter your work email and we'll send you a link to choose a new password.">
      <ForgotForm />
      <p className="mt-8 border-t border-line pt-5 text-sm text-ink-subtle">
        <Link href="/login" className="font-medium text-ink underline underline-offset-2 hover:text-brand-dark">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
