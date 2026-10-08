import { Repeat } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { addDays, formatLongDate, formatShortDate, todayIso } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { RECURRENCE_LABELS, type Notice } from "@/lib/types";
import { DeleteNoticeButton, NoticeForm } from "./notice-form";

export const metadata: Metadata = { title: "Deadlines & notices" };

export default async function NoticesPage() {
  const user = await requireUser();
  if (!user.canPostNotices) redirect("/workspace");
  const today = todayIso();
  const occurrences = await api<Notice[]>(`/notices?from=${today}&to=${addDays(today, 30)}`, { auth: false });
  // Recurring deadlines come back once per occurrence; list each once, at its next date.
  const notices = occurrences.filter((notice, index) => occurrences.findIndex((other) => other.id === notice.id) === index);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Board"
        title="Deadlines & notices"
        description="Post important deadlines and announcements. They appear in the side panel of the activity board on their date."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <NoticeForm today={today} />

        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="font-headline text-2xl">
            Coming up <span className="text-ink-subtle">· next 30 days</span>
          </h2>
          {notices.length === 0 ? (
            <p className="mt-4 rounded-md border border-line bg-surface px-5 py-8 text-center text-sm text-ink-subtle">
              Nothing posted yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
              {notices.map((notice) => (
                <li key={notice.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={notice.kind === "deadline" ? "brand" : "ink"}>
                        {notice.kind === "deadline" ? "Deadline" : "Announcement"}
                      </Badge>
                      <span className="text-xs font-bold text-ink-muted tabular">
                        {formatLongDate(notice.date)}
                        {notice.time && ` · due ${notice.time}`}
                      </span>
                      {notice.recurrence && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
                          <Repeat className="size-3.5" aria-hidden />
                          {RECURRENCE_LABELS[notice.recurrence]}
                          {notice.recurUntil && ` until ${formatShortDate(notice.recurUntil)}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-bold">{notice.title}</p>
                    {notice.details && <p className="mt-0.5 text-sm text-ink-muted">{notice.details}</p>}
                    <p className="mt-1 text-xs text-ink-subtle">Posted by {notice.author.name}</p>
                  </div>
                  {(user.role === "admin" || notice.author.id === user.id) && (
                    <DeleteNoticeButton id={notice.id} title={notice.title} recurring={notice.recurrence !== null} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
