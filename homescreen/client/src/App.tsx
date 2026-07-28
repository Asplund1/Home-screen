import { Box } from "@mui/material";
import { WeatherSection } from "./sections/WeatherSection";
import { PollenSection } from "./sections/PollenSection";
import { ClockSection } from "./sections/ClockSection";
import { SubwaySection } from "./sections/SubwaySection";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type {
  PollenData,
  SubwayData,
  WeatherData,
} from "./types/dashboard";

const weatherRefreshMs = 10 * 60_000;
const pollenRefreshMs = 10 * 60_000;
const subwayRefreshMs = 30_000;
const isPollenEnabled = false;

export default function App() {
  const now = useTicker(60_000);

  const weatherState = usePollingResource<WeatherData>(
    "/api/weather",
    weatherRefreshMs,
  );

  const pollenState = usePollingResource<PollenData>(
    isPollenEnabled ? "/api/pollen" : "",
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
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gridTemplateRows: "auto auto",
        gap: 1.25,
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
        p: 1.25,
        bgcolor: "#0b1116",
        alignItems: "start",
      }}
    >
      {/* Överst till vänster */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: "1.6rem",
          height: "100%",
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
          alignSelf: "start",
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
          p: 1.25,
          borderRadius: "1.2rem",
          minHeight: 0,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ClockSection now={now} />
      </Box>

      {/* Nederst till höger */}
      {isPollenEnabled && (
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
      )}
    </Box>
  );
}