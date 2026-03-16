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
        humidity: number;
        precipitationMm: number;
        temperatureC: number;
        windKph: number;
    };
    hourly: Array<{
        description: string;
        precipitationMm: number;
        temperatureC: number;
        time: string;
        windKph: number;
    }>;
    location: string;
    message: string;
    source: "mock" | "smhi";
    status: "fallback" | "live";
    updatedAt: string;
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

    // Vi tar ett dygn av timvisa prognoser, så vi kan visa resten av dagen och imorgon.
    const timeSeries = data.timeSeries.slice(0, 24);
    const currentPoint = timeSeries[0];

    return {
        current: {
            description: getSmhiSymbolLabel(getParameterValue(currentPoint.parameters, "Wsymb2")),
            humidity: roundValue(getParameterValue(currentPoint.parameters, "r")),
            precipitationMm: roundValue(getParameterValue(currentPoint.parameters, "pmean")),
            temperatureC: roundValue(getParameterValue(currentPoint.parameters, "t")),
            windKph: roundValue(getParameterValue(currentPoint.parameters, "ws") * 3.6),
        },
        hourly: timeSeries.map((point) => ({
            description: getSmhiSymbolLabel(getParameterValue(point.parameters, "Wsymb2")),
            precipitationMm: roundValue(getParameterValue(point.parameters, "pmean")),
            temperatureC: roundValue(getParameterValue(point.parameters, "t")),
            time: point.validTime,
            windKph: roundValue(getParameterValue(point.parameters, "ws") * 3.6),
        })),
        location,
        message: "SMHI prognos for de narmaste timmarna.",
        source: "smhi",
        status: "live",
        updatedAt: data.approvedTime,
    };
}

function getParameterValue(parameters: SmhiParameter[], name: string): number {
    // Varje parameter ligger som ett namn + en lista med värden; vi använder första värdet.
    return parameters.find((parameter) => parameter.name === name)?.values[0] ?? 0;
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
        hourly: Array.from({ length: 24 }).map((_, offset) => ({
            description: offset < 12 ? "Latt molnigt" : "Klart",
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
    };
}

function getSmhiSymbolLabel(symbol: number): string {
    // Wsymb2 ar SMHI:s kod for vädersymbol. Här översätter vi de vanligaste värdena till text.
    switch (symbol) {
        case 1:
            return "Klart";
        case 2:
            return "Nastan klart";
        case 3:
            return "Vaxlande molnighet";
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
            return "Latt regnskur";
        case 11:
        case 12:
            return "Regnskur";
        case 13:
        case 14:
            return "Askskur";
        case 15:
        case 16:
        case 17:
            return "Snoskruv";
        case 18:
        case 19:
        case 20:
            return "Regn";
        case 21:
        case 22:
        case 23:
            return "Aska";
        case 24:
        case 25:
        case 26:
            return "Sno";
        case 27:
            return "Blandad nederbord";
        default:
            return "Okant vader";
    }
}

export default router;
