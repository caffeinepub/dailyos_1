/**
 * Local date utilities to avoid timezone issues.
 * All dates are handled as local YYYY-MM-DD strings without UTC conversion.
 */

/**
 * Formats a Date object to local YYYY-MM-DD string
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string to a Date object at local midnight
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets today's date as local YYYY-MM-DD string
 */
export function getTodayLocal(): string {
  return formatLocalDate(new Date());
}

/**
 * Adds days to a local date string and returns new local date string
 */
export function addDaysLocal(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Generates an array of local date strings for a range
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  
  while (current <= endDate) {
    dates.push(current);
    current = addDaysLocal(current, 1);
  }
  
  return dates;
}

/**
 * Gets the last N days including today as local date strings
 */
export function getLastNDays(n: number): string[] {
  const today = getTodayLocal();
  const dates: string[] = [];
  
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDaysLocal(today, -i));
  }
  
  return dates;
}

/**
 * Gets all dates in the current local month as YYYY-MM-DD strings
 */
export function getCurrentMonthDates(): string[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(formatLocalDate(date));
  }
  
  return dates;
}

/**
 * Gets the first day of the month for a given date string
 */
export function getFirstDayOfMonth(dateStr: string): Date {
  const date = parseLocalDate(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Gets all dates in a given month as YYYY-MM-DD strings
 */
export function getMonthDates(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(formatLocalDate(date));
  }
  
  return dates;
}

/**
 * Validates if a string is a valid YYYY-MM-DD date format
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = parseLocalDate(dateStr);
  return !isNaN(date.getTime());
}
