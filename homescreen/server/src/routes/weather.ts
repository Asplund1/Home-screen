import { Router } from "express";
import { withCache } from "../library/cache";
import { envNumber, envString } from "../library/env";
import { fetchJson } from "../library/http";

type OpenMeteoResponse = {
  current: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

type WeatherResponse = {
  current: {
    description: string;
    humidity: number | null;
    precipitationMm: number | null;
    sunrise: string | null;
    sunset: string | null;
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
  source: "mock" | "open-meteo";
  status: "fallback" | "live";
  updatedAt: string;
  fetchedAt: string;
};

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const cacheMs = envNumber("WEATHER_CACHE_MS", 10 * 60_000);
    const payload = await withCache("weather", cacheMs, loadWeather);

    res.json(payload);
  } catch (error) {
    console.error("Weather route failed:", error);
    res.json(createMockWeather("Open-Meteo kunde inte hämtas just nu."));
  }
});

async function loadWeather(): Promise<WeatherResponse> {
  const latitude = envString("WEATHER_LATITUDE", "58.4108");
  const longitude = envString("WEATHER_LONGITUDE", "15.6214");
  const location = envString("WEATHER_LOCATION_NAME", "Linköping") ?? "Linköping";

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    "&timezone=Europe%2FStockholm" +
    "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code" +
    "&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code" +
    "&forecast_hours=48" +
    "&daily=sunrise,sunset";

  const data = await fetchJson<OpenMeteoResponse>(url);
  const fetchedAt = new Date().toISOString();

  return {
    current: {
      description: getWeatherCodeLabel(data.current?.weather_code ?? null),
      humidity: toMaybeNumber(data.current?.relative_humidity_2m),
      precipitationMm: toMaybeNumber(data.current?.precipitation),
      sunrise: data.daily?.sunrise?.[0] ?? null,
      sunset: data.daily?.sunset?.[0] ?? null,
      temperatureC: toMaybeNumber(data.current?.temperature_2m),
      windKph: toMaybeNumber(data.current?.wind_speed_10m),
    },
    hourly: mapHourly(data.hourly),
    location,
    message: "Open-Meteo-prognos för de närmaste timmarna.",
    source: "open-meteo",
    status: "live",
    updatedAt: fetchedAt,
    fetchedAt,
  };
}

function mapHourly(hourly: OpenMeteoResponse["hourly"]): WeatherResponse["hourly"] {
  if (!hourly?.time?.length) {
    return [];
  }

  return hourly.time.map((time, index) => ({
    time,
    description: getWeatherCodeLabel(hourly.weather_code?.[index] ?? null),
    precipitationMm: toMaybeNumber(hourly.precipitation?.[index]),
    temperatureC: toMaybeNumber(hourly.temperature_2m?.[index]),
    windKph: toMaybeNumber(hourly.wind_speed_10m?.[index]),
  }));
}

function toMaybeNumber(value: number | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

function createMockWeather(message: string): WeatherResponse {
  const now = Date.now();
  const location = envString("WEATHER_LOCATION_NAME", "Linköping") ?? "Linköping";
  const timestamp = new Date().toISOString();

  return {
    current: {
      description: "Växlande molnighet",
      humidity: 71,
      precipitationMm: 0.2,
      sunrise: new Date(new Date().setHours(6, 12, 0, 0)).toISOString(),
      sunset: new Date(new Date().setHours(18, 4, 0, 0)).toISOString(),
      temperatureC: 8,
      windKph: 13,
    },
    hourly: Array.from({ length: 48 }, (_, offset) => ({
      time: new Date(now + offset * 60 * 60_000).toISOString(),
      description: offset < 12 ? "Lätt molnigt" : "Klart",
      precipitationMm: offset === 2 ? 0.4 : 0,
      temperatureC: 8 - Math.max(0, offset - 1),
      windKph: 12 + offset,
    })),
    location,
    message,
    source: "mock",
    status: "fallback",
    updatedAt: timestamp,
    fetchedAt: timestamp,
  };
}

function getWeatherCodeLabel(code: number | null): string {
  switch (code) {
    case 0:
      return "Klart";
    case 1:
      return "Mestadels klart";
    case 2:
      return "Delvis molnigt";
    case 3:
      return "Mulet";
    case 45:
    case 48:
      return "Dimma";
    case 51:
    case 53:
    case 55:
      return "Duggregn";
    case 56:
    case 57:
      return "Underkylt duggregn";
    case 61:
    case 63:
    case 65:
      return "Regn";
    case 66:
    case 67:
      return "Underkylt regn";
    case 71:
    case 73:
    case 75:
      return "Snö";
    case 77:
      return "Snökorn";
    case 80:
    case 81:
    case 82:
      return "Regnskur";
    case 85:
    case 86:
      return "Snöby";
    case 95:
      return "Åska";
    case 96:
    case 99:
      return "Åska med hagel";
    default:
      return "Okänt väder";
  }
}

export default router;