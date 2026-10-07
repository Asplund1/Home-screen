import { fetchJson } from "./http";

const SL_BASE_URL = "https://transport.integration.sl.se/v1";
const SL_DEVIATIONS_URL = "https://deviations.integration.sl.se/v1/messages";
const RACKSTA_SITE_ID = 9104;

type SlDeparture = {
  destination?: string;
  display?: string;
  scheduled: string;
  expected?: string;
  state?: string;
  line?: {
    designation?: string;
    transport_mode?: string;
  };
  stop_point?: {
    designation?: string;
  };
};

type SlDeparturesResponse = {
  departures?: SlDeparture[];
};

type SlDeviationMessageVariant = {
  header?: string;
  details?: string;
  scope_alias?: string;
  weblink?: string;
  language?: string;
};

type SlDeviation = {
  deviation_case_id?: number;
  priority?: {
    importance_level?: number;
    influence_level?: number;
    urgency_level?: number;
  };
  message_variants?: SlDeviationMessageVariant[];
  scope?: {
    lines?: Array<{
      designation?: string;
      name?: string;
      group_of_lines?: string;
      transport_mode?: string;
    }>;
  };
};

export type SubwayDeparture = {
  id: string;
  line: string;
  destination: string;
  departureTime: string;
  platform?: string;
  state?: string;
};

export type SubwayDisruption = {
  details: string;
  id: string;
  scope?: string;
  severity: "high" | "low" | "medium";
  title: string;
  url?: string;
};

export async function getRackstaSubwayDepartures(): Promise<SubwayDeparture[]> {
  const url = `${SL_BASE_URL}/sites/${RACKSTA_SITE_ID}/departures`;
  const data = await fetchJson<SlDeparturesResponse>(url);

  return (data.departures ?? [])
    .filter((departure) => departure.line?.transport_mode === "METRO")
    .filter((departure) => departure.state !== "NOTEXPECTED")
    .sort(sortByDepartureTime)
    .slice(0, 5)
    .map(formatDeparture);
}

export async function getRackstaSubwayDisruptions(): Promise<SubwayDisruption[]> {
  // Trafiklab's deviations API supports filtering on the same short site id as
  // the departures endpoint. Only current METRO deviations are relevant here.
  const url =
    `${SL_DEVIATIONS_URL}?future=false` +
    `&site=${RACKSTA_SITE_ID}` +
    "&transport_mode=METRO";
  const deviations = await fetchJson<SlDeviation[]>(url);

  return deviations
    .filter((deviation) => selectMessageVariant(deviation) !== undefined)
    .sort(sortByDisruptionPriority)
    .slice(0, 3)
    .map(formatDisruption);
}

function sortByDepartureTime(first: SlDeparture, second: SlDeparture): number {
  const firstTime = first.expected ?? first.scheduled;
  const secondTime = second.expected ?? second.scheduled;

  return new Date(firstTime).getTime() - new Date(secondTime).getTime();
}

function formatDeparture(departure: SlDeparture, index: number): SubwayDeparture {
  return {
    id: createDepartureId(departure, index),
    line: departure.line?.designation ?? "",
    destination: departure.destination ?? "Okänd destination",
    departureTime:
      departure.state === "CANCELLED"
        ? "Inställd"
        : departure.display ?? formatTime(departure),
    platform: departure.stop_point?.designation,
    state: departure.state,
  };
}

function formatDisruption(deviation: SlDeviation, index: number): SubwayDisruption {
  const variant = selectMessageVariant(deviation);
  const title = variant?.header?.trim() || "Störning i tunnelbanan";
  const details = variant?.details?.trim() || title;

  return {
    id: String(deviation.deviation_case_id ?? `${title}-${index}`),
    title,
    details,
    scope: variant?.scope_alias?.trim() || getScopeLabel(deviation),
    severity: getSeverity(deviation.priority?.importance_level),
    url: variant?.weblink?.trim() || undefined,
  };
}

function selectMessageVariant(
  deviation: SlDeviation,
): SlDeviationMessageVariant | undefined {
  const variants = deviation.message_variants ?? [];
  return (
    variants.find((variant) => variant.language?.toLowerCase() === "sv") ??
    variants.find((variant) => variant.header || variant.details)
  );
}

function sortByDisruptionPriority(left: SlDeviation, right: SlDeviation): number {
  const importanceDifference =
    getPriorityValue(right.priority?.importance_level) -
    getPriorityValue(left.priority?.importance_level);
  if (importanceDifference !== 0) {
    return importanceDifference;
  }

  const influenceDifference =
    getPriorityValue(right.priority?.influence_level) -
    getPriorityValue(left.priority?.influence_level);
  if (influenceDifference !== 0) {
    return influenceDifference;
  }

  return (
    getPriorityValue(right.priority?.urgency_level) -
    getPriorityValue(left.priority?.urgency_level)
  );
}

function getPriorityValue(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getSeverity(
  importanceLevel: number | undefined,
): SubwayDisruption["severity"] {
  const importance = getPriorityValue(importanceLevel);

  if (importance >= 5) {
    return "high";
  }

  if (importance >= 3) {
    return "medium";
  }

  return "low";
}

function getScopeLabel(deviation: SlDeviation): string | undefined {
  const labels = (deviation.scope?.lines ?? [])
    .map(
      (line) =>
        line.group_of_lines?.trim() ||
        line.name?.trim() ||
        line.designation?.trim(),
    )
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? [...new Set(labels)].join(", ") : undefined;
}

function createDepartureId(departure: SlDeparture, index: number): string {
  return [
    departure.line?.designation ?? "unknown",
    departure.destination ?? "unknown",
    departure.scheduled,
    index,
  ].join("-");
}

function formatTime(departure: SlDeparture): string {
  const departureDate = new Date(departure.expected ?? departure.scheduled);

  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(departureDate);
}
