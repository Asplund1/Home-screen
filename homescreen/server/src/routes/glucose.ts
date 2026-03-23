import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { envString } from "../library/env";
import { fetchJson } from "../library/http";

type NightscoutEntry = {
  created_at?: string;
  date?: number;
  dateString?: string;
  delta?: number;
  direction?: string;
  sgv?: number;
};

type GlucoseHistoryPoint = {
  measuredAt: string;
  valueMgdl: number;
  valueMmol: number;
};

type GlucoseReading = {
  ageMinutes: number;
  deltaMgdl: number | null;
  deltaMmol: number | null;
  measuredAt: string;
  status: "high" | "low" | "normal";
  trendArrow: string;
  trendLabel: string;
  valueMgdl: number;
  valueMmol: number;
};

type GlucoseResponse = {
  message: string;
  note: string | null;
  reading: GlucoseReading | null;
  history: GlucoseHistoryPoint[];
  source: "nightscout" | null;
  status: "config_missing" | "live" | "unavailable";
  updatedAt: string;
};

type NormalizedNightscoutEntry = {
  deltaMgdl: number | null;
  direction?: string;
  measuredAt: string;
  measuredTimestamp: number;
  valueMgdl: number;
};

const router = Router();

const DAY_MS = 24 * 60 * 60_000;
const HARD_TTL_MS = 5 * 60_000;
const LOW_THRESHOLD_MGDL = 70;
const HIGH_THRESHOLD_MGDL = 180;
const STALE_MINUTES = 15;
const MAX_HISTORY_POINTS = 500;

let cachedPayload: GlucoseResponse | null = null;
let cacheExpiresAt = 0;
let inFlightRequest: Promise<GlucoseResponse> | null = null;

const glucoseLimiter = rateLimit({
  windowMs: 5 * 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", glucoseLimiter, async (_req, res) => {
  try {
    const payload = await loadGlucoseWithHardCache();

    res.set("Cache-Control", "private, max-age=300");
    res.json(payload);
  } catch (error) {
    console.error("Glucose route failed:", error);

    res.set("Cache-Control", "private, max-age=60");
    res.json(
      createUnavailableGlucose("Nightscout kunde inte hämtas just nu."),
    );
  }
});

