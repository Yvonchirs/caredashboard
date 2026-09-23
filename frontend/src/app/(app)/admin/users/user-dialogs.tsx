"use client";

import { Check, Copy, EllipsisVertical, KeyRound, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Dialog } from "@/components/dialog";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import { createUser, resetUserPassword, setUserActive, updateUser } from "@/lib/actions";
import type { FormState, Project, User } from "@/lib/types";

export function NewUserButton({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <>
      <Button
        onClick={() => {
          setKey((k) => k + 1);
          setOpen(true);
        }}
      >
        <Plus aria-hidden />
        New user
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New user" description="They'll set their own password when they first sign in.">
        <CreateUserForm key={key} projects={projects} onClose={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

function CreateUserForm({ projects, onClose }: { projects: Project[]; onClose: () => void }) {
  const [state, action] = useActionState(createUser, undefined);

  if (state?.secret) {
    return <SecretResult message={state.success} secret={state.secret} onClose={onClose} />;
  }
  return (
    <form action={action} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <UserFields projects={projects} />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton pendingText="Creating…">Create user</SubmitButton>
      </div>
    </form>
  );
}

function UserFields({ user, projects, isSelf }: { user?: User; projects: Project[]; isSelf?: boolean }) {
  const [role, setRole] = useState(user?.role ?? "staff");
  const assigned = new Set(user?.projects.map((p) => p.id));

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" required minLength={2} defaultValue={user?.name} autoComplete="off" />
        </Field>
        <Field label="Job title" htmlFor="jobTitle" optional>
          <Input id="jobTitle" name="jobTitle" defaultValue={user?.jobTitle ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Work email" htmlFor="email">
          <Input id="email" name="email" type="email" required defaultValue={user?.email} autoComplete="off" />
        </Field>
        <Field label="Role" htmlFor="role" hint={isSelf ? "You can't change your own role." : undefined}>
          <Select
            id="role"
            name="role"
            value={role}
            disabled={isSelf}
            onChange={(event) => setRole(event.target.value as User["role"])}
          >
            <option value="staff">Staff: logs activities</option>
            <option value="admin">Admin: full access</option>
          </Select>
          {isSelf && <input type="hidden" name="role" value={role} />}
        </Field>
      </div>

      <fieldset>
        <legend className="text-[13px] font-medium">Project access</legend>
        <p className="mt-0.5 text-xs text-ink-subtle">
          {role === "admin" ? "Admins can log activities for every project." : "Projects this person can log activities for."}
        </p>
        <div className="mt-3 grid max-h-56 gap-1 overflow-y-auto rounded-lg border border-line p-1.5 sm:grid-cols-2">
          {projects.map((project) => (
            <label
              key={project.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-ink-50 has-disabled:cursor-default has-disabled:opacity-60"
            >
              <input
                type="checkbox"
                name="projectIds"
                value={project.id}
                defaultChecked={assigned.has(project.id)}
                disabled={role === "admin"}
                className="mt-0.5 size-4 accent-ink"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-ink-muted">{project.code}</span>
                <span className="block leading-snug">{project.name}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

export function UserActions({ user, projects, isSelf }: { user: User; projects: Project[]; isSelf: boolean }) {
  const [dialog, setDialog] = useState<"edit" | "reset" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<FormState>();
  const [pending, startTransition] = useTransition();
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !menu.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  const toggleActive = () =>
    startTransition(async () => {
      setMenuOpen(false);
      const verb = user.isActive ? "Deactivate" : "Activate";
      if (!confirm(`${verb} ${user.name}?`)) return;
      const result = await setUserActive(user.id, !user.isActive);
      if (result?.error) setNotice(result);
    });

  const item = "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-ink-50 [&_svg]:size-4";

  return (
    <div className="relative inline-flex justify-end gap-1" ref={menu}>
      <Button variant="ghost" size="sm" onClick={() => setDialog("edit")}>
        <Pencil aria-hidden />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={`More actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        className="px-2"
      >
        <EllipsisVertical aria-hidden />
      </Button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-52 rounded-lg border border-line-strong bg-surface p-1 text-left shadow-lg shadow-ink/10"
        >
          <button
            role="menuitem"
            className={item}
            onClick={() => {
              setMenuOpen(false);
              setDialog("reset");
            }}
          >
            <KeyRound aria-hidden />
            Reset password
          </button>
          {!isSelf && (
            <button role="menuitem" className={`${item} ${user.isActive ? "text-danger hover:bg-danger-50" : ""}`} onClick={toggleActive}>
              {user.isActive ? <UserX aria-hidden /> : <UserCheck aria-hidden />}
              {user.isActive ? "Deactivate account" : "Activate account"}
            </button>
          )}
        </div>
      )}

      {notice?.error && (
        <Dialog open onClose={() => setNotice(undefined)} title="Couldn't update user">
          <Alert tone="error">{notice.error}</Alert>
        </Dialog>
      )}

      <Dialog open={dialog === "edit"} onClose={() => setDialog(null)} title={`Edit ${user.name}`}>
        <EditUserForm user={user} projects={projects} isSelf={isSelf} onClose={() => setDialog(null)} />
      </Dialog>

      <Dialog open={dialog === "reset"} onClose={() => setDialog(null)} title="Reset password">
        <ResetPassword user={user} onClose={() => setDialog(null)} />
      </Dialog>
    </div>
  );
}

function EditUserForm({ user, projects, isSelf, onClose }: { user: User; projects: Project[]; isSelf: boolean; onClose: () => void }) {
  const [state, action] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await updateUser(user.id, prev, formData);
    if (result?.success) onClose();
    return result;
  }, undefined);

  return (
    <form action={action} className="space-y-5 text-left">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <UserFields user={user} projects={projects} isSelf={isSelf} />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}

function ResetPassword({ user, onClose }: { user: User; onClose: () => void }) {
  const [state, action] = useActionState(() => resetUserPassword(user.id), undefined);

  if (state?.secret) {
    return <SecretResult message={`Password reset for ${user.name}.`} secret={state.secret} onClose={onClose} />;
  }
  return (
    <form action={action} className="space-y-5 text-left">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <p className="text-sm text-ink-muted">
        This creates a one-time password for <span className="font-medium text-ink">{user.name}</span>. Their current
        password stops working immediately and they&apos;ll choose a new one at next sign-in.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton pendingText="Resetting…">Reset password</SubmitButton>
      </div>
    </form>
  );
}

function SecretResult({ message, secret, onClose }: { message?: string; secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-5 text-left">
      <Alert tone="success">{message}</Alert>
      <div>
        <p className="text-[13px] font-medium">One-time password</p>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-line-strong bg-canvas px-3 py-2">
          <code className="flex-1 font-mono text-base tracking-wider select-all">{secret}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(secret);
              setCopied(true);
            }}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-subtle">
          Share it securely. It won&apos;t be shown again, and they must change it when they sign in.
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
