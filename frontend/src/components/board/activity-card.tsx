"use client";

import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatLongDate } from "@/lib/dates";
import type { Activity } from "@/lib/types";
import { Dialog } from "../dialog";

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ActivityCard({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false);

  const [cover, ...rest] = activity.photos;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full overflow-hidden rounded-md border border-line bg-surface text-left transition-colors hover:border-ink-subtle"
      >
        {cover && (
          <div className="relative aspect-16/9 overflow-hidden bg-ink-100">
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            {rest.length > 0 && (
              <span className="absolute right-2 bottom-2 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-bold text-white">
                +{rest.length} {rest.length === 1 ? "photo" : "photos"}
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-3 text-xs">
            {activity.startTime && (
              <span className="inline-flex items-center gap-1 font-bold text-brand-dark tabular">
                <Clock className="size-3.5" aria-hidden />
                {activity.startTime}
              </span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1 text-ink-subtle">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{activity.location}</span>
            </span>
          </div>

          <p className="mt-2 text-[15px] leading-snug font-bold text-pretty group-hover:underline group-hover:decoration-brand group-hover:decoration-2 group-hover:underline-offset-4">
            {activity.title}
          </p>

          <div className="mt-3.5 flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-bold tracking-wide text-white"
            >
              {initials(activity.author.name)}
            </span>
            <span className="min-w-0 text-xs leading-tight">
              <span className="block truncate font-bold text-ink">{activity.author.name}</span>
              {activity.author.jobTitle && <span className="block truncate text-ink-subtle">{activity.author.jobTitle}</span>}
            </span>
          </div>
        </div>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={activity.title}
        description={`${activity.project.code} · ${activity.project.name}`}
        size={activity.photos.length ? "lg" : "md"}
      >
        <ActivityDetails activity={activity} />
      </Dialog>
    </li>
  );
}

function ActivityDetails({ activity }: { activity: Activity }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-bold tracking-wide text-ink-subtle uppercase">Date</dt>
          <dd className="mt-0.5 font-medium">
            {formatLongDate(activity.date)}
            {activity.startTime && <span className="tabular"> · {activity.startTime}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wide text-ink-subtle uppercase">Location</dt>
          <dd className="mt-0.5 font-medium">{activity.location}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wide text-ink-subtle uppercase">Staff</dt>
          <dd className="mt-0.5 font-medium">
            {activity.author.name}
            {activity.author.jobTitle && <span className="block text-xs font-normal text-ink-muted">{activity.author.jobTitle}</span>}
          </dd>
        </div>
      </dl>

      {activity.description && <p className="text-sm leading-relaxed text-ink-muted whitespace-pre-line">{activity.description}</p>}

      {activity.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {activity.photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-4/3 overflow-hidden rounded-md bg-ink-50"
            >
              <Image src={photo.url} alt={`Photo from ${activity.title}`} fill sizes="(min-width: 768px) 240px, 50vw" className="object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
