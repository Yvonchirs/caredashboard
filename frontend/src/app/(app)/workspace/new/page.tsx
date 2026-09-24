import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { todayIso } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import type { Project, StaffRef } from "@/lib/types";
import { ActivityForm } from "./activity-form";

export const metadata: Metadata = { title: "Log activity" };

export default async function NewActivityPage() {
  const user = await requireUser();
  const [projects, directory] = await Promise.all([
    api<Project[]>("/projects/mine"),
    api<StaffRef[]>("/users/directory"),
  ]);
  if (projects.length === 0) redirect("/workspace");
  const colleagues = directory.filter((person) => person.id !== user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/workspace" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-brand-dark">
        <ArrowLeft className="size-4" aria-hidden />
        My activities
      </Link>
      <p className="eyebrow mt-6 text-brand">New activity</p>
      <h1 className="mt-1 font-headline text-5xl">Log an activity</h1>
      <p className="mt-3 text-[15px] text-ink-muted">Tell colleagues what you&apos;re doing, where, and for which project.</p>
      <ActivityForm projects={projects} colleagues={colleagues} today={todayIso()} />
    </div>
  );
}
