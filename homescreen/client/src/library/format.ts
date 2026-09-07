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

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatEventDate(
  startDate: string,
  startTime: string | undefined,
  endDate: string | undefined,
  endTime: string | undefined,
): string {
  const start = formatShortDate(startDate);
  const timeRange = formatTimeRange(startTime, endTime);

  if (!endDate || endDate === startDate) {
    return timeRange ? `${start}, ${timeRange}` : start;
  }

  const end = formatShortDate(endDate);
  return timeRange ? `${start} - ${end}, ${timeRange}` : `${start} - ${end}`;
}

function formatTimeRange(
  startTime: string | undefined,
  endTime: string | undefined,
): string {
  if (startTime && endTime) {
    return `${startTime}-${endTime}`;
  }

  return startTime || "";
}

export function formatSyncTime(timestamp: number): string {
  const minutesAgo = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutesAgo === 0) {
    return "nyss";
  }

  return `${minutesAgo} min sedan`;
}

