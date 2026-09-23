import { MapPin } from "lucide-react";
import { formatShortDate, formatWeekday, type BoardView } from "@/lib/dates";
import type { Activity, DashboardProject } from "@/lib/types";
import { ActivityCard } from "./activity-card";
import { projectColor } from "./project-colors";

function groupByDay(activities: Activity[]) {
  const groups = new Map<string, Activity[]>();
  for (const activity of activities) groups.set(activity.date, [...(groups.get(activity.date) ?? []), activity]);
  return [...groups.entries()];
}

export function ProjectColumn({ project, view, today }: { project: DashboardProject; view: BoardView; today: string }) {
  const color = projectColor(project.id);
  const staffCount = new Set(project.activities.map((a) => a.author.id)).size;

  return (
    <section
      aria-labelledby={`project-${project.id}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface"
    >
      <header className="border-b border-line px-4 pt-4 pb-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
            {project.code}
          </span>
          <span className="text-xs text-ink-subtle tabular">
            {project.activities.length} {project.activities.length === 1 ? "activity" : "activities"} · {staffCount}{" "}
            {staffCount === 1 ? "person" : "people"}
          </span>
        </div>
        <h2 id={`project-${project.id}`} className="mt-2 text-[15px] leading-snug font-semibold text-balance">
          {project.name}
        </h2>
        {project.location && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-subtle">
            <MapPin className="size-3.5" aria-hidden />
            {project.location}
          </p>
        )}
      </header>

      <div className="max-h-[68vh] flex-1 overflow-y-auto bg-canvas/40 p-3 [scrollbar-width:thin]">
        {view === "day" ? (
          <ul className="space-y-2">
            {project.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </ul>
        ) : (
          <div className="space-y-4">
            {groupByDay(project.activities).map(([day, activities]) => (
              <div key={day}>
                <h3 className="sticky top-0 z-10 -mx-3 mb-2 flex items-center gap-2 bg-[#fffcf7]/95 px-3 py-1 text-xs font-semibold text-ink-muted backdrop-blur">
                  {formatWeekday(day)} {formatShortDate(day)}
                  {day === today && <span className="rounded bg-brand-50 px-1.5 py-px text-[11px] text-brand-dark">Today</span>}
                </h3>
                <ul className="space-y-2">
                  {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
