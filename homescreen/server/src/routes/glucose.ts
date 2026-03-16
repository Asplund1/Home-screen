import { Router } from "express";
import { withCache } from "../lib/cache";
import { envNumber, envString } from "../lib/env";
import { buildUrl, fetchJson } from "../lib/http";

type NightscoutEntry = {
    created_at?: string;
    date?: number;
    dateString?: string;
    delta?: number;
    direction?: string;
    device?: string;
    sgv?: number;
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
    source: "mock" | "nightscout";
    status: "config_missing" | "fallback" | "live";
    updatedAt: string;
};

const router = Router();

router.get("/", async (_req, res) => {
    try {
        // Glukosdata uppdateras oftare än väder men behöver fortfarande inte hämtas per request.
        const cacheMs = envNumber("GLUCOSE_CACHE_MS", 60_000);
        const payload = await withCache("glucose", cacheMs, loadGlucose);
        res.json(payload);
    } catch (error) {
        console.error("Glucose route failed:", error);
        res.json(createMockGlucose("Nightscout kunde inte hamtas just nu."));
    }
});

async function loadGlucose(): Promise<GlucoseResponse> {
    const siteUrl = envString("NIGHTSCOUT_URL");
    if (!siteUrl) {
        return createConfigMissingGlucose();
    }

    const normalizedBaseUrl = getNightscoutApiBase(siteUrl);
    const token = envString("NIGHTSCOUT_TOKEN");

    // Vi hamtar de två senaste posterna sa att vi kan visa delta om Nightscout inte skickar det direkt.
    const url = buildUrl(`${normalizedBaseUrl}/entries.json`, {
        count: 2,
        token,
    });

    const entries = await fetchJson<NightscoutEntry[]>(url, {
        headers: token
            ? {
                  Authorization: `Bearer ${token}`,
              }
            : undefined,
    });

    const latestEntry = entries[0];
    const previousEntry = entries[1];

    if (!latestEntry?.sgv) {
        return createMockGlucose("Nightscout svarade, men ingen glukospost hittades.");
    }

    const measuredAt = getMeasuredAt(latestEntry);
    const ageMinutes = Math.max(0, Math.round((Date.now() - Date.parse(measuredAt)) / 60_000));
    const deltaMgdl = getDeltaMgdl(latestEntry, previousEntry);
    const trendMeta = getNightscoutTrend(latestEntry.direction);
    const valueMgdl = latestEntry.sgv;

    return {
        message: "Nightscout-data hamtas fran din egen site.",
        note:
            ageMinutes >= 15
                ? "Senaste vardet ar lite gammalt. Kontrollera att Nightscout uppdateras korrekt."
                : null,
        reading: {
            ageMinutes,
            deltaMgdl,
            deltaMmol: deltaMgdl === null ? null : Math.round((deltaMgdl / 18) * 10) / 10,
            measuredAt,
            status: valueMgdl < 70 ? "low" : valueMgdl > 180 ? "high" : "normal",
            trendArrow: trendMeta.arrow,
            trendLabel: trendMeta.label,
            valueMgdl,
            valueMmol: Math.round((valueMgdl / 18) * 10) / 10,
        },
        source: "nightscout",
        status: "live",
        updatedAt: measuredAt,
    };
}

function getNightscoutApiBase(siteUrl: string): string {
    // Anvandaren kan skriva antingen site-roten eller api/v1-roten; vi normaliserar till api/v1.
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

    return new Date(entry.date ?? Date.now()).toISOString();
}

function getDeltaMgdl(latest: NightscoutEntry, previous: NightscoutEntry | undefined): number | null {
    if (typeof latest.delta === "number") {
        return latest.delta;
    }

    if (typeof latest.sgv === "number" && typeof previous?.sgv === "number") {
        return latest.sgv - previous.sgv;
    }

    return null;
}

function getNightscoutTrend(direction: string | undefined): { arrow: string; label: string } {
    // Nightscout använder textbaserade trendnamn som vi mappar till enklare UI-text.
    switch ((direction ?? "").toLowerCase()) {
        case "doubleup":
            return { arrow: "^^", label: "Stiger snabbt" };
        case "singleup":
            return { arrow: "^", label: "Stiger" };
        case "fortyfiveup":
            return { arrow: "/", label: "Stiger latt" };
        case "flat":
            return { arrow: ">", label: "Stabil" };
        case "fortyfivedown":
            return { arrow: "\\", label: "Sjunker latt" };
        case "singledown":
            return { arrow: "v", label: "Sjunker" };
        case "doubledown":
            return { arrow: "vv", label: "Sjunker snabbt" };
        default:
            return { arrow: "?", label: "Trend okand" };
    }
}

function createConfigMissingGlucose(): GlucoseResponse {
    return {
        message: "Lagg till NIGHTSCOUT_URL for att visa dina glukosvarden.",
        note: null,
        reading: null,
        source: "mock",
        status: "config_missing",
        updatedAt: new Date().toISOString(),
    };
}

function createMockGlucose(message: string): GlucoseResponse {
    return {
        message,
        note: "Demo-data visas tills Nightscout ar kopplat.",
        reading: {
            ageMinutes: 4,
            deltaMgdl: 6,
            deltaMmol: 0.3,
            measuredAt: new Date(Date.now() - 4 * 60_000).toISOString(),
            status: "normal",
            trendArrow: ">",
            trendLabel: "Stabil",
            valueMgdl: 126,
            valueMmol: 7,
        },
        source: "mock",
        status: "fallback",
        updatedAt: new Date().toISOString(),
    };
}

export default router;
