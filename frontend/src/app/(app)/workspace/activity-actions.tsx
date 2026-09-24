"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Dialog } from "@/components/dialog";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { deleteActivity, updateActivity } from "@/lib/actions";
import type { Activity, FormState, Project, StaffRef } from "@/lib/types";

export function ActivityActions({
  activity,
  projects,
  colleagues,
  canEdit,
  canDelete,
}: {
  activity: Activity;
  projects: Project[];
  colleagues: StaffRef[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex shrink-0 items-start gap-0.5">
      {canEdit && (
        <Button variant="ghost" size="sm" className="px-2" onClick={() => setEditing(true)} aria-label={`Edit ${activity.title}`}>
          <Pencil className="size-4" aria-hidden />
        </Button>
      )}
      {canDelete && (
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (confirm(`Delete "${activity.title}"? This also removes its photos.`)) {
              startDelete(() => deleteActivity(activity.id));
            }
          }}
          className="rounded-lg p-2 text-ink-subtle transition-colors hover:bg-danger-50 hover:text-danger disabled:opacity-50"
          aria-label={`Delete ${activity.title}`}
        >
          <Trash2 className="size-4" />
        </button>
      )}
      {canEdit && (
        <Dialog
          open={editing}
          onClose={() => setEditing(false)}
          title="Edit activity"
          description={`${activity.project.code} · ${activity.project.name}`}
        >
          <EditActivityForm activity={activity} projects={projects} colleagues={colleagues} onDone={() => setEditing(false)} />
        </Dialog>
      )}
    </div>
  );
}

function EditActivityForm({
  activity,
  projects,
  colleagues,
  onDone,
}: {
  activity: Activity;
  projects: Project[];
  colleagues: StaffRef[];
  onDone: () => void;
}) {
  const [state, action] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await updateActivity(activity.id, prev, formData);
    if (result?.success) onDone();
    return result;
  }, undefined);
  const assigned = new Set(activity.collaborators.map((person) => person.id));

  return (
    <form action={action} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="Project" htmlFor="edit-projectId">
        <Select id="edit-projectId" name="projectId" required defaultValue={activity.project.id}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code} · {project.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="What are you doing?" htmlFor="edit-title">
        <Input id="edit-title" name="title" required minLength={3} maxLength={160} defaultValue={activity.title} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" htmlFor="edit-date">
          <Input id="edit-date" name="date" type="date" required defaultValue={activity.date} />
        </Field>
        <Field label="Start time" htmlFor="edit-startTime" optional>
          <Input id="edit-startTime" name="startTime" type="time" defaultValue={activity.startTime ?? ""} />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-ink-subtle">
        Status is set automatically: pending beforehand, live from the date and time you give until the end of that day, then
        completed.
      </p>

      <Field label="Location" htmlFor="edit-location">
        <Input id="edit-location" name="location" required minLength={2} maxLength={160} defaultValue={activity.location} />
      </Field>

      <Field label="Details" htmlFor="edit-description" optional>
        <Textarea id="edit-description" name="description" maxLength={2000} defaultValue={activity.description ?? ""} />
      </Field>

      <fieldset>
        <legend className="text-sm font-bold">
          Other staff involved <span className="font-normal text-ink-subtle">(optional)</span>
        </legend>
        {colleagues.length > 0 ? (
          <div className="mt-3 grid max-h-56 gap-1 overflow-y-auto rounded-md border border-line p-1.5 sm:grid-cols-2">
            {colleagues.map((person) => (
              <label
                key={person.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-ink-50"
              >
                <input
                  type="checkbox"
                  name="collaboratorIds"
                  value={person.id}
                  defaultChecked={assigned.has(person.id)}
                  className="mt-0.5 size-4 accent-brand"
                />
                <span className="min-w-0">
                  <span className="block leading-snug font-medium">{person.name}</span>
                  {person.jobTitle && <span className="block text-xs text-ink-subtle">{person.jobTitle}</span>}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink-subtle">No other staff accounts yet.</p>
        )}
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton pendingText="Saving">Save changes</SubmitButton>
      </div>
    </form>
  );
}
