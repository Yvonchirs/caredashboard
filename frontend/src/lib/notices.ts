import { daysBetween } from "./dates";
import type { Notice } from "./types";

/** Deadlines start showing this many days before they are due (matches the API). */
export const DEADLINE_LEAD_DAYS = 5;

export type DueDeadline = { notice: Notice; remaining: number };

/** Splits notices into the deadlines due soon (with days remaining) and the announcements. */
export function splitNotices(notices: Notice[], referenceDate: string) {
  const deadlines: DueDeadline[] = notices
    .map((notice) => ({ notice, remaining: daysBetween(referenceDate, notice.date) }))
    .filter(({ notice, remaining }) => notice.kind === "deadline" && remaining >= 0 && remaining <= DEADLINE_LEAD_DAYS);
  const announcements = notices.filter((notice) => notice.kind === "announcement");
  return { deadlines, announcements };
}
