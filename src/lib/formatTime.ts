/**
 * Human-readable date/time formatting utilities for Tutr.
 */

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Returns "Today at 9 am", "Yesterday at 2 pm", "Tuesday at 3 pm",
 * "Monday at 11 am", etc.
 */
export function formatNatural(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "";

  const now = new Date();
  const todayStart = startOfDay(now);
  const dateStart = startOfDay(date);
  const diffDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hours = date.getHours();
  const ampm = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${hour12} ${ampm}`;

  let dayLabel: string;
  if (diffDays === 0) {
    dayLabel = "Today";
  } else if (diffDays === 1) {
    dayLabel = "Yesterday";
  } else {
    dayLabel = DAY_NAMES[date.getDay()];
  }

  return `${dayLabel} at ${timeStr}`;
}

/**
 * Returns "Apr 14" or "Apr 14, 2025" if not current year.
 */
export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "";

  const now = new Date();
  const month = MONTH_ABBR[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  if (year !== now.getFullYear()) {
    return `${month} ${day}, ${year}`;
  }
  return `${month} ${day}`;
}

/**
 * Returns "3:00 PM".
 */
export function formatTimeOnly(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minuteStr = minutes.toString().padStart(2, "0");

  return `${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Returns "2 minutes ago", "1 hour ago", "yesterday", "3 days ago", "Apr 14".
 */
export function formatRelative(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatShortDate(dateStr);
  }
}
