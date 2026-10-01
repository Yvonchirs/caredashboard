"use client";

import { ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Alert, buttonStyles, Field, Input, Select, Textarea } from "@/components/ui";
import { createActivity } from "@/lib/actions";
import type { Project, StaffRef } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;

export function ActivityForm({
  projects,
  colleagues,
  today,
}: {
  projects: Project[];
  colleagues: StaffRef[];
  today: string;
}) {
  const [state, action] = useActionState(createActivity, undefined);
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
    const accepted = incoming.filter((file) => file.size <= MAX_BYTES).slice(0, MAX_PHOTOS - photos.length);
    setPhotoError(
      tooBig ? "Photos must be 5 MB or smaller." : incoming.length > accepted.length ? `You can add up to ${MAX_PHOTOS} photos.` : undefined,
    );
    setPhotos((current) => [...current, ...accepted.map((file) => ({ file, url: URL.createObjectURL(file), caption: "" }))]);
  }

  return (
    <form action={action} className="mt-8 space-y-6 border-t-4 border-navy bg-surface p-5 sm:p-8">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="Project" htmlFor="projectId">
        <Select id="projectId" name="projectId" required defaultValue={projects.length === 1 ? projects[0].id : ""}>
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code} · {project.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="What are you doing?" htmlFor="title">
        <Input id="title" name="title" required minLength={3} maxLength={160} placeholder="e.g. VSLA share-out meeting" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" required defaultValue={today} />
        </Field>
        <Field label="Start time" htmlFor="startTime" optional>
          <Input id="startTime" name="startTime" type="time" />
        </Field>
        <Field label="End time" htmlFor="endTime" optional>
          <Input id="endTime" name="endTime" type="time" />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-ink-subtle">
        Status is set automatically: pending beforehand, live from the start time (or from midnight if none is given) until the
        end time (or midnight if none is given), then completed.
      </p>

      <Field label="Location" htmlFor="location" hint="Village, sector or district">
        <Input id="location" name="location" required minLength={2} maxLength={160} placeholder="e.g. Kitabi Sector, Nyamagabe" />
      </Field>

      <Field label="Details" htmlFor="description" optional>
        <Textarea id="description" name="description" maxLength={2000} placeholder="Who is involved, objectives, expected outcomes…" />
      </Field>

      <fieldset>
        <legend className="text-sm font-bold">
          Other staff involved <span className="font-normal text-ink-subtle">(optional)</span>
        </legend>
        <p className="mt-0.5 text-xs text-ink-subtle">Tag colleagues who are also working on this activity with you.</p>
        {colleagues.length > 0 ? (
          <div className="mt-3 grid max-h-56 gap-1 overflow-y-auto rounded-md border border-line p-1.5 sm:grid-cols-2">
            {colleagues.map((person) => (
              <label
                key={person.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-ink-50"
              >
                <input type="checkbox" name="collaboratorIds" value={person.id} className="mt-0.5 size-4 accent-brand" />
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

      <fieldset>
        <legend className="text-sm font-bold">
          Photos <span className="font-normal text-ink-subtle">(optional, up to {MAX_PHOTOS})</span>
        </legend>
        <input
          ref={input}
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => addPhotos(event.target.files)}
        />
        <div className="mt-2 space-y-2">
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
          {photos.length < MAX_PHOTOS && (
            <label
              htmlFor="photos"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-line-strong text-sm font-bold text-ink-subtle transition-colors hover:border-brand hover:text-brand-dark"
            >
              <ImagePlus className="size-4" aria-hidden />
              Add photo
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-subtle">JPEG, PNG or WebP, 5 MB max each.</p>
        {photoError && <p className="mt-1 text-xs text-danger">{photoError}</p>}
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Link href="/workspace" className={buttonStyles({ variant: "secondary" })}>
          Cancel
        </Link>
        <SubmitButton pendingText="Saving">Log activity</SubmitButton>
      </div>
    </form>
  );
}
