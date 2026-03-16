import "./App.css";
import { GlucosePanel } from "./components/GlucosePanel";
import { PollenPanel } from "./components/PollenPanel";
import { WeatherPanel } from "./components/WeatherPanel";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import { formatClock } from "./lib/format";
import type { GlucoseData, PollenData, WeatherData } from "./types/dashboard";

const weatherRefreshMs = 10 * 60_000;
const glucoseRefreshMs = 60_000;
const pollenRefreshMs = 60 * 60_000;

// App-komponenten ansvarar nu bara för att koppla ihop hooks och presentera panelerna.
export default function App() {
  const now = useTicker(1_000);
  const weatherState = usePollingResource<WeatherData>("/api/weather", weatherRefreshMs);
  const glucoseState = usePollingResource<GlucoseData>("/api/glucose", glucoseRefreshMs);
  const pollenState = usePollingResource<PollenData>("/api/pollen", pollenRefreshMs);

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <div className="clock-overlay">{formatClock(now)}</div>

      <main className="dashboard-grid">
        <WeatherPanel state={weatherState} />
        <GlucosePanel state={glucoseState} />
        <PollenPanel state={pollenState} />
      </main>
    </div>
  );
}
