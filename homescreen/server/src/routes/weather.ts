import { Router } from "express";
import { withCache } from "../library/cache";
import { envNumber, envString } from "../library/env";
import { fetchJson } from "../library/http";

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
    res.json(createMockWeather("SMHI kunde inte hämtas just nu."));
  }
});

async function loadWeather(): Promise<WeatherResponse> {
  const latitude = envString("WEATHER_LATITUDE", "58.4108");
  const longitude = envString("WEATHER_LONGITUDE", "15.6214");
  const location = envString("WEATHER_LOCATION_NAME", "Linköping");

  const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;

  const data = await fetchJson<SmhiForecastResponse>(url);
  const timeSeries = data.timeSeries.slice(0, 48);

  if (timeSeries.length === 0) {
    throw new Error("SMHI response contained no timeSeries data");
  }

  const currentPoint = timeSeries[0];

  return {
    current: mapWeatherPoint(currentPoint),
    hourly: timeSeries.map(mapHourlyPoint),
    location,
    message: "SMHI-prognos för de närmaste timmarna.",
    source: "smhi",
    status: "live",
    updatedAt: data.approvedTime,
    fetchedAt: new Date().toISOString(),
  };
}

function mapWeatherPoint(point: SmhiTimeSeries) {
  const humidity = getParameterValue(point.parameters, "r");
  const precipitationMm = getParameterValue(point.parameters, "pmean");
  const temperatureC = getParameterValue(point.parameters, "t");
  const windMs = getParameterValue(point.parameters, "ws");
  const symbol = getParameterValue(point.parameters, "Wsymb2");

  return {
    description: getSmhiSymbolLabel(symbol),
    humidity: toMaybeNumber(humidity),
    precipitationMm: toMaybeNumber(precipitationMm),
    temperatureC: toMaybeNumber(temperatureC),
    windKph: windMs === null ? null : roundValue(windMs * 3.6),
  };
}

function mapHourlyPoint(point: SmhiTimeSeries) {
  const precipitationMm = getParameterValue(point.parameters, "pmean");
  const temperatureC = getParameterValue(point.parameters, "t");
  const windMs = getParameterValue(point.parameters, "ws");
  const symbol = getParameterValue(point.parameters, "Wsymb2");

  return {
    description: getSmhiSymbolLabel(symbol),
    precipitationMm: toMaybeNumber(precipitationMm),
    temperatureC: toMaybeNumber(temperatureC),
    time: point.validTime,
    windKph: windMs === null ? null : roundValue(windMs * 3.6),
  };
}

function getParameterValue(
  parameters: SmhiParameter[],
  name: string,
): number | null {
  const match = parameters.find((parameter) => parameter.name === name);

  if (!match || match.values.length === 0) {
    return null;
  }

  return match.values[0];
}

function toMaybeNumber(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return roundValue(value);
}

function roundValue(value: number): number {
  return Math.round(value * 10) / 10;
}

function createMockWeather(message: string): WeatherResponse {
  const now = Date.now();
  const location = envString("WEATHER_LOCATION_NAME", "Linköping");
  const timestamp = new Date().toISOString();

  return {
    current: {
      description: "Växlande molnighet",
      humidity: 71,
      precipitationMm: 0.2,
      temperatureC: 8,
      windKph: 13,
    },
    hourly: Array.from({ length: 48 }, (_, offset) => ({
      description: offset < 12 ? "Lätt molnigt" : "Klart",
      precipitationMm: offset === 2 ? 0.4 : 0,
      temperatureC: 8 - Math.max(0, offset - 1),
      time: new Date(now + offset * 60 * 60_000).toISOString(),
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

function getSmhiSymbolLabel(symbol: number | null): string {
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
