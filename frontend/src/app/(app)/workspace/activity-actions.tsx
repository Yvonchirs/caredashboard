"use client";

import { Camera, ClipboardCheck, FileDown, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Dialog } from "@/components/dialog";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, buttonStyles, Field, Input, Select, Textarea } from "@/components/ui";
import { addActivityPhotos, deleteActivity, setActivityOutcome, updateActivity } from "@/lib/actions";
import { cn } from "@/lib/cn";
import type { Activity, FormState, Project, StaffRef } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;

export function ActivityActions({
  activity,
  projects,
  colleagues,
  canEdit,
  canDelete,
  canAddPhotos,
  canSetOutcome,
  canDownloadReport,
}: {
  activity: Activity;
  projects: Project[];
  colleagues: StaffRef[];
  canEdit: boolean;
  canDelete: boolean;
  canAddPhotos: boolean;
  canSetOutcome: boolean;
  canDownloadReport: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [addingPhotos, setAddingPhotos] = useState(false);
  const [settingOutcome, setSettingOutcome] = useState(false);
  const [deleting, startDelete] = useTransition();

  if (!canEdit && !canDelete && !canAddPhotos && !canSetOutcome && !canDownloadReport) return null;

  return (
    <div className="flex shrink-0 items-start gap-0.5">
      {canAddPhotos && (
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setAddingPhotos(true)}
          aria-label={`Add photos to ${activity.title}`}
        >
          <Camera className="size-4" aria-hidden />
        </Button>
      )}
      {canSetOutcome && (
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setSettingOutcome(true)}
          aria-label={`Record outcome for ${activity.title}`}
        >
          <ClipboardCheck className="size-4" aria-hidden />
        </Button>
      )}
      {canDownloadReport && (
        <a
          href={`/reports/activities/${activity.id}`}
          className={cn(buttonStyles({ variant: "ghost", size: "sm" }), "px-2")}
          aria-label={`Download PDF report for ${activity.title}`}
        >
          <FileDown className="size-4" aria-hidden />
        </a>
      )}
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
      {canAddPhotos && (
        <Dialog
          open={addingPhotos}
          onClose={() => setAddingPhotos(false)}
          title="Add photos"
          description={`${activity.title} · ${activity.project.code}`}
        >
          <AddPhotosForm activity={activity} onDone={() => setAddingPhotos(false)} />
        </Dialog>
      )}
      {canSetOutcome && (
        <Dialog
          open={settingOutcome}
          onClose={() => setSettingOutcome(false)}
          title="Record outcome"
          description={`${activity.title} · ${activity.project.code}`}
        >
          <OutcomeForm activity={activity} onDone={() => setSettingOutcome(false)} />
        </Dialog>
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

function OutcomeForm({ activity, onDone }: { activity: Activity; onDone: () => void }) {
  const [state, action] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await setActivityOutcome(activity.id, prev, formData);
    if (result?.success) onDone();
    return result;
  }, undefined);

  return (
    <form action={action} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="What came out of this activity?" htmlFor="outcome" hint="A few sentences on results, numbers reached, or next steps">
        <Textarea
          id="outcome"
          name="outcome"
          required
          minLength={3}
          maxLength={2000}
          defaultValue={activity.outcome ?? ""}
          placeholder="e.g. 28 participants attended; 4 new savings groups formed."
          autoFocus
        />
      </Field>
      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton pendingText="Saving">Save outcome</SubmitButton>
      </div>
    </form>
  );
}

function AddPhotosForm({ activity, onDone }: { activity: Activity; onDone: () => void }) {
  const remaining = MAX_PHOTOS - activity.photos.length;
  const [state, action] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await addActivityPhotos(activity.id, prev, formData);
    if (result?.success) onDone();
    return result;
  }, undefined);
  const [photos, setPhotos] = useState<{ file: File; url: string; caption: string }[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef(photos);

  useEffect(() => {
    latest.current = photos;
    if (!input.current) return;
    const transfer = new DataTransfer();
    photos.forEach((photo) => transfer.items.add(photo.file));
    input.current.files = transfer.files;
  }, [photos]);

  useEffect(() => () => latest.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  function removePhoto(photo: { file: File; url: string; caption: string }) {
    URL.revokeObjectURL(photo.url);
    setPhotos((current) => current.filter((p) => p !== photo));
  }

  function setCaption(photo: { file: File; url: string; caption: string }, caption: string) {
    setPhotos((current) => current.map((p) => (p === photo ? { ...p, caption } : p)));
  }

  function addPhotos(files: FileList | null) {
    const incoming = [...(files ?? [])];
    const tooBig = incoming.some((file) => file.size > MAX_BYTES);
    const accepted = incoming.filter((file) => file.size <= MAX_BYTES).slice(0, remaining - photos.length);
    setPhotoError(
      tooBig ? "Photos must be 5 MB or smaller." : incoming.length > accepted.length ? `You can add up to ${remaining} more photos.` : undefined,
    );
    setPhotos((current) => [...current, ...accepted.map((file) => ({ file, url: URL.createObjectURL(file), caption: "" }))]);
  }

  if (remaining <= 0) {
    return (
      <div className="space-y-5">
        <Alert tone="error">This activity already has the maximum of {MAX_PHOTOS} photos.</Alert>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onDone}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <p className="text-sm text-ink-muted">
        Post photos showing how the activity is going. You can add up to {remaining} more ({activity.photos.length}/{MAX_PHOTOS} so
        far).
      </p>

      <input
        ref={input}
        id="update-photos"
        name="photos"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => addPhotos(event.target.files)}
      />
      <div className="space-y-2">
        {photos.map((photo, i) => (
          <div key={photo.url} className="flex items-center gap-3 rounded-md border border-line bg-canvas/40 p-2">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-ink-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={photo.url} alt={`Selected photo ${i + 1}`} className="size-full object-cover" />
            </div>
            <Input
              name="captions"
              value={photo.caption}
              onChange={(event) => setCaption(photo, event.target.value)}
              maxLength={160}
              placeholder="Add a short caption (optional)"
              aria-label={`Caption for photo ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removePhoto(photo)}
              className="shrink-0 rounded-full p-1.5 text-ink-subtle hover:bg-danger-50 hover:text-danger"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {photos.length < remaining && (
          <label
            htmlFor="update-photos"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-line-strong text-sm font-bold text-ink-subtle transition-colors hover:border-brand hover:text-brand-dark"
          >
            <ImagePlus className="size-4" aria-hidden />
            Add photo
          </label>
        )}
      </div>
      <p className="text-xs text-ink-subtle">JPEG, PNG or WebP, 5 MB max each.</p>
      {photoError && <p className="text-xs text-danger">{photoError}</p>}

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton pendingText="Uploading">Add photos</SubmitButton>
      </div>
    </form>
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

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Date" htmlFor="edit-date">
          <Input id="edit-date" name="date" type="date" required defaultValue={activity.date} />
        </Field>
        <Field label="Start time" htmlFor="edit-startTime" optional>
          <Input id="edit-startTime" name="startTime" type="time" defaultValue={activity.startTime ?? ""} />
        </Field>
        <Field label="End time" htmlFor="edit-endTime" optional>
          <Input id="edit-endTime" name="endTime" type="time" defaultValue={activity.endTime ?? ""} />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-ink-subtle">
        Status is set automatically: pending beforehand, live from the start time (or from midnight if none is given) until the
        end time (or midnight if none is given), then completed.
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
