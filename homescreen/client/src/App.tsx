import { Box } from "@mui/material";
import { GlucosePanel } from "./components/GlucosePanel";
import { PollenPanel } from "./components/PollenPanel";
import { WeatherPanel } from "./components/WeatherPanel";
import { ClockPanel } from "./components/ClockPanel";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type { GlucoseData, PollenData, WeatherData } from "./types/dashboard";

const weatherRefreshMs = 30 * 60_000;
const glucoseRefreshMs = 60 * 60_000; // 1 timme
const pollenRefreshMs = 60 * 60_000;

// App-komponenten ansvarar nu bara för att koppla ihop hooks och presentera panelerna.
export default function App() {
  const now = useTicker(1_000);
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
        position: "relative",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "1fr",
        overflow: "hidden",
        padding: { xs: 1, sm: 1.5, md: 2 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-8rem",
          right: "-6rem",
          width: "22rem",
          height: "22rem",
          borderRadius: "999px",
          background: "rgba(29, 145, 175, 0.35)",
          filter: "blur(48px)",
          opacity: 0.55,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-10rem",
          left: "-8rem",
          width: "26rem",
          height: "26rem",
          borderRadius: "999px",
          background: "rgba(128, 81, 194, 0.28)",
          filter: "blur(48px)",
          opacity: 0.55,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gridTemplateRows: { xs: "repeat(4, auto)", md: "1fr 1fr" },
          gridTemplateAreas: {
            xs: `
              "weather"
              "glucose"
              "pollen"
              "clock"
            `,
            md: `
              "weather glucose"
              "pollen clock"
            `,
          },
          gap: 2,
        }}
      >
        <Box sx={{ gridArea: "weather" }}>
          <WeatherPanel state={weatherState} />
        </Box>
        <Box sx={{ gridArea: "glucose" }}>
          <GlucosePanel state={glucoseState} />
        </Box>
        <Box sx={{ gridArea: "pollen" }}>
          <PollenPanel state={pollenState} />
        </Box>
        <Box sx={{ gridArea: "clock" }}>
          <ClockPanel now={now} />
        </Box>
      </Box>
    </Box>
  );
}
