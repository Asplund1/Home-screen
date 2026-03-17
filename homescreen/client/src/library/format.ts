import type { ResourceStatus } from "../types/dashboard";

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

export function getStatusLabel(
  status: ResourceStatus | undefined,
  error: string | null,
): string {
  if (error) {
    return "Fel";
  }

  switch (status) {
    case "live":
      return "Live";
    case "fallback":
      return "Demo";
    case "config_missing":
      return "Setup saknas";
    default:
      return "Laddar";
  }
}

export function getGlucoseStatusLabel(
  status: "high" | "low" | "normal",
): string {
  switch (status) {
    case "high":
      return "Hog";
    case "low":
      return "Lag";
    default:
      return "Stabil";
  }
}
