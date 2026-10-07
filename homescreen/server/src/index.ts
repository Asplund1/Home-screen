import fs from "fs";
import path from "path";
import express, { NextFunction, Request, Response } from "express";
import { envNumber, loadLocalEnv } from "./library/env";
import weatherRouter from "./routes/weather";
import subwayRouter from "./routes/subway";
import stockholmRouter from "./routes/stockholm";

// Vi laddar lokala miljövariabler innan resten av servern börjar läsa konfiguration.
loadLocalEnv();

// Express appen är själva backend-processen som både exponerar API och kan servera byggd frontend.
const app = express();
const clientDistPath = path.resolve(__dirname, "../../client/dist");

// Dashboarden anropas enbart från Chromium på samma Raspberry Pi. CORS behövs
// därför inte, och JSON-parsning behålls för eventuella lokala API-anrop.
app.use(express.json());

// Enkel health check för att snabbt kunna se om servern lever.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Varje domän får sin egen router för att hålla backendkoden uppdelad och läsbar.
app.use("/api/weather", weatherRouter);
app.use("/api/subway", subwayRouter);
app.use("/api/stockholm-events", stockholmRouter);

if (fs.existsSync(clientDistPath)) {
  // I produktion kan backend servera den byggda React-appen direkt från dist-mappen.
  app.use(express.static(clientDistPath));
}

app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({
    message: `The URL ${req.originalUrl} does not exist`,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = envNumber("PORT", 8080);
const HOST = "127.0.0.1";

// Endast processer på samma Raspberry Pi kan nå dashboardservern.
app.listen(PORT, HOST, () => {
  console.log(`Backend running on http://${HOST}:${PORT}`);
});
