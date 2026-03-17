import { PanelFooter } from "../components/PanelFooter";
import { EmptyState } from "../components/EmptyState";
import { WeatherPanel } from "../components/WeatherPanel";

import type { ResourceState, WeatherData } from "../types/dashboard";
import { Box } from "@mui/material";

type WeatherSectionProps = {
  state: ResourceState<WeatherData>;
};

export function WeatherSection({ state }: WeatherSectionProps) {
  const { data, error, lastLoadedAt } = state;

  const pad = (value: number) => value.toString().padStart(2, "0");
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const now = new Date();
  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(new Date(now.getTime() + 24 * 60 * 60_000));

  const todayForecast =
    data?.hourly
      .filter((item) => dateKey(new Date(item.time)) === todayKey)
      .slice(0, 4) ?? [];
  const tomorrowForecast =
    data?.hourly
      .filter((item) => dateKey(new Date(item.time)) === tomorrowKey)
      .slice(0, 4) ?? [];

  return (
    <Box>
      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        updatedAt={data?.updatedAt}
      />

      <WeatherPanel
        data={data ?? null}
        todayForecast={todayForecast}
        tomorrowForecast={tomorrowForecast}
        onEmpty={<EmptyState label={error ?? "Hämtar väderdata..."} />}
      />
    </Box>
  );
}
