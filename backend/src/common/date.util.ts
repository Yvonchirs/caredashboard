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
