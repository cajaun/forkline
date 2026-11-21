// days are keyed YYYY-MM-DD in local time, so an 11pm game stays on that evening's date

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (value: number) => String(value).padStart(2, '0');

export function dayKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now = new Date()): string {
  return dayKeyFromDate(now);
}

export function dateFromDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dayLabels(dayKey: string) {
  const date = dateFromDayKey(dayKey);
  const weekday = WEEKDAYS[date.getDay()];
  return {
    date: String(date.getDate()),
    monthDay: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
    shortWeekday: weekday.slice(0, 3),
    weekday,
  };
}

// every day from `firstKey` through `lastKey`, inclusive, oldest first
export function dayRange(firstKey: string, lastKey: string): string[] {
  const days: string[] = [];
  const cursor = dateFromDayKey(firstKey);
  const last = dateFromDayKey(lastKey);
  // guard against a clock that moved backwards past the first game
  if (cursor > last) return [lastKey];
  while (cursor <= last) {
    days.push(dayKeyFromDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

// whole hours (rounded up) until the next local midnight
export function hoursUntilNextDay(now = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
