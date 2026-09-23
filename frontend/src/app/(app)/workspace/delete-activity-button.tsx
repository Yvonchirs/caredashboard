"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteActivity } from "@/lib/actions";

export function DeleteActivityButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete "${title}"? This also removes its photos.`)) startTransition(() => deleteActivity(id));
      }}
      className="self-start rounded-lg p-2 text-ink-subtle transition-colors hover:bg-danger-50 hover:text-danger disabled:opacity-50"
      aria-label={`Delete ${title}`}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
