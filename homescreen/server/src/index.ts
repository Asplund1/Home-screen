import fs from "fs";
import path from "path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { envNumber, loadLocalEnv } from "./library/env";
import weatherRouter from "./routes/weather";
import subwayRouter from "./routes/subway";

// Vi laddar lokala miljövariabler innan resten av servern börjar läsa konfiguration.
loadLocalEnv();

// Express appen är själva backend-processen som både exponerar API och kan servera byggd frontend.
const app = express();
const clientDistPath = path.resolve(__dirname, "../../client/dist");

// Grundläggande middleware för CORS och JSON bodyparsing.
app.use(cors());
app.use(express.json());

// Enkel health check för att snabbt kunna se om servern lever.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Varje domän får sin egen router för att hålla backendkoden uppdelad och läsbar.
app.use("/api/weather", weatherRouter);
app.use("/api/subway", subwayRouter);

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

// Porten kan styras via .env men har ett stabilt default-värde för lokal utveckling.
const PORT = envNumber("PORT", 8080);

// Servern lyssnar på alla nätverksinterface så att den även kan nås från Raspberry Pi/LAN.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
