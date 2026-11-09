"use client";

import { Building2, CalendarClock, House, MapPin, Megaphone, TreePalm, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { formatShortDate, formatWeekday } from "@/lib/dates";
import type { DueDeadline } from "@/lib/notices";
import {
  WORK_STATUS_LABELS,
  type DashboardProject,
  type Notice,
  type WorkStatus,
  type WorkStatusCounts,
  type WorkStatusPerson,
} from "@/lib/types";
import { projectColor } from "./project-colors";

const IDLE_MS = 15_000;
const SLIDE_MS = 10_000;
/** Ignore pointer events this soon after the screensaver appears (some browsers fire one as the layer shows). */
const SETTLE_MS = 600;
const MAX_PROJECTS = 6;
const MAX_ACTIVITIES = 3;

const ICONS: Record<WorkStatus, LucideIcon> = { office: Building2, home: House, field: MapPin, leave: TreePalm };
const STATUS_ORDER: WorkStatus[] = ["office", "home", "field", "leave"];

export interface ScreensaverProps {
  eyebrow: string;
  heading: string;
  /** Show the weekday on each activity (week view). */
  showDates: boolean;
  projects: DashboardProject[];
  deadlines: DueDeadline[];
  announcements: Notice[];
  teamLabel: string;
  counts: WorkStatusCounts | null;
  /** Names behind the counts; null unless the signed-in viewer is on the access list. */
  people: WorkStatusPerson[] | null;
}

/** After a short idle, covers the board with a looping slideshow of what's on it. */
export function Screensaver(props: ScreensaverProps) {
  const { projects, deadlines, announcements, counts } = props;
  const slides = [
    projects.length > 0 && "activities",
    deadlines.length + announcements.length > 0 && "notices",
    counts && "team",
  ].filter(Boolean) as ("activities" | "notices" | "team")[];

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const shownAt = useRef(Number.NEGATIVE_INFINITY);
  // A host outside <body>, so TV mode's zoom on <body> doesn't scale the screensaver and full screen still contains it.
  const [host, setHost] = useState<HTMLElement | null>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  useEffect(
    () => () => {
      hostRef.current?.remove();
      hostRef.current = null;
    },
    [],
  );
  const enabled = slides.length > 0;

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let last = { x: -1, y: -1 };
    const wake = (event?: Event) => {
      if (event instanceof PointerEvent && event.type === "pointermove") {
        const moved = Math.hypot(event.clientX - last.x, event.clientY - last.y) > 4;
        last = { x: event.clientX, y: event.clientY };
        if (!moved) return;
      }
      if (performance.now() - shownAt.current < SETTLE_MS) return;
      setActive(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        shownAt.current = performance.now();
        if (!hostRef.current) {
          hostRef.current = document.createElement("div");
          document.documentElement.appendChild(hostRef.current);
          setHost(hostRef.current);
        }
        setIndex(0);
        setActive(true);
      }, IDLE_MS);
    };
    // Not "scroll": TV mode auto-scrolls the board, which would keep resetting the idle timer.
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    wake();
    for (const name of events) window.addEventListener(name, wake, { passive: true, capture: true });
    return () => {
      window.clearTimeout(timer);
      for (const name of events) window.removeEventListener(name, wake, { capture: true });
    };
  }, [enabled]);

  useEffect(() => {
    if (!active || slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [active, slides.length]);

  if (!active || !enabled || !host) return null;
  const slide = slides[index % slides.length];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Board screensaver" className="fixed inset-0 z-[60] flex cursor-none flex-col bg-navy font-sans text-white">
      <header className="flex items-center justify-between px-[4vw] pt-[3vh]">
        <Image src="/brand/care-logo-white.png" alt="CARE" width={104} height={34} className="h-9 w-auto" />
        <p className="text-sm font-medium tracking-wide text-white/70 uppercase">Rwanda · Activity Board</p>
      </header>

      <div key={slide} className="screensaver-slide flex min-h-0 flex-1 flex-col px-[4vw] py-[3vh]">
        {slide === "activities" && <ActivitiesSlide {...props} cycle={Math.floor(index / slides.length)} />}
        {slide === "notices" && <NoticesSlide {...props} />}
        {slide === "team" && counts && <TeamSlide {...props} counts={counts} />}
      </div>

      <footer className="flex items-center justify-between px-[4vw] pb-[3vh] text-sm text-white/60">
        <span>Move the mouse or press any key to return</span>
        <span className="flex gap-2" aria-hidden>
          {slides.map((name) => (
            <span key={name} className={cn("h-1.5 w-8 rounded-full", name === slide ? "bg-brand" : "bg-white/25")} />
          ))}
        </span>
      </footer>
    </div>,
    host,
  );
}

function SlideTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-[3vh]">
      <p className="eyebrow text-brand-light">{eyebrow}</p>
      <h2 className="mt-2 font-headline text-[clamp(2.5rem,6vw,5rem)] text-white">{title}</h2>
    </div>
  );
}

