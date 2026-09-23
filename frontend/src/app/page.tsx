import { CalendarX2, Plus } from "lucide-react";
import Link from "next/link";
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
      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <BoardToolbar view={view} date={date} from={from} to={to} today={today} />

        {!data ? (
          <EmptyState title="The board is unavailable" body="We couldn't reach the activity service. Please try again in a moment." />
        ) : (
          <>
            {view === "week" && <WeekStrip data={data} today={today} />}
            <StatsStrip stats={data.stats} />

            {data.projects.length === 0 ? (
              <EmptyState
                title={view === "day" ? "No activities logged for this day" : "No activities logged this week"}
                body="When staff log their field activities, they'll appear here grouped by project."
                action={
                  user && (
                    <Link href="/workspace/new" className={buttonStyles()}>
                      <Plus aria-hidden />
                      Log an activity
                    </Link>
                  )
                }
              />
            ) : (
              <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data.projects.map((project) => (
                  <ProjectColumn key={project.id} project={project} view={view} today={today} />
                ))}
              </div>
            )}

            <AutoRefresh />
          </>
        )}
      </main>
    </>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <CalendarX2 className="size-8 text-ink-subtle" aria-hidden />
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-muted text-pretty">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
