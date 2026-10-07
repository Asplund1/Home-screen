import { Router } from "express";
import { withCache, type CacheResult } from "../library/cache";
import { envNumber } from "../library/env";
import {
  getRackstaSubwayDepartures,
  getRackstaSubwayDisruptions,
  type SubwayDeparture,
  type SubwayDisruption,
} from "../library/sl";

const subwayRouter = Router();

type TimedDepartures = {
  departures: SubwayDeparture[];
  updatedAt: string;
};

type TimedDisruptions = {
  disruptions: SubwayDisruption[];
  updatedAt: string;
};

subwayRouter.get("/", async (_req, res) => {
  try {
    const departuresCacheMs = envNumber("SUBWAY_DEPARTURES_CACHE_MS", 30_000);
    const disruptionsCacheMs = envNumber("SUBWAY_DEVIATIONS_CACHE_MS", 60_000);

    const departuresResult = await withCache<TimedDepartures>(
      "subway-departures",
      departuresCacheMs,
      loadDepartures,
    );

    const disruptionsResult = await loadDisruptionsSafely(disruptionsCacheMs);

    res.json({
      station: "Råcksta",
      departures: departuresResult.value.departures,
      disruptions: disruptionsResult?.value.disruptions ?? [],
      disruptionsStale: disruptionsResult?.stale ?? true,
      disruptionsUpdatedAt: disruptionsResult?.value.updatedAt,
      status: departuresResult.stale ? "stale" : "live",
      updatedAt: departuresResult.value.updatedAt,
    });
  } catch (error) {
    console.error("Kunde inte hämta tunnelbaneavgångarna:", error);

    res.status(502).json({
      message:
        "Kunde inte hämta avgångarna från SL och ingen sparad avgångsdata finns ännu.",
    });
  }
});

async function loadDepartures(): Promise<TimedDepartures> {
  const departures = await getRackstaSubwayDepartures();
  return {
    departures,
    updatedAt: new Date().toISOString(),
  };
}

async function loadDisruptions(): Promise<TimedDisruptions> {
  const disruptions = await getRackstaSubwayDisruptions();
  return {
    disruptions,
    updatedAt: new Date().toISOString(),
  };
}

async function loadDisruptionsSafely(
  cacheMs: number,
): Promise<CacheResult<TimedDisruptions> | null> {
  try {
    return await withCache<TimedDisruptions>(
      "subway-disruptions",
      cacheMs,
      loadDisruptions,
    );
  } catch (error) {
    // Disruptions add context, but must never make fresh departure data unusable.
    console.error("Kunde inte hämta störningsinformation från SL:", error);
    return null;
  }
}

export default subwayRouter;
