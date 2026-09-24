import { Camera, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Badge, buttonStyles, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { addDays, formatRange, formatShortDate, formatWeekday, isIsoDate, rangeFor, todayIso } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import type { Activity } from "@/lib/types";
import { DeleteActivityButton } from "./delete-activity-button";

export const metadata: Metadata = { title: "My activities" };

export default async function WorkspacePage({ searchParams }: PageProps<"/workspace">) {
  const user = await requireUser();
  const params = await searchParams;
  const today = todayIso();
  const date = isIsoDate(params.date) ? params.date : today;
  const { from, to } = rangeFor("week", date);
  const activities = await api<Activity[]>(`/activities/mine?from=${from}&to=${to}`);
  const canLog = user.role === "admin" || user.projects.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="My activities"
        description={`Welcome back, ${user.name.split(" ")[0]}. Activities you log appear on the public board straight away.`}
        actions={
          canLog && (
            <Link href="/workspace/new" className={buttonStyles()}>
              Log activity
              <Plus aria-hidden />
            </Link>
          )
        }
      />

      {params.created && <Alert tone="success">Activity logged. It&apos;s now visible on the board.</Alert>}
      {!canLog && (
        <Alert tone="error">
          You aren&apos;t assigned to any project yet. Ask an administrator to give you access to your projects.
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-headline text-2xl">Week of {formatRange(from, to)}</h2>
        <div className="flex items-center overflow-hidden rounded-full border-2 border-ink/80">
          <Link
            href={`/workspace?date=${addDays(from, -7)}`}
            className="p-2 text-ink hover:bg-ink-50"
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link href="/workspace" className="border-x-2 border-ink/80 px-4 py-1.5 text-[13px] font-bold hover:bg-ink-50">
            This week
          </Link>
          <Link
            href={`/workspace?date=${addDays(from, 7)}`}
            className="p-2 text-ink hover:bg-ink-50"
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="border-t-4 border-brand bg-surface px-6 py-12 text-center">
          <p className="font-headline text-2xl">Nothing logged for this week</p>
          <p className="mt-1 text-sm text-ink-muted">Log what you&apos;re working on so colleagues can see it.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-4 px-4 py-4 sm:px-5">
              <div className="w-12 shrink-0 text-center">
                <p className={activity.date === today ? "text-xs font-black text-brand uppercase" : "text-xs font-bold text-ink-subtle uppercase"}>
                  {formatWeekday(activity.date)}
                </p>
                <p className="font-headline text-lg tabular">{formatShortDate(activity.date)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{activity.project.code}</Badge>
                    <p className="text-[15px] font-bold">{activity.title}</p>
                  </div>
                  <StatusBadge status={activity.status} />
                </div>
                <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-subtle">
                  {activity.startTime && (
                    <span className="inline-flex items-center gap-1 tabular">
                      <Clock className="size-3.5" aria-hidden />
                      {activity.startTime}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {activity.location}
                  </span>
                  {activity.photos.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Camera className="size-3.5" aria-hidden />
                      {activity.photos.length} {activity.photos.length === 1 ? "photo" : "photos"}
                    </span>
                  )}
                  {activity.author.id === user.id
                    ? activity.collaborators.length > 0 && (
                        <span>With {activity.collaborators.map((person) => person.name).join(", ")}</span>
                      )
                    : <span>Logged by {activity.author.name}</span>}
                </p>
              </div>
              {(activity.author.id === user.id || user.role === "admin") && (
                <DeleteActivityButton id={activity.id} title={activity.title} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
