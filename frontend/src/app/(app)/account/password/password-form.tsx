"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { changePassword } from "@/lib/actions";

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="mt-8 space-y-5 rounded-xl border border-line bg-surface p-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Current password" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" htmlFor="newPassword">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <SubmitButton className="w-full" pendingText="Saving…">
        Update password
      </SubmitButton>
    </form>
  );
}
