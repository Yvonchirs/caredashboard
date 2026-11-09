import { Building2, ChevronLeft, ChevronRight, House, MapPin, TreePalm, Undo2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { setWorkStatus } from "@/lib/actions";
import { formatShortDate, formatWeekday, stepWorkday } from "@/lib/dates";
import {
  WORK_STATUS_LABELS,
  type MyWorkStatusDay,
  type WorkStatus,
  type WorkStatusCounts,
  type WorkStatusPerson,
} from "@/lib/types";

const ICONS: Record<WorkStatus, LucideIcon> = { office: Building2, home: House, field: MapPin, leave: TreePalm };
const HEADLINE: WorkStatus[] = ["office", "home", "field"];
const navButton =
  "inline-flex size-9 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink";
const OPTIONS: WorkStatus[] = ["office", "home", "field", "leave"];

export function WorkStatusPanel({
  counts,
  isToday,
  today,
  people,
  plan,
}: {
  counts: WorkStatusCounts;
  isToday: boolean;
  today: string;
  /** Names behind the counts; null unless the viewer is on the access list. */
  people: WorkStatusPerson[] | null;
  /** The signed-in user's own choices for the coming days; null for visitors. */
  plan: MyWorkStatusDay[] | null;
}) {
  return (
    <section aria-labelledby="work-status-heading" className="border-t-4 border-brand bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 id="work-status-heading" className="font-headline text-2xl">
          Where is the team
          <span className="block font-sans text-xs font-bold tracking-wide text-ink-subtle uppercase">
            Staff working {isToday ? "today" : `on ${formatWeekday(counts.date)} ${formatShortDate(counts.date)}`}
          </span>
        </h2>
        <nav aria-label="Team day" className="flex shrink-0 items-center gap-1">
          {!isToday && (
            <Link href={`/?view=day&date=${today}`} className={cn(navButton, "mr-1 w-auto gap-1.5 px-3 text-[13px] font-medium")}>
              <Undo2 className="size-3.5" aria-hidden />
              Today
            </Link>
          )}
          <Link href={`/?view=day&date=${stepWorkday(counts.date, -1)}`} className={navButton} aria-label="Previous working day" title="Previous working day">
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
          <Link href={`/?view=day&date=${stepWorkday(counts.date, 1)}`} className={navButton} aria-label="Next working day" title="Next working day">
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </nav>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line">
        {HEADLINE.map((status) => {
          const Icon = ICONS[status];
          return (
            <div key={status} className="flex flex-col-reverse items-start px-4 py-4">
              <dt className="mt-1 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-subtle uppercase">
                <Icon className="size-3.5 text-brand-dark" aria-hidden />
                {WORK_STATUS_LABELS[status]}
              </dt>
              <dd className="font-headline text-4xl tabular">{counts[status]}</dd>
            </div>
          );
        })}
      </dl>
      <p className="border-t border-line px-5 py-3 text-xs text-ink-subtle tabular">
        {counts.leave} on leave · {counts.notSet} not yet set
      </p>

      {people && <PeopleList people={people} />}
      {plan && <Planner plan={plan} today={today} viewing={counts.date} />}
    </section>
  );
}

function PeopleList({ people }: { people: WorkStatusPerson[] }) {
  const groups = [...OPTIONS, null].map((status) => ({
    status,
    names: people.filter((person) => person.status === status).map((person) => person.name),
  }));

  return (
    <div className="space-y-3.5 border-t border-line px-5 py-4">
      <h3 className="text-xs font-black tracking-wide text-brand-dark uppercase">Who is where</h3>
      {groups
        .filter((group) => group.names.length > 0)
        .map(({ status, names }) => {
          const Icon = status ? ICONS[status] : null;
          return (
            <div key={status ?? "unset"}>
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink-subtle uppercase">
                {Icon && <Icon className="size-3.5" aria-hidden />}
                {status ? WORK_STATUS_LABELS[status] : "Not yet set"} · {names.length}
              </p>
              <p className="mt-0.5 text-sm text-pretty">{names.join(", ")}</p>
            </div>
          );
        })}
    </div>
  );
}

function Planner({ plan, today, viewing }: { plan: MyWorkStatusDay[]; today: string; viewing: string }) {
  return (
    <div className="border-t border-line px-5 py-4">
      <h3 className="text-xs font-black tracking-wide text-brand-dark uppercase">Where will you work?</h3>
      <ul className="mt-2 divide-y divide-line">
        {plan.map(({ date, status }) => (
          <li key={date}>
            <form action={setWorkStatus} className="flex items-center justify-between gap-2 py-2">
              <input type="hidden" name="date" value={date} />
              <input type="hidden" name="current" value={status ?? ""} />
              <Link
                href={`/?view=day&date=${date}`}
                aria-current={date === viewing ? "date" : undefined}
                className={cn("text-sm hover:underline", date === viewing ? "font-black" : "font-medium")}
              >
                {date === today ? "Today" : `${formatWeekday(date)} ${formatShortDate(date)}`}
              </Link>
              <div role="group" aria-label={`Work status for ${date}`} className="flex gap-1">
                {OPTIONS.map((option) => {
                  const Icon = ICONS[option];
                  const active = status === option;
                  return (
                    <button
                      key={option}
                      type="submit"
                      name="status"
                      value={option}
                      aria-pressed={active}
                      aria-label={WORK_STATUS_LABELS[option]}
                      title={WORK_STATUS_LABELS[option]}
                      className={cn(
                        "inline-flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors",
                        active ? "border-brand bg-brand text-ink" : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-subtle">Select a choice again to clear it. Pick a day&apos;s name to see the team that day.</p>
    </div>
  );
}
