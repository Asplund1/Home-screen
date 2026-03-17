import { Box, Typography } from "@mui/material";
import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { EmptyState } from "./EmptyState";
import { formatShortTime, getStatusLabel } from "../lib/format";
import type { ResourceState, WeatherData } from "../types/dashboard";

type WeatherPanelProps = {
  state: ResourceState<WeatherData>;
};

// Väderpanelen visar nuvärdet först och detaljer i andra hand.
export function WeatherPanel(props: WeatherPanelProps) {
  const { data, error, lastLoadedAt } = props.state;

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
    <PanelFrame
      className="panel-weather"
      eyebrow="SMHI vader"
      title={data?.location ?? "Linkoping"}
      status={getStatusLabel(data?.status, error)}
      footer={
        <PanelFooter
          error={error}
          lastLoadedAt={lastLoadedAt}
          updatedAt={data?.updatedAt}
        />
      }
    >
      {data ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 18rem" },
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.35rem",
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  fontSize: { xs: "4rem", md: "6rem" },
                  fontFamily:
                    '"Avenir Next", "Segoe UI Semibold", "Trebuchet MS", sans-serif',
                }}
              >
                {data.current.temperatureC != null
                  ? data.current.temperatureC
                  : "-"}
                <Typography
                  component="span"
                  sx={{ fontSize: "1.1rem", letterSpacing: 0 }}
                >
                  °C
                </Typography>
              </Typography>
              <Typography
                sx={{
                  margin: "0.5rem 0 0",
                  color: "text.secondary",
                }}
              >
                {data.current.description}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "grid", gap: "0.35rem" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Resten av dagen
              </Typography>
              {todayForecast.length ? (
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: "0.4rem",
                  }}
                >
                  {todayForecast.map((item) => (
                    <Box
                      component="li"
                      key={item.time}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 3rem) 1fr",
                        gap: "0.5rem",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                      >
                        {formatShortTime(item.time)}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {item.temperatureC != null
                          ? `${item.temperatureC}°`
                          : "-"}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    margin: 0,
                    color: "text.secondary",
                    fontSize: "0.9rem",
                  }}
                >
                  Ingen data.
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "grid", gap: "0.35rem" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Imorgon
              </Typography>
              {tomorrowForecast.length ? (
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: "0.4rem",
                  }}
                >
                  {tomorrowForecast.map((item) => (
                    <Box
                      component="li"
                      key={item.time}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 3rem) 1fr",
                        gap: "0.5rem",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                      >
                        {formatShortTime(item.time)}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {item.temperatureC != null
                          ? `${item.temperatureC}°`
                          : "-"}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    margin: 0,
                    color: "text.secondary",
                    fontSize: "0.9rem",
                  }}
                >
                  Ingen data.
                </Typography>
              )}
            </Box>
          </Box>
        </>
      ) : (
        <EmptyState label={error ?? "Hamtar vaderdata..."} />
      )}
    </PanelFrame>
  );
}
