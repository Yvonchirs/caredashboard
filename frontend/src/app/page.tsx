import { ArrowRight, CalendarX2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AutoRefresh } from "@/components/board/auto-refresh";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { ProjectColumn } from "@/components/board/project-column";
import { StatsStrip } from "@/components/board/stats-strip";
import { WeekStrip } from "@/components/board/week-strip";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui";
import { api } from "@/lib/api";
import { isIsoDate, rangeFor, todayIso, type BoardView } from "@/lib/dates";
import { getCurrentUser } from "@/lib/session";
import type { Dashboard } from "@/lib/types";

export default async function BoardPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const today = todayIso();
  const view: BoardView = params.view === "week" ? "week" : "day";
  const date = isIsoDate(params.date) ? params.date : today;
  const { from, to } = rangeFor(view, date);

  const [data, user] = await Promise.all([
    api<Dashboard>(`/dashboard?from=${from}&to=${to}`, { auth: false }).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <>
      <SiteHeader user={user} />

      <section className="bg-navy">
        <div className="mx-auto max-w-[1600px] space-y-8 px-4 pt-8 pb-9 sm:px-6 lg:px-10 lg:pt-10">
          <BoardToolbar view={view} date={date} from={from} to={to} today={today} />
          {data && view === "week" && <WeekStrip data={data} today={today} />}
          {data && <StatsStrip stats={data.stats} />}
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-10 sm:px-6 lg:px-10">
        {!data ? (
          <EmptyState title="The board is unavailable" body="We couldn't reach the activity service. Please try again in a moment." />
        ) : data.projects.length === 0 ? (
          <EmptyState
            title={view === "day" ? "Nothing logged for this day" : "Nothing logged this week"}
            body="When staff log their field activities, they'll appear here grouped by project."
            action={
              user && (
                <Link href="/workspace/new" className={buttonStyles()}>
                  Log an activity
                  <ArrowRight aria-hidden />
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-10">
            <div className="grid items-start gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
              {data.projects.map((project) => (
                <ProjectColumn key={project.id} project={project} view={view} today={today} />
              ))}
            </div>
            <AutoRefresh />
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border-t-4 border-brand bg-surface px-6 py-16 text-center">
      <CalendarX2 className="size-9 text-brand" aria-hidden />
      <h2 className="mt-4 font-headline text-3xl">{title}</h2>
      <p className="mt-2 max-w-md text-[15px] text-ink-muted text-pretty">{body}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
