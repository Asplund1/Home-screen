import { Router } from "express";
import { withCache } from "../library/cache";
import { envNumber } from "../library/env";
import { buildUrl, fetchJson } from "../library/http";
import {
  buildStockholmEventsResponse,
  type StockholmEventsResponse,
  type VisitStockholmEvent,
} from "../library/stockholmEvents";

type VisitStockholmEventsResponse = {
  count: number;
  results: VisitStockholmEvent[];
};

const router = Router();
const VISIT_STOCKHOLM_EVENTS_URL =
  "https://api.visitstockholm.com/api/public-v1/events/";

router.get("/", async (_req, res) => {
  try {
    const cacheMs = envNumber("STOCKHOLM_EVENTS_CACHE_MS", 3 * 60 * 60_000);
    const payload = await withCache("stockholm-events", cacheMs, loadEvents);

    res.json(payload);
  } catch (error) {
    console.error("Stockholm events route failed:", error);
    res.status(502).json({
      message: "Kunde inte hämta events från Visit Stockholm.",
    });
  }
});

async function loadEvents(): Promise<StockholmEventsResponse> {
  const fetchSize = envNumber("STOCKHOLM_EVENTS_FETCH_SIZE", 300);
  const maxEvents = envNumber("STOCKHOLM_EVENTS_MAX_ITEMS", 5);
  const url = buildUrl(VISIT_STOCKHOLM_EVENTS_URL, {
    page: 1,
    size: fetchSize,
  });

  const data = await fetchJson<VisitStockholmEventsResponse>(url);
  return buildStockholmEventsResponse(data.results, maxEvents);
}

export default router;
