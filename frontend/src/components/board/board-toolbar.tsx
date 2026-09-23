import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { addDays, formatRange, type BoardView } from "@/lib/dates";
import { DateJump } from "./date-jump";

function href(view: BoardView, date: string) {
  return `/?view=${view}&date=${date}`;
}

const fmt = (options: Intl.DateTimeFormatOptions, iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(new Date(`${iso}T00:00:00Z`));

const pill = "inline-flex h-10 items-center justify-center rounded-full text-[13px] font-medium transition-colors";

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
  const eyebrow = isCurrent ? (view === "day" ? "Happening today" : "This week") : view === "day" ? "Activities on" : "Week of";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow text-brand-light">{eyebrow}</p>
        {view === "day" ? (
          <h1 className="mt-2 font-headline text-4xl text-white sm:text-5xl lg:text-6xl">
            {fmt({ weekday: "long" }, date)} <span className="text-white/55">{fmt({ day: "numeric", month: "long", year: "numeric" }, date)}</span>
          </h1>
        ) : (
          <h1 className="mt-2 font-headline text-4xl text-white sm:text-5xl lg:text-6xl">{formatRange(from, to)}</h1>
        )}
      </div>

      <nav aria-label="Date navigation" className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="View" className="flex rounded-full bg-white/10 p-1">
          {(["day", "week"] as const).map((option) => (
            <Link
              key={option}
              href={href(option, date)}
              aria-current={view === option ? "page" : undefined}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-bold tracking-[0.06em] uppercase transition-colors",
                view === option ? "bg-brand text-ink" : "text-white/80 hover:text-white",
              )}
            >
              {option}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={href(view, addDays(date, -step))}
            className={cn(pill, "size-10 border border-white/30 text-white hover:border-white hover:bg-white/10")}
            aria-label={view === "day" ? "Previous day" : "Previous week"}
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={href(view, today)}
            className={cn(
              pill,
              "border px-4",
              isCurrent ? "border-white/20 text-white/50" : "border-white/30 text-white hover:border-white hover:bg-white/10",
            )}
          >
            Today
          </Link>
          <Link
            href={href(view, addDays(date, step))}
            className={cn(pill, "size-10 border border-white/30 text-white hover:border-white hover:bg-white/10")}
            aria-label={view === "day" ? "Next day" : "Next week"}
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <DateJump
          view={view}
          date={date}
          className={cn(pill, "cursor-pointer gap-2 border border-white/30 px-4 text-white hover:border-white hover:bg-white/10 [&_svg]:size-4")}
        />
      </nav>
    </div>
  );
}
