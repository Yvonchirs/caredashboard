"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useRef, useState, useTransition } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { createNotice, deleteNotice } from "@/lib/actions";
import { cn } from "@/lib/cn";
import type { NoticeKind, NoticeRecurrence } from "@/lib/types";

const KINDS: { value: NoticeKind; label: string; hint: string }[] = [
  { value: "deadline", label: "Deadline", hint: "Something due on a date" },
  { value: "announcement", label: "Announcement", hint: "News everyone should see" },
];

function ordinalDay(iso: string) {
  const day = Number(iso.slice(8, 10)) || 1;
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suffix}`;
}

export function NoticeForm({ today }: { today: string }) {
  const [kind, setKind] = useState<NoticeKind>("deadline");
  const [recurrence, setRecurrence] = useState<NoticeRecurrence | "">("");
  const [dueDate, setDueDate] = useState(today);
  const form = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(async (prev: Parameters<typeof createNotice>[0], formData: FormData) => {
    const result = await createNotice(prev, formData);
    if (result?.success) {
      form.current?.reset();
      setRecurrence("");
      setDueDate(today);
    }
    return result;
  }, undefined);

  return (
    <form ref={form} action={action} className="space-y-5 border-t-4 border-navy bg-surface p-5 sm:p-7">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      <fieldset>
        <legend className="text-sm font-bold">Type</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {KINDS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-md border-2 px-3.5 py-2.5 transition-colors",
                kind === option.value ? "border-navy bg-navy/5" : "border-line hover:border-ink-subtle",
              )}
            >
              <input
                type="radio"
                name="kind"
                value={option.value}
                checked={kind === option.value}
                onChange={() => setKind(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="block text-xs text-ink-subtle">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Title" htmlFor="notice-title">
        <Input
          id="notice-title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          placeholder={kind === "deadline" ? "e.g. Q3 narrative reports due" : "e.g. All-staff meeting moved to Friday"}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={kind === "deadline" ? "Due date" : "Show on"}
          htmlFor="notice-date"
          hint={
            kind === "deadline"
              ? (recurrence ? "Repeats start from this date. " : "") + "Shown on the board from 5 days before, with a countdown."
              : undefined
          }
        >
          <Input
            id="notice-date"
            name="date"
            type="date"
            required
            min={today}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </Field>
        {kind === "deadline" && (
          <Field label="Due time" htmlFor="notice-time" optional>
            <Input id="notice-time" name="time" type="time" />
          </Field>
        )}
      </div>

      {kind === "deadline" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Repeats" htmlFor="notice-recurrence">
            <Select
              id="notice-recurrence"
              name="recurrence"
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value as NoticeRecurrence | "")}
            >
              <option value="">Does not repeat</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month on the {ordinalDay(dueDate)}</option>
              <option value="month-end">Every month on the last day</option>
              <option value="mid-and-month-end">Twice a month: the 15th and the last day</option>
              <option value="quarterly">Every 3 months</option>
              <option value="yearly">Every year</option>
            </Select>
          </Field>
          {recurrence && (
            <Field label="Repeat until" htmlFor="notice-recurUntil" optional hint="Leave empty to keep repeating.">
              <Input id="notice-recurUntil" name="recurUntil" type="date" min={dueDate} />
            </Field>
          )}
        </div>
      )}

      <Field label="Details" htmlFor="notice-details" optional>
        <Textarea id="notice-details" name="details" maxLength={1000} placeholder="Where to send it, who it concerns…" />
      </Field>

      <div className="flex justify-end border-t border-line pt-5">
        <SubmitButton pendingText="Posting">Post {kind}</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteNoticeButton({ id, title, recurring }: { id: number; title: string; recurring: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Remove “${title}”`}
      className="px-2 hover:bg-danger-50 hover:text-danger"
      onClick={() =>
        startTransition(async () => {
          if (confirm(recurring ? `Remove “${title}” and all its repeats?` : `Remove “${title}”?`)) await deleteNotice(id);
        })
      }
    >
      <Trash2 aria-hidden />
    </Button>
  );
}
