const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

// a clock that moved backwards past the first game yields today alone
export function dayRange(firstKey: string, lastKey: string): string[] {
  const days: string[] = [];
  const cursor = dateFromDayKey(firstKey);
  const last = dateFromDayKey(lastKey);
  if (cursor > last) return [lastKey];
  while (cursor <= last) {
    days.push(dayKeyFromDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

// minutes and seconds with hours once a game runs past an hour
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
