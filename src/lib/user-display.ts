/** First name for greetings; empty when no name is set (never derived from email). */
export function getFirstName(name: string | null): string {
  if (!name) return "";
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Up to two initials (e.g. "Pedro Herval" -> "PH") for avatar fallbacks. */
export function getInitials(name: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
