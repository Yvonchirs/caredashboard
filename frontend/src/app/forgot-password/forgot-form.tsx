"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { requestPasswordReset } from "@/lib/actions";

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state?.success) {
    return (
      <div className="mt-8">
        <Alert tone="success">{state.success}</Alert>
      </div>
    );
  }
  return (
    <form action={action} className="mt-8 space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Work email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <SubmitButton className="w-full" pendingText="Sending">
        Send reset link
      </SubmitButton>
    </form>
  );
}
