import { format, eachDayOfInterval, parseISO } from 'date-fns';

/**
 * Safely convert a value that may be a Firestore Timestamp, an ISO string, or a Date
 * into a plain Date object. Firestore Timestamps have a `.toDate()` method.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toSafeDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'string') return parseISO(value);
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date(value);
}

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