async function loadGlucoseWithHardCache(): Promise<GlucoseResponse> {
  const now = Date.now();

  if (cachedPayload && now < cacheExpiresAt) {
    return cachedPayload;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = loadGlucose()
    .then((payload) => {
      cachedPayload = payload;
      cacheExpiresAt = Date.now() + HARD_TTL_MS;
      return payload;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

async function loadGlucose(): Promise<GlucoseResponse> {
  const siteUrl = envString("NIGHTSCOUT_URL");

  if (!siteUrl) {
    return createConfigMissingGlucose();
  }

  const url = createNightscoutEntriesUrl(siteUrl);
  const readToken = envString("NIGHTSCOUT_READ_TOKEN");
  const headers = getNightscoutHeaders(readToken);

  const entries = await fetchJson<NightscoutEntry[]>(url, { headers });
  const normalizedEntries = normalizeEntries(entries);

  if (!normalizedEntries.length) {
    return createUnavailableGlucose(
      "Nightscout svarade, men inga giltiga glukosvärden hittades.",
    );
  }

  const latestEntry = normalizedEntries[normalizedEntries.length - 1];
  const previousEntry = normalizedEntries[normalizedEntries.length - 2];
  const deltaMgdl = getDeltaMgdl(latestEntry, previousEntry);
  const ageMinutes = getAgeMinutes(latestEntry.measuredTimestamp);
  const trend = getNightscoutTrend(latestEntry.direction);

  return {
    message: "Glukosdata hämtas från Nightscout.",
    note:
      ageMinutes >= STALE_MINUTES
        ? "Senaste värdet är äldre än väntat. Kontrollera att Nightscout uppdateras korrekt."
        : null,
    reading: {
      ageMinutes,
      deltaMgdl,
      deltaMmol: deltaMgdl === null ? null : mgdlToMmol(deltaMgdl),
      measuredAt: latestEntry.measuredAt,
      status: getGlucoseStatus(latestEntry.valueMgdl),
      trendArrow: trend.arrow,
      trendLabel: trend.label,
      valueMgdl: latestEntry.valueMgdl,
      valueMmol: mgdlToMmol(latestEntry.valueMgdl),
    },
    history: normalizedEntries.map((entry) => ({
      measuredAt: entry.measuredAt,
      valueMgdl: entry.valueMgdl,
      valueMmol: mgdlToMmol(entry.valueMgdl),
    })),
    source: "nightscout",
    status: "live",
    updatedAt: new Date().toISOString(),
  };
}

function createNightscoutEntriesUrl(siteUrl: string): string {
  const apiBase = getNightscoutApiBase(siteUrl);
  const url = new URL(`${apiBase}/entries/sgv`);

  url.searchParams.set(
    "find[dateString][$gte]",
    new Date(Date.now() - DAY_MS).toISOString(),
  );
  url.searchParams.set("count", String(MAX_HISTORY_POINTS));

  return url.toString();
}

function getNightscoutApiBase(siteUrl: string): string {
  const trimmed = siteUrl.replace(/\/+$/u, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

function getNightscoutHeaders(
  readToken?: string,
): Record<string, string> | undefined {
  if (!readToken) {
    return undefined;
  }

  return {
    Authorization: readToken.startsWith("Bearer ")
      ? readToken
      : `Bearer ${readToken}`,
  };
}

function normalizeEntries(entries: NightscoutEntry[]): NormalizedNightscoutEntry[] {
  const byTimestamp = new Map<number, NormalizedNightscoutEntry>();

  for (const entry of entries) {
    if (typeof entry.sgv !== "number") {
      continue;
    }

    const measuredTimestamp = getMeasuredTimestamp(entry);

    if (!Number.isFinite(measuredTimestamp)) {
      continue;
    }

    byTimestamp.set(measuredTimestamp, {
      deltaMgdl: typeof entry.delta === "number" ? entry.delta : null,
      direction: typeof entry.direction === "string" ? entry.direction : undefined,
      measuredAt: new Date(measuredTimestamp).toISOString(),
      measuredTimestamp,
      valueMgdl: entry.sgv,
    });
  }

  return Array.from(byTimestamp.values()).sort(
    (a, b) => a.measuredTimestamp - b.measuredTimestamp,
  );
}

function getMeasuredTimestamp(entry: NightscoutEntry): number {
  if (typeof entry.date === "number" && Number.isFinite(entry.date)) {
    return entry.date > 10_000_000_000 ? entry.date : entry.date * 1000;
  }

  const dateStringTimestamp = Date.parse(entry.dateString ?? "");
  if (!Number.isNaN(dateStringTimestamp)) {
    return dateStringTimestamp;
  }

  const createdAtTimestamp = Date.parse(entry.created_at ?? "");
  if (!Number.isNaN(createdAtTimestamp)) {
    return createdAtTimestamp;
  }

  return Number.NaN;
}

function getDeltaMgdl(
  latest: NormalizedNightscoutEntry,
  previous?: NormalizedNightscoutEntry,
): number | null {
  if (typeof latest.deltaMgdl === "number") {
    return latest.deltaMgdl;
  }

  if (previous) {
    return latest.valueMgdl - previous.valueMgdl;
  }

  return null;
}

function getAgeMinutes(measuredTimestamp: number): number {
  return Math.max(0, Math.round((Date.now() - measuredTimestamp) / 60_000));
}

function getNightscoutTrend(direction?: string): {
  arrow: string;
  label: string;
} {
  switch ((direction ?? "").toLowerCase()) {
    case "doubleup":
      return { arrow: "↑↑", label: "Stiger snabbt" };
    case "singleup":
      return { arrow: "↑", label: "Stiger" };
    case "fortyfiveup":
      return { arrow: "↗", label: "Stiger lätt" };
    case "flat":
      return { arrow: "→", label: "Stabil" };
    case "fortyfivedown":
      return { arrow: "↘", label: "Sjunker lätt" };
    case "singledown":
      return { arrow: "↓", label: "Sjunker" };
    case "doubledown":
      return { arrow: "↓↓", label: "Sjunker snabbt" };
    default:
      return { arrow: "?", label: "Trend okänd" };
  }
}

function getGlucoseStatus(valueMgdl: number): "high" | "low" | "normal" {
  if (valueMgdl < LOW_THRESHOLD_MGDL) {
    return "low";
  }

  if (valueMgdl > HIGH_THRESHOLD_MGDL) {
    return "high";
  }

  return "normal";
}

function mgdlToMmol(valueMgdl: number): number {
  return Math.round((valueMgdl / 18) * 10) / 10;
}

function createConfigMissingGlucose(): GlucoseResponse {
  return {
    message: "Lägg till NIGHTSCOUT_URL för att visa glukosdata.",
    note: null,
    reading: null,
    history: [],
    source: null,
    status: "config_missing",
    updatedAt: new Date().toISOString(),
  };
}

function createUnavailableGlucose(message: string): GlucoseResponse {
  return {
    message,
    note: null,
    reading: null,
    history: [],
    source: null,
    status: "unavailable",
    updatedAt: new Date().toISOString(),
  };
}

export default router;