function ActivitiesSlide({ eyebrow, heading, showDates, projects, cycle }: ScreensaverProps & { cycle: number }) {
  const shown = projects.slice(0, MAX_PROJECTS);
  const hidden = projects.length - shown.length;
  return (
    <>
      <SlideTitle eyebrow={eyebrow} title={heading} />
      <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-x-[2vw] gap-y-[3vh] overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((project) => {
          const extra = project.activities.length - MAX_ACTIVITIES;
          return (
            <section key={project.id} className="border-t-4 pt-3" style={{ borderColor: projectColor(project.id) }}>
              <h3 className="font-headline text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight text-white">{project.name}</h3>
              <p className="text-sm text-white/60">
                {project.code} · {project.activities.length} {project.activities.length === 1 ? "activity" : "activities"}
              </p>
              <ul className="mt-3 space-y-2.5">
                {[...project.activities]
                  .sort((a, b) => Number(b.photos.length > 0) - Number(a.photos.length > 0))
                  .slice(0, MAX_ACTIVITIES)
                  .map((activity) => {
                    // Each loop shows the next photo of an activity that has several.
                    const photo = activity.photos.length ? activity.photos[cycle % activity.photos.length] : null;
                    return (
                      <li key={activity.id} className="flex gap-3 text-[clamp(1rem,1.5vw,1.375rem)] leading-snug">
                        {photo && (
                          <div className="relative aspect-4/3 w-[clamp(8rem,14vw,16rem)] shrink-0 self-start overflow-hidden rounded-md bg-white/10">
                            <Image src={photo.url} alt={photo.caption ?? `Photo from ${activity.title}`} fill sizes="160px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-brand-light tabular">
                            {showDates && `${formatWeekday(activity.date)} `}
                            {activity.startTime}
                          </span>{" "}
                          {activity.title}
                          <span className="block text-sm text-white/60">
                            {activity.author.name} · {activity.location}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ul>
              {extra > 0 && <p className="mt-2 text-sm text-white/60">+{extra} more</p>}
            </section>
          );
        })}
      </div>
      {hidden > 0 && <p className="pt-2 text-sm text-white/60">+{hidden} more {hidden === 1 ? "project" : "projects"} on the board</p>}
    </>
  );
}

function NoticesSlide({ deadlines, announcements }: ScreensaverProps) {
  return (
    <>
      <SlideTitle eyebrow="Coming up" title="Deadlines & announcements" />
      <div className="grid min-h-0 flex-1 content-start gap-x-[4vw] gap-y-[3vh] lg:grid-cols-2">
        {deadlines.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wide text-brand-light uppercase">
              <CalendarClock className="size-5" aria-hidden /> Deadlines
            </h3>
            <ul className="mt-4 space-y-4">
              {deadlines.slice(0, 5).map(({ notice, remaining }) => (
                <li key={`${notice.id}-${notice.date}`} className="border-l-4 border-brand pl-4">
                  <p className="text-[clamp(1.25rem,2.2vw,2rem)] leading-snug font-bold">{notice.title}</p>
                  <p className="text-[clamp(1rem,1.5vw,1.375rem)] text-white/80">
                    {remaining === 0 ? (
                      <strong className="text-brand-light">Due today</strong>
                    ) : (
                      <>
                        <strong>{remaining}</strong> {remaining === 1 ? "day" : "days"} remaining ·{" "}
                        {formatWeekday(notice.date)} {formatShortDate(notice.date)}
                      </>
                    )}
                    {notice.time && ` · ${notice.time}`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {announcements.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wide text-brand-light uppercase">
              <Megaphone className="size-5" aria-hidden /> Announcements
            </h3>
            <ul className="mt-4 space-y-4">
              {announcements.slice(0, 5).map((notice) => (
                <li key={notice.id} className="border-l-4 border-white/30 pl-4">
                  <p className="text-[clamp(1.25rem,2.2vw,2rem)] leading-snug font-bold">{notice.title}</p>
                  {notice.details && <p className="text-[clamp(1rem,1.5vw,1.375rem)] text-white/80">{notice.details}</p>}
                  <p className="text-sm text-white/60">{notice.author.name}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function TeamSlide({ teamLabel, counts, people }: ScreensaverProps & { counts: WorkStatusCounts }) {
  return (
    <>
      <SlideTitle eyebrow="Where is the team" title={teamLabel} />
      <dl className="grid grid-cols-3 gap-[2vw]">
        {(["office", "home", "field"] as const).map((status) => {
          const Icon = ICONS[status];
          return (
            <div key={status} className="flex flex-col-reverse border-l-4 border-brand pl-[1.5vw]">
              <dt className="mt-1 flex items-center gap-2 text-[clamp(0.875rem,1.5vw,1.25rem)] font-medium tracking-wide text-white/70 uppercase">
                <Icon className="size-[1.2em]" aria-hidden />
                {WORK_STATUS_LABELS[status]}
              </dt>
              <dd className="font-headline text-[clamp(4rem,11vw,9rem)] leading-none tabular">{counts[status]}</dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-[2vh] text-[clamp(1rem,1.6vw,1.5rem)] text-white/70 tabular">
        {counts.leave} on leave · {counts.notSet} not yet set
      </p>

      {people && (
        <div className="mt-[3vh] grid min-h-0 gap-x-[2vw] gap-y-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((status) => {
            const names = people.filter((person) => person.status === status).map((person) => person.name);
            if (names.length === 0) return null;
            return (
              <div key={status}>
                <p className="text-sm font-bold tracking-wide text-brand-light uppercase">
                  {WORK_STATUS_LABELS[status]} · {names.length}
                </p>
                <p className="text-[clamp(1rem,1.5vw,1.375rem)] leading-snug text-white/90">{names.join(", ")}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
