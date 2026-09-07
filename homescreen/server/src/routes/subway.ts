import { Router } from "express";
import { getRackstaSubwayDepartures } from "../library/sl";

const subwayRouter = Router();

subwayRouter.get("/", async (_req, res) => {
  try {
    const departures = await getRackstaSubwayDepartures();

    res.json({
      station: "Råcksta",
      departures,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Kunde inte hämta tunnelbaneavgångarna:", error);

    res.status(502).json({
      message: "Kunde inte hämta avgångarna från SL.",
    });
  }
});

export default subwayRouter;
