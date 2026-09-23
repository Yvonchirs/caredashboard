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
  const extraPhotos = activity.photos.length - 3;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full rounded-lg border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong hover:bg-canvas/60"
      >
        <div className="flex items-center gap-3 text-xs text-ink-subtle">
          {activity.startTime && (
            <span className="inline-flex items-center gap-1 font-medium text-ink-muted tabular">
              <Clock className="size-3.5" aria-hidden />
              {activity.startTime}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{activity.location}</span>
          </span>
        </div>

        <p className="mt-2 text-sm leading-snug font-medium text-pretty group-hover:text-ink-800">{activity.title}</p>

        {activity.photos.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {activity.photos.slice(0, 3).map((photo, i) => (
              <div key={photo.id} className="relative size-12 overflow-hidden rounded-md bg-ink-50">
                <Image src={photo.url} alt="" fill sizes="48px" className="object-cover" />
                {i === 2 && extraPhotos > 0 && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/60 text-xs font-semibold text-white">
                    +{extraPhotos}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <span
            aria-hidden
            className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-50 text-[10px] font-semibold text-ink-muted"
          >
            {initials(activity.author.name)}
          </span>
          <span className="min-w-0 truncate text-xs">
            <span className="font-medium text-ink">{activity.author.name}</span>
            {activity.author.jobTitle && <span className="text-ink-subtle"> · {activity.author.jobTitle}</span>}
          </span>
        </div>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={activity.title}
        description={`${activity.project.name} · ${activity.project.code}`}
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
          <dt className="text-xs text-ink-subtle">Date</dt>
          <dd className="mt-0.5 font-medium">
            {formatLongDate(activity.date)}
            {activity.startTime && <span className="tabular"> · {activity.startTime}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-subtle">Location</dt>
          <dd className="mt-0.5 font-medium">{activity.location}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-subtle">Staff</dt>
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
              className="relative aspect-4/3 overflow-hidden rounded-lg bg-ink-50"
            >
              <Image src={photo.url} alt={`Photo from ${activity.title}`} fill sizes="(min-width: 768px) 240px, 50vw" className="object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
