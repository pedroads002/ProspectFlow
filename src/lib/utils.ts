import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Start (inclusive) and end (exclusive) of the calendar day containing `date`,
 * in the server's local time. No per-tenant timezone exists in the data model
 * yet (WORKFLOW.md §4 flags it as aspirational) — this is the MVP-appropriate
 * simplification until that field exists.
 */
export function getDayRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
