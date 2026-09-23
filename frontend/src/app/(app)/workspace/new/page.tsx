import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { todayIso } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import type { Project } from "@/lib/types";
import { ActivityForm } from "./activity-form";

export const metadata: Metadata = { title: "Log activity" };

export default async function NewActivityPage() {
  await requireUser();
  const projects = await api<Project[]>("/projects/mine");
  if (projects.length === 0) redirect("/workspace");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/workspace" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        My activities
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Log an activity</h1>
      <p className="mt-1 text-sm text-ink-muted">Tell colleagues what you&apos;re doing, where, and for which project.</p>
      <ActivityForm projects={projects} today={todayIso()} />
    </div>
  );
}
