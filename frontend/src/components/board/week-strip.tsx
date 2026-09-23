import Link from "next/link";
import { cn } from "@/lib/cn";
import { daysInRange, formatDayNumber, formatWeekday } from "@/lib/dates";
import type { Dashboard } from "@/lib/types";

export function WeekStrip({ data, today }: { data: Dashboard; today: string }) {
  const counts = new Map<string, number>();
  for (const project of data.projects) {
    for (const activity of project.activities) counts.set(activity.date, (counts.get(activity.date) ?? 0) + 1);
  }
  const max = Math.max(1, ...counts.values());

  return (
    <nav aria-label="Days in this week" className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-line bg-line">
      {daysInRange(data.from, data.to).map((day) => {
        const count = counts.get(day) ?? 0;
        return (
          <Link
            key={day}
            href={`/?view=day&date=${day}`}
            className="group bg-surface px-2 py-3 text-center transition-colors hover:bg-canvas sm:px-3 sm:text-left"
          >
            <span className={cn("block text-xs font-medium", day === today ? "text-brand-dark" : "text-ink-subtle")}>
              {formatWeekday(day)}
            </span>
            <span className="mt-0.5 block text-lg font-semibold tabular">{formatDayNumber(day)}</span>
            <span className="mt-2 hidden h-1 overflow-hidden rounded-full bg-ink-50 sm:block">
              <span
                className={cn("block h-full rounded-full", day === today ? "bg-brand" : "bg-ink-200 group-hover:bg-ink-muted")}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="mt-1.5 block text-[11px] text-ink-subtle tabular">
              {count} <span className="hidden sm:inline">{count === 1 ? "activity" : "activities"}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
