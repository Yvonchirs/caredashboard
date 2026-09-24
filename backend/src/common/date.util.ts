export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

/**
 * Derives an activity's status from its date and optional start time — never stored, always computed.
 * Before the date: pending. On the date, from the start time (or from the start of the day when no
 * start time is set) until midnight: live. After the date: completed.
 */
export function computeActivityStatus(
  date: string,
  startTime: string | null,
  now = new Date(),
): 'pending' | 'live' | 'completed' {
  const { date: today, time: nowTime } = nowInAppTz(now);
  if (date < today) return 'completed';
  if (date > today) return 'pending';
  if (!startTime || startTime <= nowTime) return 'live';
  return 'pending';
}
