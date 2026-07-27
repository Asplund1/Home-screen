import { Box } from "@mui/material";
import { WeatherSection } from "./sections/WeatherSection";
import { GlucoseSection } from "./sections/GlucoseSection";
import { PollenSection } from "./sections/PollenSection";
import { ClockSection } from "./sections/ClockSection";
import { SubwaySection } from "./sections/SubwaySection";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type {
  GlucoseData,
  PollenData,
  SubwayData,
  WeatherData,
} from "./types/dashboard";

const weatherRefreshMs = 10 * 60_000;
const glucoseRefreshMs = 10 * 60_000;
const pollenRefreshMs = 10 * 60_000;
const subwayRefreshMs = 30_000;

// Ändra till true när glukospanelen ska visas igen.
const showGlucose = false;

export default function App() {
  const now = useTicker(60_000);

  const weatherState = usePollingResource<WeatherData>(
    "/api/weather",
    weatherRefreshMs,
  );

  const glucoseState = usePollingResource<GlucoseData>(
    "/api/glucose",
    glucoseRefreshMs,
    showGlucose,
  );

  const pollenState = usePollingResource<PollenData>(
    "/api/pollen",
    pollenRefreshMs,
  );

  const subwayState = usePollingResource<SubwayData>(
    "/api/subway",
    subwayRefreshMs,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        minHeight: "100vh",
        p: 2,
      }}
    >
      {/* Överst till vänster */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
          backgroundColor: "#121e27",
        }}
      >
        <WeatherSection state={weatherState} />
      </Box>

      {/* Överst till höger */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
          backgroundColor: "#121e27",
        }}
      >
        <SubwaySection state={subwayState} />
      </Box>

      {/* Nederst till vänster */}
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

      {/* Nederst till höger */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          minHeight: 0,
          backgroundColor: "#121e27",
        }}
      >
        <PollenSection state={pollenState} />
      </Box>

      {/* Koden finns kvar men panelen visas bara när showGlucose är true. */}
      {showGlucose && (
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
      )}
    </Box>
  );
}