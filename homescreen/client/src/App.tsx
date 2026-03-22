import { Box } from "@mui/material";
import { WeatherSection } from "./sections/WeatherSection";
import { GlucoseSection } from "./sections/GlucoseSection";
import { PollenSection } from "./sections/PollenSection";
import { ClockSection } from "./sections/ClockSection";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type { GlucoseData, PollenData, WeatherData } from "./types/dashboard";

const weatherRefreshMs = 30 * 60_000;
const glucoseRefreshMs = 60 * 60_000; // 1 timme
const pollenRefreshMs = 60 * 60_000;

// App-komponenten ansvarar nu bara för att koppla ihop hooks och presentera panelerna.
export default function App() {
  const now = useTicker(60 * 60 * 1000);
  const weatherState = usePollingResource<WeatherData>(
    "/api/weather",
    weatherRefreshMs,
  );
  const glucoseState = usePollingResource<GlucoseData>(
    "/api/glucose",
    glucoseRefreshMs,
  );
  const pollenState = usePollingResource<PollenData>(
    "/api/pollen",
    pollenRefreshMs,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
        }}
      >
        <WeatherSection state={weatherState} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
        }}
      >
        <PollenSection state={pollenState} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
        }}
      >
        <GlucoseSection state={glucoseState} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
        }}
      >
        <ClockSection now={now} />
      </Box>
    </Box>
  );
}
