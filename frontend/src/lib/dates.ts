export const APP_TIME_ZONE = "Africa/Kigali";
const LOCALE = "en-GB";

export type BoardView = "day" | "week";

export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(new Date());
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = parse(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return format(date);
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -((parse(iso).getUTCDay() + 6) % 7));
}

export function rangeFor(view: BoardView, date: string): { from: string; to: string } {
  if (view === "day") return { from: date, to: date };
  const from = startOfWeek(date);
  return { from, to: addDays(from, 6) };
}

export function daysInRange(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", ...options });

export const formatLongDate = (iso: string) =>
  fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parse(iso));
export const formatShortDate = (iso: string) => fmt({ day: "numeric", month: "short" }).format(parse(iso));
export const formatWeekday = (iso: string) => fmt({ weekday: "short" }).format(parse(iso));
export const formatDayNumber = (iso: string) => fmt({ day: "numeric" }).format(parse(iso));

export function formatRange(from: string, to: string): string {
  const a = parse(from);
  const b = parse(to);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  const start = fmt(sameMonth ? { day: "numeric" } : { day: "numeric", month: "short" }).format(a);
  return `${start} – ${fmt({ day: "numeric", month: "short", year: "numeric" }).format(b)}`;
}
