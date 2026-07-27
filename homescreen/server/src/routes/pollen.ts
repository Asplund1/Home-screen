import { Router } from "express";
import { withCache } from "../library/cache";
import { envNumber, envString } from "../library/env";
import { buildUrl, fetchJson } from "../library/http";

type OpenMeteoAirQualityResponse = {
  latitude: number;
  longitude: number;
  timezone?: string;
  hourly?: {
    time: string[];
    alder_pollen?: Array<number | null>;
    birch_pollen?: Array<number | null>;
    grass_pollen?: Array<number | null>;
    mugwort_pollen?: Array<number | null>;
  };
};

type PollenType = {
  category: string;
  code: string;
  color: string;
  description: string;
  inSeason: boolean;
  name: string;
  recommendation: string | null;
  value: number;
};

type PollenResponse = {
  location: string;
  message: string;
  source: "open-meteo" | "mock";
  status: "fallback" | "live";
  summary: string;
  types: PollenType[];
  updatedAt: string;
};

const router = Router();

router.get("/", async (_req, res) => {
  try {
    // Pollenprognosen ändras relativt långsamt, så vi cachar den en stund.
    const cacheMs = envNumber("POLLEN_CACHE_MS", 60 * 60_000);
    const payload = await withCache("pollen", cacheMs, loadPollen);
    res.json(payload);
  } catch (error) {
    console.error("Pollen route failed:", error);
    res.json(createMockPollen("Open-Meteo kunde inte hämtas just nu."));
  }
});

async function loadPollen(): Promise<PollenResponse> {
 const latitude = envString("POLLEN_LATITUDE", "59.3544");
const longitude = envString("POLLEN_LONGITUDE", "17.8850");
const location =
  envString("POLLEN_LOCATION_NAME", "Råcksta") ?? "Råcksta";
  const timezone =
    envString("POLLEN_TIMEZONE", "Europe/Stockholm") ?? "Europe/Stockholm";

  const url = buildUrl(
    "https://air-quality-api.open-meteo.com/v1/air-quality",
    {
      latitude,
      longitude,
      timezone,
      forecast_days: 1,
      hourly: "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen",
    },
  );

  const data = await fetchJson<OpenMeteoAirQualityResponse>(url);
  const hourly = data.hourly;

  if (!hourly || !hourly.time || hourly.time.length === 0) {
    throw new Error("Open-Meteo returned no hourly pollen data.");
  }

  const currentIndex = getClosestHourIndex(hourly.time);

  const pollenTypes: PollenType[] = [
    createPollenType({
      code: "ALDER",
      name: "Al",
      value: getHourlyValue(hourly.alder_pollen, currentIndex),
    }),
    createPollenType({
      code: "BIRCH",
      name: "Björk",
      value: getHourlyValue(hourly.birch_pollen, currentIndex),
    }),
    createPollenType({
      code: "GRASS",
      name: "Gräs",
      value: getHourlyValue(hourly.grass_pollen, currentIndex),
    }),
    createPollenType({
      code: "MUGWORT",
      name: "Gråbo",
      value: getHourlyValue(hourly.mugwort_pollen, currentIndex),
    }),
  ]
    .filter((type) => type.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);

  const topType = pollenTypes[0];

  return {
    location,
    message: `Pollenprognos för ${location} från Open-Meteo.`,
    source: "open-meteo",
    status: "live",
    summary: topType
      ? `${topType.name} är högst just nu (${topType.category.toLowerCase()}).`
      : "Ingen tydlig pollenrisk hittades just nu.",
    types: pollenTypes,
    updatedAt: new Date().toISOString(),
  };
}

function getClosestHourIndex(times: string[]): number {
  const now = Date.now();

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < times.length; index += 1) {
    const timestamp = new Date(times[index]).getTime();
    const distance = Math.abs(timestamp - now);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function getHourlyValue(
  values: Array<number | null> | undefined,
  index: number,
): number {
  const value = values?.[index];

  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}

function createPollenType(input: {
  code: string;
  name: string;
  value: number;
}): PollenType {
  const level = getPollenLevel(input.value);

  return {
    category: level.label,
    code: input.code,
    color: level.color,
    description: level.description,
    inSeason: input.value > 0,
    name: input.name,
    recommendation: level.recommendation,
    value: input.value,
  };
}

function getPollenLevel(value: number): {
  label: string;
  color: string;
  description: string;
  recommendation: string | null;
} {
  if (value <= 0) {
    return {
      label: "Ingen",
      color: "#5f8d4e",
      description: "Inga tydliga pollennivåer just nu.",
      recommendation: null,
    };
  }

  if (value < 10) {
    return {
      label: "Låg",
      color: "#5f8d4e",
      description: "Låga pollennivåer.",
      recommendation: null,
    };
  }

  if (value < 50) {
    return {
      label: "Måttlig",
      color: "#d9a441",
      description: "Måttliga pollennivåer.",
      recommendation: "Var uppmärksam om du är känslig.",
    };
  }

  if (value < 100) {
    return {
      label: "Hög",
      color: "#d98032",
      description: "Höga pollennivåer.",
      recommendation: "Begränsa längre vistelser ute om du har besvär.",
    };
  }

  return {
    label: "Mycket hög",
    color: "#c94c4c",
    description: "Mycket höga pollennivåer.",
    recommendation: "Undvik onödig exponering utomhus om du är känslig.",
  };
}

function createMockPollen(message: string): PollenResponse {
  return {
    location: envString("WEATHER_LOCATION_NAME", "Linkoping") ?? "Linkoping",
    message,
    source: "mock",
    status: "fallback",
    summary: "Björk är mest relevant i demo-datan just nu.",
    types: [
      {
        category: "Måttlig",
        code: "BIRCH",
        color: "#d98032",
        description: "Måttliga pollennivåer.",
        inSeason: true,
        name: "Björk",
        recommendation: "Var uppmärksam om du är känslig.",
        value: 24,
      },
      {
        category: "Låg",
        code: "GRASS",
        color: "#5f8d4e",
        description: "Låga pollennivåer.",
        inSeason: true,
        name: "Gräs",
        recommendation: null,
        value: 4,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export default router;
