import { Box } from "@mui/material";
import { WeatherSection } from "./sections/WeatherSection";
import { ClockSection } from "./sections/ClockSection";
import { SubwaySection } from "./sections/SubwaySection";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type { SubwayData, WeatherData } from "./types/dashboard";

const weatherRefreshMs = 10 * 60_000;
const subwayRefreshMs = 30_000;

export default function App() {
  const now = useTicker(60_000);

  const weatherState = usePollingResource<WeatherData>(
    "/api/weather",
    weatherRefreshMs,
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
    </Box>
  );
}
