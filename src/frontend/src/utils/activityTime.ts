/**
 * Shared utilities for parsing and sorting activities by time-of-day
 */

/**
 * Parse HH:MM time string to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get a comparable sort key for an activity based on its time
 * Returns the start time in minutes, or -1 if no valid time
 */
export function getActivityTimeSortKey(activity: { startTime?: string }): number {
  if (!activity.startTime) return -1;
  return parseTimeToMinutes(activity.startTime);
}

/**
 * Comparator for sorting activities by time-of-day (descending - later times first)
 * Activities without times are sorted to the end
 */
export function compareActivitiesByTimeDesc<T extends { startTime?: string }>(a: T, b: T): number {
  const aTime = getActivityTimeSortKey(a);
  const bTime = getActivityTimeSortKey(b);
  
  // Activities without times go to the end
  if (aTime === -1 && bTime === -1) return 0;
  if (aTime === -1) return 1;
  if (bTime === -1) return -1;
  
  // Sort descending (later times first)
  return bTime - aTime;
}
