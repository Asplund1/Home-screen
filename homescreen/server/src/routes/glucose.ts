import { Router } from "express";
import { withCache } from "../library/cache";
import { envNumber, envString } from "../library/env";
import { buildUrl, fetchJson } from "../library/http";

type NightscoutEntry = {
  created_at?: string;
  date?: number;
  dateString?: string;
  delta?: number;
  direction?: string;
  device?: string;
  sgv?: number;
};

type GlucoseHistoryPoint = {
  measuredAt: string;
  valueMgdl: number;
  valueMmol: number;
};

type GlucoseResponse = {
  message: string;
  note: string | null;
  reading: {
    ageMinutes: number;
    deltaMgdl: number | null;
    deltaMmol: number | null;
    measuredAt: string;
    status: "high" | "low" | "normal";
    trendArrow: string;
    trendLabel: string;
    valueMgdl: number;
    valueMmol: number;
  } | null;
  history: GlucoseHistoryPoint[];
  source: "mock" | "nightscout";
  status: "config_missing" | "fallback" | "live";
  updatedAt: string;
};

const router = Router();

router.get("/", async (_req, res) => {
  try {
    // se över chache_ms 
    const cacheMs = envNumber("GLUCOSE_CACHE_MS", 60_000);
    const payload = await withCache("glucose", cacheMs, loadGlucose);

    res.json(payload);
  } catch (error) {
    console.error("Glucose route failed:", error);

    res.json(
      createMockGlucose("Nightscout kunde inte hämtas just nu."),
    );
  }
});

async function loadGlucose(): Promise<GlucoseResponse> {
  const siteUrl = envString("NIGHTSCOUT_URL");

  if (!siteUrl) {
    return createConfigMissingGlucose();
  }

  const apiBase = getNightscoutApiBase(siteUrl);

  const readToken = envString("NIGHTSCOUT_READ_TOKEN");

  const count = 288;

  const url = buildUrl(`${apiBase}/entries.json`, { count });

  const headers = readToken
    ? {
      Authorization: `Bearer ${readToken}`,
    }
    : undefined;

  const entries = await fetchJson<NightscoutEntry[]>(url, { headers });

  const latestEntry = entries[0];
  const previousEntry = entries[1];

  if (!latestEntry || typeof latestEntry.sgv !== "number") {
    return createMockGlucose(
      "Nightscout svarade, men ingen giltig glukospost hittades.",
    );
  }

  const measuredAt = getMeasuredAt(latestEntry);
  const measuredTimestamp = Date.parse(measuredAt);

  const ageMinutes = Number.isNaN(measuredTimestamp)
    ? 0
    : Math.max(0, Math.round((Date.now() - measuredTimestamp) / 60_000));

  const valueMgdl = latestEntry.sgv;
  const deltaMgdl = getDeltaMgdl(latestEntry, previousEntry);
  const trendMeta = getNightscoutTrend(latestEntry.direction);

  const history = entries
    .filter((entry): entry is NightscoutEntry & { sgv: number } => {
      return typeof entry.sgv === "number";
    })
    .map((entry) => ({
      measuredAt: getMeasuredAt(entry),
      valueMgdl: entry.sgv,
      valueMmol: mgdlToMmol(entry.sgv),
    }))
    .sort((a, b) => Date.parse(a.measuredAt) - Date.parse(b.measuredAt));

  return {
    message: "Nightscout-data hämtas från din egen site.",
    note:
      ageMinutes >= 15
        ? "Senaste värdet är lite gammalt. Kontrollera att Nightscout uppdateras korrekt."
        : null,
    reading: {
      ageMinutes,
      deltaMgdl,
      deltaMmol: deltaMgdl === null ? null : mgdlToMmol(deltaMgdl),
      measuredAt,
      status: getGlucoseStatus(valueMgdl),
      trendArrow: trendMeta.arrow,
      trendLabel: trendMeta.label,
      valueMgdl,
      valueMmol: mgdlToMmol(valueMgdl),
    },
    history,
    source: "nightscout",
    status: "live",
    updatedAt: new Date().toISOString(),
  };
}

function getNightscoutApiBase(siteUrl: string): string {
  // Användaren kan ange antingen site-roten eller /api/v1.
  // Normaliserat till /api/v1.
  const trimmed = siteUrl.replace(/\/+$/u, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

function getMeasuredAt(entry: NightscoutEntry): string {
  if (entry.dateString) {
    return entry.dateString;
  }

  if (entry.created_at) {
    return entry.created_at;
  }

  if (typeof entry.date === "number") {
    return new Date(entry.date).toISOString();
  }

  return new Date().toISOString();
}

function getDeltaMgdl(
  latest: NightscoutEntry,
  previous?: NightscoutEntry,
): number | null {
  if (typeof latest.delta === "number") {
    return latest.delta;
  }

  if (
    typeof latest.sgv === "number" &&
    typeof previous?.sgv === "number"
  ) {
    return latest.sgv - previous.sgv;
  }

  return null;
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
  if (valueMgdl < 70) {
    return "low";
  }

  if (valueMgdl > 180) {
    return "high";
  }

  return "normal";
}

function mgdlToMmol(valueMgdl: number): number {
  return Math.round((valueMgdl / 18) * 10) / 10;
}

function createConfigMissingGlucose(): GlucoseResponse {
  return {
    message: "Lägg till NIGHTSCOUT_URL för att visa dina glukosvärden.",
    note: null,
    reading: null,
    history: [],
    source: "mock",
    status: "config_missing",
    updatedAt: new Date().toISOString(),
  };
}

function createMockGlucose(message: string): GlucoseResponse {
  const now = Date.now();

  const history: GlucoseHistoryPoint[] = Array.from({ length: 24 }).map(
    (_, index) => {
      const valueMgdl = Math.round(126 + Math.sin(index / 4) * 15);

      return {
        measuredAt: new Date(
          now - (23 - index) * 60 * 60_000,
        ).toISOString(),
        valueMgdl,
        valueMmol: mgdlToMmol(valueMgdl),
      };
    },
  );

  return {
    message,
    note: "Demo-data visas tills Nightscout är kopplat.",
    reading: {
      ageMinutes: 4,
      deltaMgdl: 6,
      deltaMmol: mgdlToMmol(6),
      measuredAt: new Date(Date.now() - 4 * 60_000).toISOString(),
      status: "normal",
      trendArrow: "→",
      trendLabel: "Stabil",
      valueMgdl: 126,
      valueMmol: mgdlToMmol(126),
    },
    history,
    source: "mock",
    status: "fallback",
    updatedAt: new Date().toISOString(),
  };
}

export default router;