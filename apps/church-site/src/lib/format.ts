export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function formatServiceTime(startTime: string) {
  const [hRaw, mRaw] = startTime.split(':');
  const hours = Number(hRaw);
  const minutes = Number(mRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return startTime;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatMeetingDay(day: number | null | undefined) {
  if (day == null || day < 0 || day > 6) return null;
  return DAY_LABELS[day] ?? null;
}
