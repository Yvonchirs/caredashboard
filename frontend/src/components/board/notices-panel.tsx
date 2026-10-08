import { CalendarClock, Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { daysBetween, formatShortDate, formatWeekday } from "@/lib/dates";
import { RECURRENCE_LABELS, type Notice } from "@/lib/types";

/** Deadlines start showing this many days before they are due (matches the API). */
const DEADLINE_LEAD_DAYS = 5;

export function NoticesPanel({
  notices,
  showDates,
  referenceDate,
  canPost,
}: {
  notices: Notice[];
  showDates: boolean;
  /** Day the deadline countdown is measured from. */
  referenceDate: string;
  canPost: boolean;
}) {
  const deadlines = notices
    .map((notice) => ({ notice, remaining: daysBetween(referenceDate, notice.date) }))
    .filter(({ notice, remaining }) => notice.kind === "deadline" && remaining >= 0 && remaining <= DEADLINE_LEAD_DAYS);
  const announcements = notices.filter((notice) => notice.kind === "announcement");

  return (
    <aside aria-labelledby="notices-heading" className="border-t-4 border-brand bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 id="notices-heading" className="font-headline text-2xl">
          {showDates ? "This week" : "Today"}
          <span className="block font-sans text-xs font-bold tracking-wide text-ink-subtle uppercase">
            Deadlines &amp; announcements
          </span>
        </h2>
        {canPost && (
          <Link
            href="/notices"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-ink hover:bg-brand-light"
            aria-label="Post a deadline or announcement"
            title="Post a deadline or announcement"
          >
            <Plus className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {deadlines.length + announcements.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-subtle">
          No deadlines or announcements {showDates ? "this week" : "today"}.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {deadlines.length > 0 && (
            <NoticeGroup label="Deadlines" icon={<CalendarClock className="size-4" aria-hidden />}>
              {deadlines.map(({ notice, remaining }) => (
                <NoticeItem key={`${notice.id}-${notice.date}`} notice={notice} showDate={showDates} remaining={remaining} />
              ))}
            </NoticeGroup>
          )}
          {announcements.length > 0 && (
            <NoticeGroup label="Announcements" icon={<Megaphone className="size-4" aria-hidden />}>
              {announcements.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} showDate={showDates} />
              ))}
            </NoticeGroup>
          )}
        </div>
      )}
    </aside>
  );
}

function NoticeGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4">
      <h3 className="flex items-center gap-2 text-xs font-black tracking-wide text-brand-dark uppercase">
        {icon}
        {label}
      </h3>
      <ul className="mt-3 space-y-3.5">{children}</ul>
    </section>
  );
}

function NoticeItem({ notice, showDate, remaining }: { notice: Notice; showDate: boolean; remaining?: number }) {
  const isDeadline = remaining !== undefined;
  const when = [
    (showDate || (isDeadline && remaining > 0)) && `${formatWeekday(notice.date)} ${formatShortDate(notice.date)}`,
    notice.time && `${isDeadline ? "due " : ""}${notice.time}`,
    notice.recurrence && RECURRENCE_LABELS[notice.recurrence].toLowerCase(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={isDeadline && remaining === 0 ? "border-l-2 border-brand pl-3" : "border-l-2 border-line-strong pl-3"}>
      <p className="text-[15px] leading-snug font-bold text-pretty">{notice.title}</p>
      {isDeadline && (
        <p className="mt-0.5 text-sm text-ink">
          {remaining === 0 ? (
            <strong className="font-black text-brand-dark">Due today</strong>
          ) : (
            <>
              <strong className="font-black">
                {remaining} {remaining === 1 ? "day" : "days"}
              </strong>{" "}
              remaining
            </>
          )}
        </p>
      )}
      {when && <p className="mt-0.5 text-xs text-ink-subtle tabular">{when}</p>}
      {notice.details && <p className="mt-0.5 text-sm text-ink-muted text-pretty">{notice.details}</p>}
      <p className="mt-1 text-xs text-ink-subtle">{notice.author.name}</p>
    </li>
  );
}
