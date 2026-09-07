import { Box } from "@mui/material";
import { WeatherSection } from "./sections/WeatherSection";
import { ClockSection } from "./sections/ClockSection";
import { SubwaySection } from "./sections/SubwaySection";
import { StockholmEventsSection } from "./sections/StockholmEventsSection";
import { usePollingResource } from "./hooks/usePollingResource";
import { useTicker } from "./hooks/useTicker";
import type {
  StockholmEventsData,
  SubwayData,
  WeatherData,
} from "./types/dashboard";

const weatherRefreshMs = 10 * 60_000;
const subwayRefreshMs = 30_000;
const stockholmEventsRefreshMs = 3 * 60 * 60_000;

const panelSx = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  height: "100%",
  overflow: "hidden",
  p: { xs: 1, md: 1.25 },
  borderRadius: "1.1rem",
  backgroundColor: "#121e27",
} as const;

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

  const stockholmEventsState = usePollingResource<StockholmEventsData>(
    "/api/stockholm-events",
    stockholmEventsRefreshMs,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        gridTemplateRows: {
          xs: "repeat(4, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr))",
        },
        gap: { xs: 0.75, md: 1 },
        height: "100dvh",
        overflow: "hidden",
        p: { xs: 0.75, md: 1 },
        bgcolor: "#0b1116",
        alignItems: "stretch",
      }}
    >
      <Box sx={panelSx}>
        <WeatherSection state={weatherState} />
      </Box>

      <Box sx={panelSx}>
        <SubwaySection state={subwayState} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
          p: 0.75,
          borderRadius: "1.1rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ClockSection now={now} />
      </Box>

      <Box sx={panelSx}>
        <StockholmEventsSection state={stockholmEventsState} />
      </Box>
    </Box>
  );
}
