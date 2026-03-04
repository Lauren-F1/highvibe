import { format, eachDayOfInterval } from 'date-fns';

/**
 * Check if a space is available for an entire date range (no blocked dates overlap).
 * blockedDates should be ISO strings in yyyy-MM-dd format.
 */
export function isAvailableForRange(
  blockedDates: string[],
  startDate: Date,
  endDate: Date
): boolean {
  if (!blockedDates.length) return true;
  const blockedSet = new Set(blockedDates);
  const requestedDates = eachDayOfInterval({ start: startDate, end: endDate });
  return requestedDates.every(d => !blockedSet.has(format(d, 'yyyy-MM-dd')));
}
