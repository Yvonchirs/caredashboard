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
    <nav aria-label="Days in this week" className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {daysInRange(data.from, data.to).map((day) => {
        const count = counts.get(day) ?? 0;
        const isToday = day === today;
        return (
          <Link
            key={day}
            href={`/?view=day&date=${day}`}
            aria-label={`${formatWeekday(day)} ${formatDayNumber(day)}: ${count} ${count === 1 ? "activity" : "activities"}`}
            className={cn(
              "group rounded-md px-2 py-3 text-center transition-colors sm:px-3 sm:text-left",
              isToday ? "bg-white text-ink" : "bg-white/5 text-white hover:bg-white/12",
            )}
          >
            <span className={cn("block text-xs font-bold uppercase", isToday ? "text-brand" : "text-white/60")}>
              {formatWeekday(day)}
            </span>
            <span className="mt-0.5 block font-headline text-2xl tabular sm:text-3xl">{formatDayNumber(day)}</span>
            <span className={cn("mt-2 hidden h-1 overflow-hidden rounded-full sm:block", isToday ? "bg-ink-100" : "bg-white/10")}>
              <span className="block h-full rounded-full bg-brand" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className={cn("mt-1.5 block text-[11px] tabular", isToday ? "text-ink-muted" : "text-white/60")}>
              {count}
              <span className="hidden sm:inline"> {count === 1 ? "activity" : "activities"}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
