// Alla formattering samlat i denna fil.

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

export function formatShortTime(value: number | string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatSyncTime(timestamp: number): string {
  const minutesAgo = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutesAgo === 0) {
    return "nyss";
  }

  return `${minutesAgo} min sedan`;
}

