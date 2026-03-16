import { Router } from "express";
import { withCache } from "../lib/cache";
import { envNumber, envString } from "../lib/env";
import { fetchJson } from "../lib/http";

type SmhiParameter = {
    name: string;
    values: number[];
};

type SmhiTimeSeries = {
    parameters: SmhiParameter[];
    validTime: string;
};

type SmhiForecastResponse = {
    approvedTime: string;
    timeSeries: SmhiTimeSeries[];
};

type WeatherResponse = {
    current: {
        description: string;
        humidity: number | null;
        precipitationMm: number | null;
        temperatureC: number | null;
        windKph: number | null;
    };
    hourly: Array<{
        description: string;
        precipitationMm: number | null;
        temperatureC: number | null;
        time: string;
        windKph: number | null;
    }>;
    location: string;
    message: string;
    source: "mock" | "smhi";
    status: "fallback" | "live";
    updatedAt: string; // SMHI approvedTime
    fetchedAt: string; // when our backend fetched it
};

const router = Router();

router.get("/", async (_req, res) => {
    try {
        // Väder behöver inte hämtas för varje request, så vi cachar en stund.
        const cacheMs = envNumber("WEATHER_CACHE_MS", 10 * 60_000);
        const payload = await withCache("weather", cacheMs, loadWeather);
        res.json(payload);
    } catch (error) {
        // Om SMHI inte svarar visar vi mockdata i stället för att göra dashboarden tom.
        console.error("Weather route failed:", error);
        res.json(createMockWeather("SMHI kunde inte hamtas just nu."));
    }
});

async function loadWeather(): Promise<WeatherResponse> {
    const latitude = envString("WEATHER_LATITUDE", "58.4108") ?? "58.4108";
    const longitude = envString("WEATHER_LONGITUDE", "15.6214") ?? "15.6214";
    const location = envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping";

    // SMHI:s prognosendpoint returnerar en tidsserie med parametrar per tidpunkt.
    const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
    const data = await fetchJson<SmhiForecastResponse>(url);

    // Hämta fler punkter än 24, eftersom SMHI-tidsserien kan ha varierande upplösning.
    // Frontend får själv välja vad som gäller för idag/imorgon.
    const timeSeries = data.timeSeries.slice(0, 48);
    const currentPoint = timeSeries[0];

    const toMaybeNumber = (value: number | null) => (value === null ? null : roundValue(value));

    return {
        current: {
            description: getSmhiSymbolLabel(getParameterValue(currentPoint.parameters, "Wsymb2")),
            humidity: toMaybeNumber(getParameterValue(currentPoint.parameters, "r")),
            precipitationMm: toMaybeNumber(getParameterValue(currentPoint.parameters, "pmean")),
            temperatureC: toMaybeNumber(getParameterValue(currentPoint.parameters, "t")),
            windKph: toMaybeNumber(getParameterValue(currentPoint.parameters, "ws") * 3.6),
        },
        hourly: timeSeries.map((point) => ({
            description: getSmhiSymbolLabel(getParameterValue(point.parameters, "Wsymb2")),
            precipitationMm: toMaybeNumber(getParameterValue(point.parameters, "pmean")),
            temperatureC: toMaybeNumber(getParameterValue(point.parameters, "t")),
            time: point.validTime,
            windKph: toMaybeNumber(getParameterValue(point.parameters, "ws") * 3.6),
        })),
        location,
        message: "SMHI prognos for de narmaste timmarna.",
        source: "smhi",
        status: "live",
        updatedAt: data.approvedTime,
        fetchedAt: new Date().toISOString(),
    };
}

function getParameterValue(parameters: SmhiParameter[], name: string): number | null {
    // Varje parameter ligger som ett namn + en lista med värden; vi använder första värdet.
    const match = parameters.find((parameter) => parameter.name === name);
    if (!match || match.values.length === 0) {
        return null;
    }
    return match.values[0];
}

function roundValue(value: number): number {
    return Math.round(value * 10) / 10;
}

function createMockWeather(message: string): WeatherResponse {
    const now = Date.now();

    return {
        current: {
            description: "Vaxlande molnighet",
            humidity: 71,
            precipitationMm: 0.2,
            temperatureC: 8,
            windKph: 13,
        },
        hourly: Array.from({ length: 48 }).map((_, offset) => ({
            description: offset < 12 ? "Lätt molnigt" : "Klart",
            precipitationMm: offset === 2 ? 0.4 : 0,
            temperatureC: 8 - Math.max(0, offset - 1),
            time: new Date(now + offset * 60 * 60_000).toISOString(),
            windKph: 12 + offset,
        })),
        location: envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping",
        message,
        source: "mock",
        status: "fallback",
        updatedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
    };
}

function getSmhiSymbolLabel(symbol: number | null): string {
    // Wsymb2 är SMHI:s kod för vädersymbol. Här översätter vi de vanligaste värdena till text.
    if (symbol === null) {
        return "Okänt väder";
    }

    switch (symbol) {
        case 1:
            return "Klart";
        case 2:
            return "Nästan klart";
        case 3:
            return "Växlande molnighet";
        case 4:
            return "Halvklart";
        case 5:
            return "Molnigt";
        case 6:
            return "Mulet";
        case 7:
            return "Dimma";
        case 8:
        case 9:
        case 10:
            return "Lätt regnskur";
        case 11:
        case 12:
            return "Regnskur";
        case 13:
        case 14:
            return "Åskskur";
        case 15:
        case 16:
        case 17:
            return "Snöskur";
        case 18:
        case 19:
        case 20:
            return "Regn";
        case 21:
        case 22:
        case 23:
            return "Åska";
        case 24:
        case 25:
        case 26:
            return "Snö";
        case 27:
            return "Blandad nederbörd";
        default:
            return "Okänt väder";
    }
}

export default router;
