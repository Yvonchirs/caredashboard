"use client";

import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Dialog } from "@/components/dialog";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { createProject, setProjectActive, updateProject } from "@/lib/actions";
import type { FormState, Project } from "@/lib/types";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        New project
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New project">
        <ProjectForm action={createProject} onDone={() => setOpen(false)} submitLabel="Create project" />
      </Dialog>
    </>
  );
}

export function ProjectActions({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Edit ${project.name}`}>
        <Pencil aria-hidden />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => setProjectActive(project.id, !project.isActive))}
      >
        {project.isActive ? <Archive aria-hidden /> : <ArchiveRestore aria-hidden />}
        {project.isActive ? "Archive" : "Restore"}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Edit ${project.name}`}>
        <ProjectForm
          project={project}
          action={updateProject.bind(null, project.id)}
          onDone={() => setOpen(false)}
          submitLabel="Save changes"
        />
      </Dialog>
    </div>
  );
}

function ProjectForm({
  project,
  action,
  onDone,
  submitLabel,
}: {
  project?: Project;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  onDone: () => void;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result?.success) onDone();
    return result;
  }, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field label="Project name" htmlFor="name">
          <Input id="name" name="name" required minLength={2} defaultValue={project?.name} />
        </Field>
        <Field label="Code" htmlFor="code">
          <Input
            id="code"
            name="code"
            required
            pattern="[A-Za-z0-9\-]{2,12}"
            title="2–12 letters, numbers or dashes"
            className="uppercase"
            defaultValue={project?.code}
          />
        </Field>
      </div>
      <Field label="Location" htmlFor="location" optional>
        <Input id="location" name="location" placeholder="e.g. Nyamagabe District" defaultValue={project?.location ?? ""} />
      </Field>
      <Field label="Description" htmlFor="description" optional>
        <Textarea id="description" name="description" defaultValue={project?.description ?? ""} />
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
