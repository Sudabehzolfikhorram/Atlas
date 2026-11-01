import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export function shortDate(iso: string): string {
  return format(parseISO(iso), "MMM d");
}

export function dateTime(iso: string): string {
  return format(parseISO(iso), "MMM d, HH:mm");
}

export function relative(iso: string): string {
  return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
}

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}