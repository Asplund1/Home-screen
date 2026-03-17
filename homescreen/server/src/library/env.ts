import fs from "fs";
import path from "path";

// Serverroten används för att hitta .env-filer och andra lokala resurser oavsett om koden körs från src eller dist.
export const SERVER_ROOT = path.resolve(__dirname, "../..");

const ENV_FILES = [".env.local", ".env"];
let hasLoadedLocalEnv = false;

export function loadLocalEnv(): void {
  // Vi vill bara läsa in filerna en gång per processstart.
  if (hasLoadedLocalEnv) {
    return;
  }

  hasLoadedLocalEnv = true;

  for (const filename of ENV_FILES) {
    const filePath = path.join(SERVER_ROOT, filename);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    // Varje rad tolkas som KEY=VALUE på ett enkelt och dependency-fritt sätt.
    const fileContents = fs.readFileSync(filePath, "utf8");
    for (const rawLine of fileContents.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      // Befintliga miljövariabler vinner alltid över filinnehåll.
      if (!key || process.env[key] !== undefined) {
        continue;
      }

      let value = line.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value.replace(/\\n/gu, "\n");
    }
  }
}

export function envString(key: string, fallback = ""): string {
  loadLocalEnv();
  return process.env[key] ?? fallback;
}

export function envNumber(key: string, fallback: number): number {
  loadLocalEnv();
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function envBoolean(key: string, fallback = false): boolean {
  loadLocalEnv();
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  // Flera vanliga "sanna" strängvärden stöds för att göra konfigurationen mer tolerant.
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
