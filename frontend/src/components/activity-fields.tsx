"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { StaffRef } from "@/lib/types";

/** From/To dates plus optional start and end times; "To" defaults to "From" for single-day activities. */
export function ScheduleFields({
  idPrefix = "",
  defaults,
}: {
  idPrefix?: string;
  defaults: { date: string; endDate?: string; startTime?: string | null; endTime?: string | null };
}) {
  const [from, setFrom] = useState(defaults.date);
  const [to, setTo] = useState(defaults.endDate ?? defaults.date);
  const multiDay = to > from;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="From" htmlFor={`${idPrefix}date`}>
          <Input
            id={`${idPrefix}date`}
            name="date"
            type="date"
            required
            value={from}
            onChange={(event) => {
              const value = event.target.value;
              setFrom(value);
              if (value && to < value) setTo(value);
            }}
          />
        </Field>
        <Field label="To" htmlFor={`${idPrefix}endDate`}>
          <Input
            id={`${idPrefix}endDate`}
            name="endDate"
            type="date"
            required
            min={from}
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </Field>
        <Field label={multiDay ? "Start time on first day" : "Start time"} htmlFor={`${idPrefix}startTime`} optional>
          <Input id={`${idPrefix}startTime`} name="startTime" type="time" defaultValue={defaults.startTime ?? ""} />
        </Field>
        <Field label={multiDay ? "End time on last day" : "End time"} htmlFor={`${idPrefix}endTime`} optional>
          <Input id={`${idPrefix}endTime`} name="endTime" type="time" defaultValue={defaults.endTime ?? ""} />
        </Field>
      </div>
      <p className="mt-2 text-xs text-ink-subtle">
        For a one-day activity, leave “To” on the same day. Status is set automatically: pending beforehand, live from the
        start until the end, then completed.
      </p>
    </div>
  );
}

/** Searchable checklist of colleagues; selections survive filtering because hidden checkboxes still submit. */
export function StaffPicker({ colleagues, initial = [] }: { colleagues: StaffRef[]; initial?: number[] }) {
  const [selected, setSelected] = useState(() => new Set(initial));
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = (person: StaffRef) =>
    !needle || person.name.toLowerCase().includes(needle) || (person.jobTitle?.toLowerCase().includes(needle) ?? false);
  const visibleCount = colleagues.filter(matches).length;
  const chosen = colleagues.filter((person) => selected.has(person.id));

  function toggle(id: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <fieldset>
      <legend className="text-sm font-bold">
        Other staff involved <span className="font-normal text-ink-subtle">(optional)</span>
      </legend>
      <p className="mt-0.5 text-xs text-ink-subtle">Tag colleagues who are also working on this activity with you.</p>

      {colleagues.length === 0 ? (
        <p className="mt-2 text-xs text-ink-subtle">No other staff accounts yet.</p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-md border border-line">
          <div className="relative border-b border-line">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
              placeholder="Search staff by name or role"
              aria-label="Search staff by name or role"
              className="h-11 w-full bg-transparent pr-3 pl-9 text-sm outline-none placeholder:text-ink-subtle focus-visible:bg-ink-50/50"
            />
          </div>

          {chosen.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 border-b border-line px-2.5 py-2" aria-label="Selected staff">
              {chosen.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => toggle(person.id, false)}
                    className="inline-flex items-center gap-1 rounded-full bg-navy py-1 pr-1.5 pl-2.5 text-xs font-bold text-white hover:bg-ink"
                    aria-label={`Remove ${person.name}`}
                  >
                    {person.name}
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid max-h-56 gap-1 overflow-y-auto p-1.5 sm:grid-cols-2">
            {colleagues.map((person) => (
              <label
                key={person.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-ink-50",
                  !matches(person) && "hidden",
                )}
              >
                <input
                  type="checkbox"
                  name="collaboratorIds"
                  value={person.id}
                  checked={selected.has(person.id)}
                  onChange={(event) => toggle(person.id, event.target.checked)}
                  className="mt-0.5 size-4 accent-brand"
                />
                <span className="min-w-0">
                  <span className="block leading-snug font-medium">{person.name}</span>
                  {person.jobTitle && <span className="block text-xs text-ink-subtle">{person.jobTitle}</span>}
                </span>
              </label>
            ))}
            {visibleCount === 0 && (
              <p className="px-2.5 py-2 text-sm text-ink-subtle sm:col-span-2">No staff match “{query.trim()}”.</p>
            )}
          </div>
        </div>
      )}
    </fieldset>
  );
}
