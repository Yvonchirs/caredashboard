export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_ACTIVITY_DAYS = 31;

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export const APP_TIME_ZONE = 'Africa/Kigali';

const nowFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function nowInAppTz(now = new Date()): { date: string; time: string } {
  const parts = Object.fromEntries(nowFormatter.formatToParts(now).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export interface ActivitySchedule {
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

/**
 * Derives an activity's status from its schedule — never stored, always computed.
 * It is live from the start time on the first day (or that day's midnight when no start time is set)
 * until the end time on the last day (or midnight when no end time is set); pending before, completed after.
 */
export function computeActivityStatus(
  { date, endDate, startTime, endTime }: ActivitySchedule,
  now = new Date(),
): 'pending' | 'live' | 'completed' {
  const { date: today, time: nowTime } = nowInAppTz(now);
  const lastDay = endDate ?? date;
  if (today < date || (today === date && startTime && nowTime < startTime)) return 'pending';
  if (today > lastDay || (today === lastDay && endTime && nowTime > endTime)) return 'completed';
  return 'live';
}

const RECURRENCE_MONTHS = { monthly: 1, quarterly: 3, yearly: 12 } as const;

/** Adds months, keeping the day of month but clamping to the month's last day (31 Jan + 1 month = 28/29 Feb). */
function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const lastDay = new Date(y, m - 1 + months + 1, 0).getDate();
  return toIsoDate(new Date(y, m - 1 + months, Math.min(d, lastDay)));
}

function lastDayOfMonth(year: number, month: number): string {
  return toIsoDate(new Date(year, month, 0));
}

/** Dates of a repeating event that fall within [from, to], starting at `start` and ending at `until`. */
export function occurrencesBetween(
  start: string,
  recurrence: 'weekly' | 'month-end' | 'mid-and-month-end' | keyof typeof RECURRENCE_MONTHS,
  from: string,
  to: string,
  until: string | null = null,
): string[] {
  const last = until && until < to ? until : to;
  const dates: string[] = [];
  if (recurrence === 'month-end' || recurrence === 'mid-and-month-end') {
    const first = start > from ? start : from;
    let [year, month] = first.split('-').map(Number);
    for (let monthStart = `${first.slice(0, 7)}-01`; monthStart <= last; ) {
      const candidates = recurrence === 'month-end' ? [] : [`${monthStart.slice(0, 7)}-15`];
      candidates.push(lastDayOfMonth(year, month));
      for (const date of candidates) if (date >= first && date <= last) dates.push(date);
      [year, month] = month === 12 ? [year + 1, 1] : [year, month + 1];
      monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    }
    return dates;
  }
  if (recurrence === 'weekly') {
    let n = Math.max(0, Math.floor(daysBetween(start, from) / 7));
    for (let date = addDays(start, n * 7); date <= last; date = addDays(start, ++n * 7)) {
      if (date >= from) dates.push(date);
    }
    return dates;
  }
  const step = RECURRENCE_MONTHS[recurrence];
  const [sy, sm] = start.split('-').map(Number);
  const [fy, fm] = from.split('-').map(Number);
  let n = Math.max(0, Math.floor(((fy - sy) * 12 + (fm - sm)) / step) - 1);
  for (let date = addMonths(start, n * step); date <= last; date = addMonths(start, ++n * step)) {
    if (date >= from) dates.push(date);
  }
  return dates;
}
