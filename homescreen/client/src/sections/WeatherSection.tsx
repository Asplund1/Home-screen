import { Box } from "@mui/material";
import { PanelFooter } from "../components/PanelFooter";
import { EmptyState } from "../components/EmptyState";
import { WeatherPanel } from "../components/WeatherPanel";
import type { ResourceState, WeatherData } from "../types/dashboard";

type WeatherSectionProps = {
  state: ResourceState<WeatherData>;
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getItemDateKey(value: string): string {
  return value.slice(0, 10);
}

export function WeatherSection({ state }: WeatherSectionProps) {
  const { data, error, lastLoadedAt } = state;

  const now = new Date();
  const todayKey = getDateKey(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowKey = getDateKey(tomorrow);

  const todayForecast =
    data?.hourly.filter((item) => getItemDateKey(item.time) === todayKey) ?? [];

  const tomorrowForecast =
    data?.hourly.filter((item) => getItemDateKey(item.time) === tomorrowKey) ??
    [];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",

      }}
    >
      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        updatedAt={data?.updatedAt}
      />

      <Box>
        <WeatherPanel
          data={data ?? null}
          todayForecast={todayForecast}
          tomorrowForecast={tomorrowForecast}
          onEmpty={<EmptyState label={error ?? "Hämtar väderdata..."} />}
        />
      </Box>
    </Box>
  );
}
