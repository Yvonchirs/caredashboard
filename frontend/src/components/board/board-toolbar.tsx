import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { addDays, formatLongDate, formatRange, type BoardView } from "@/lib/dates";
import { buttonStyles } from "../ui";
import { DateJump } from "./date-jump";

function href(view: BoardView, date: string) {
  return `/?view=${view}&date=${date}`;
}

export function BoardToolbar({
  view,
  date,
  from,
  to,
  today,
}: {
  view: BoardView;
  date: string;
  from: string;
  to: string;
  today: string;
}) {
  const step = view === "day" ? 1 : 7;
  const isCurrent = today >= from && today <= to;
  const heading = view === "day" ? formatLongDate(date) : `Week of ${formatRange(from, to)}`;
  const eyebrow = isCurrent ? (view === "day" ? "Today" : "This week") : view === "day" ? "Day view" : "Week view";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className={cn("text-[13px] font-semibold tracking-wide uppercase", isCurrent ? "text-brand-dark" : "text-ink-subtle")}>
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-[28px]">{heading}</h1>
      </div>

      <nav aria-label="Date navigation" className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="View" className="flex rounded-lg border border-line-strong bg-surface p-0.5">
          {(["day", "week"] as const).map((option) => (
            <Link
              key={option}
              href={href(option, date)}
              aria-current={view === option ? "page" : undefined}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                view === option ? "bg-ink text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {option}
            </Link>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-line-strong bg-surface">
          <Link
            href={href(view, addDays(date, -step))}
            className="rounded-l-lg p-2 text-ink-muted hover:bg-ink-50 hover:text-ink"
            aria-label={view === "day" ? "Previous day" : "Previous week"}
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={href(view, today)}
            className="border-x border-line px-3 py-1.5 text-[13px] font-medium hover:bg-ink-50"
            aria-disabled={isCurrent || undefined}
          >
            Today
          </Link>
          <Link
            href={href(view, addDays(date, step))}
            className="rounded-r-lg p-2 text-ink-muted hover:bg-ink-50 hover:text-ink"
            aria-label={view === "day" ? "Next day" : "Next week"}
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <DateJump view={view} date={date} className={buttonStyles({ variant: "secondary", size: "sm" })} />
      </nav>
    </div>
  );
}
