import { Router } from "express";
import { withCache } from "../lib/cache";
import { envNumber, envString } from "../lib/env";
import { buildUrl, fetchJson } from "../lib/http";

type GooglePollenTypeInfo = {
    code: string;
    displayName: string;
    inSeason: boolean;
    healthRecommendations?: string[];
    indexInfo?: {
        category: string;
        color?: {
            blue?: number;
            green?: number;
            red?: number;
        };
        indexDescription?: string;
        value?: number;
    };
};

type GooglePollenColor = NonNullable<NonNullable<GooglePollenTypeInfo["indexInfo"]>["color"]>;

type GooglePollenResponse = {
    dailyInfo?: Array<{
        pollenTypeInfo?: GooglePollenTypeInfo[];
    }>;
    regionCode?: string;
};

type PollenResponse = {
    location: string;
    message: string;
    source: "google-pollen" | "mock";
    status: "config_missing" | "fallback" | "live";
    summary: string;
    types: Array<{
        category: string;
        code: string;
        color: string;
        description: string;
        inSeason: boolean;
        name: string;
        recommendation: string | null;
        value: number;
    }>;
    updatedAt: string;
};

const router = Router();

router.get("/", async (_req, res) => {
    try {
        // Pollenprognosen ändras långsamt och kan därför cacha längre.
        const cacheMs = envNumber("POLLEN_CACHE_MS", 60 * 60_000);
        const payload = await withCache("pollen", cacheMs, loadPollen);
        res.json(payload);
    } catch (error) {
        console.error("Pollen route failed:", error);
        res.json(createMockPollen("Google Pollen API kunde inte hamtas just nu."));
    }
});

async function loadPollen(): Promise<PollenResponse> {
    const apiKey = envString("GOOGLE_POLLEN_API_KEY");
    if (!apiKey) {
        return createConfigMissingPollen();
    }

    const latitude = envString("WEATHER_LATITUDE", "58.4108") ?? "58.4108";
    const longitude = envString("WEATHER_LONGITUDE", "15.6214") ?? "15.6214";
    const location = envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping";
    const languageCode = envString("POLLEN_LANGUAGE_CODE", "sv") ?? "sv";

    // Vi använder en dags prognos eftersom dashboarden bara visar dagens viktigaste pollenläge.
    const url = buildUrl("https://pollen.googleapis.com/v1/forecast:lookup", {
        "days": 1,
        "key": apiKey,
        "languageCode": languageCode,
        "location.latitude": latitude,
        "location.longitude": longitude,
        "plantsDescription": false,
    });

    const data = await fetchJson<GooglePollenResponse>(url);
    const pollenTypes = (data.dailyInfo?.[0]?.pollenTypeInfo ?? [])
        .filter((type) => type.indexInfo?.value !== undefined)
        .sort((left, right) => (right.indexInfo?.value ?? 0) - (left.indexInfo?.value ?? 0))
        .slice(0, 3)
        .map((type) => ({
            category: type.indexInfo?.category ?? "Okand",
            code: type.code,
            color: toHexColor(type.indexInfo?.color),
            description: type.indexInfo?.indexDescription ?? "Ingen beskrivning",
            inSeason: type.inSeason,
            name: type.displayName,
            recommendation: type.healthRecommendations?.[0] ?? null,
            value: type.indexInfo?.value ?? 0,
        }));

    const topType = pollenTypes[0];

    return {
        location,
        message: data.regionCode ? `Region: ${data.regionCode}` : "Dagens pollenprognos.",
        source: "google-pollen",
        status: "live",
        summary: topType
            ? `${topType.name} ar hogst idag (${topType.category.toLowerCase()}).`
            : "Ingen tydlig pollenrisk hittades idag.",
        types: pollenTypes,
        updatedAt: new Date().toISOString(),
    };
}

function createConfigMissingPollen(): PollenResponse {
    return {
        location: envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping",
        message: "Lagg till GOOGLE_POLLEN_API_KEY for riktig pollenprognos.",
        source: "mock",
        status: "config_missing",
        summary: "Pollenpanelen ar inte konfigurerad an.",
        types: [],
        updatedAt: new Date().toISOString(),
    };
}

function createMockPollen(message: string): PollenResponse {
    return {
        location: envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping",
        message,
        source: "mock",
        status: "fallback",
        summary: "Bjork ar mest relevant i demo-datan idag.",
        types: [
            {
                category: "Moderate",
                code: "TREE",
                color: "#d98032",
                description: "Mellanrisk for tradpollen.",
                inSeason: true,
                name: "Bjork",
                recommendation: "Hall fonster stangda tidigt pa morgonen om du ar kanslig.",
                value: 3,
            },
            {
                category: "Low",
                code: "GRASS",
                color: "#5f8d4e",
                description: "Lag grasrisk idag.",
                inSeason: false,
                name: "Gras",
                recommendation: null,
                value: 1,
            },
        ],
        updatedAt: new Date().toISOString(),
    };
}

function toHexColor(color: GooglePollenColor | undefined): string {
    // Google skickar RGB som 0-1-varden; här gör vi om dem till vanlig hex-farg.
    if (!color) {
        return "#5f8d4e";
    }

    const red = Math.round((color.red ?? 0) * 255);
    const green = Math.round((color.green ?? 0) * 255);
    const blue = Math.round((color.blue ?? 0) * 255);

    return `#${toHexPart(red)}${toHexPart(green)}${toHexPart(blue)}`;
}

function toHexPart(value: number): string {
    return value.toString(16).padStart(2, "0");
}

export default router;
