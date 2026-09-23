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
    <section aria-labelledby={`project-${project.id}`} className="flex min-w-0 flex-col">
      <header className="border-t-4 pt-4 pb-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow" style={{ color }}>
            {project.code}
          </span>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white tabular">
            {project.activities.length}
          </span>
        </div>
        <h2 id={`project-${project.id}`} className="mt-1.5 font-headline text-[26px] text-balance">
          {project.name}
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
          {project.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {project.location}
            </span>
          )}
          <span>
            {staffCount} {staffCount === 1 ? "person" : "people"} ·{" "}
            {project.activities.length} {project.activities.length === 1 ? "activity" : "activities"}
          </span>
        </p>
      </header>

      <div className="-mx-1 max-h-[72vh] overflow-y-auto px-1 pb-1 [scrollbar-width:thin]">
        {view === "day" ? (
          <ul className="space-y-3">
            {project.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </ul>
        ) : (
          <div className="space-y-5">
            {groupByDay(project.activities).map(([day, activities]) => (
              <div key={day}>
                <h3 className="sticky top-0 z-10 mb-2 flex items-center gap-2 bg-canvas py-1.5 text-xs font-black tracking-wide text-ink uppercase">
                  {formatWeekday(day)} {formatShortDate(day)}
                  {day === today && (
                    <span className="rounded-full bg-brand px-2 py-px text-[10px] text-ink">Today</span>
                  )}
                </h3>
                <ul className="space-y-3">
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
