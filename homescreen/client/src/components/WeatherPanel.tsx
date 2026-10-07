import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { formatShortTime } from "../library/format";
import type { WeatherData } from "../types/dashboard";

type WeatherPanelProps = {
  data: WeatherData | null;
  todayForecast: WeatherData["hourly"];
  tomorrowForecast: WeatherData["hourly"];
  onEmpty: React.ReactNode;
};

type WeatherInsight = {
  icon: string;
  label: string;
  value: string;
};

const precipitationThresholdMm = 0.2;
const rainLookaheadMs = 8 * 60 * 60_000;

const sunCardStyles = {
  p: 1,
  borderRadius: 1.25,
  backgroundColor: "rgba(63, 63, 63, 0.04)",
  border: "1px solid rgba(118, 116, 190, 0.44)",
};

const insightCardStyles = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "center",
  columnGap: 0.6,
  minWidth: 0,
  px: 0.7,
  py: 0.45,
  borderRadius: 1,
  backgroundColor: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.07)",
};

function filterForecastByHours(
  items: WeatherData["hourly"],
  hours: number[],
): WeatherData["hourly"] {
  const allowedHours = new Set(
    hours.map((hour) => String(hour).padStart(2, "0")),
  );

  return items.filter((item) => {
    const hour = item.time.slice(11, 13);
    return allowedHours.has(hour);
  });
}

export function WeatherPanel({
  data,
  todayForecast,
  tomorrowForecast,
  onEmpty,
}: WeatherPanelProps) {
  if (!data) {
    return onEmpty;
  }

  const fixedForecastHours = [8, 12, 16, 20, 22];
  const sections = [
    {
      title: "Idag",
      items: filterForecastByHours(todayForecast, fixedForecastHours),
    },
    {
      title: "Imorgon",
      items: filterForecastByHours(tomorrowForecast, fixedForecastHours),
    },
  ];
  const insights = buildWeatherInsights(data);

  return (
    <Box
      sx={{
        p: 1.25,
        flex: 1,
        minHeight: 0,
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: "3.25rem", md: "4.25rem" },
              lineHeight: 0.95,
              fontWeight: 700,
            }}
          >
            {data.current.temperatureC != null
              ? data.current.temperatureC
              : "-"}
            <Box component="span" sx={{ fontSize: "0.42em", ml: 0.5 }}>
              °C
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {data.current.description}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0.75,
            width: { xs: 178, md: 200 },
          }}
        >
          <Box sx={sunCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Icon
                icon="mdi:weather-sunset-up"
                width={16}
                style={{ color: "#f5b942" }}
              />
              <Typography variant="caption" color="text.secondary">
                Upp
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
              {data.current.sunrise
                ? formatShortTime(data.current.sunrise)
                : "-"}
            </Typography>
          </Box>

          <Box sx={sunCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Icon
                icon="mdi:weather-sunset-down"
                width={16}
                style={{ color: "#f5b942" }}
              />
              <Typography variant="caption" color="text.secondary">
                Ner
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
              {data.current.sunset ? formatShortTime(data.current.sunset) : "-"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 0.55,
          mt: 0.75,
          flexShrink: 0,
        }}
      >
        {insights.map((insight) => (
          <Box key={insight.label} sx={insightCardStyles}>
            <Icon icon={insight.icon} width={17} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.66rem",
                  lineHeight: 1.05,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {insight.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mt: 0.15,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {insight.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.25,
          mt: 0.75,
          flex: 1,
          minHeight: 0,
        }}
      >
        {sections.map((section) => (
          <Box
            key={section.title}
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.95rem" }}>
              {section.title}
            </Typography>

            {section.items.length > 0 ? (
              <Box
                component="ul"
                sx={{
                  display: "grid",
                  flex: 1,
                  gridTemplateRows: `repeat(${section.items.length}, minmax(0, 1fr))`,
                  listStyle: "none",
                  minHeight: 0,
                  p: 0,
                  m: 0,
                }}
              >
                {section.items.map((item) => (
                  <Box
                    component="li"
                    key={item.time}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2.6rem 2.4rem minmax(0, 1fr)",
                      gap: 0.75,
                      py: 0.3,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary" sx={{ fontSize: "0.86rem" }}>
                      {formatShortTime(item.time)}
                    </Typography>

                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      {item.temperatureC != null ? `${item.temperatureC}°` : "-"}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: "0.86rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ fontSize: "0.86rem" }}>
                Ingen data.
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function buildWeatherInsights(data: WeatherData): WeatherInsight[] {
  const now = Date.now();
  const currentPrecipitation = data.current.precipitationMm ?? 0;
  const futurePrecipitation = data.hourly.find((item) => {
    const itemTime = Date.parse(item.time);
    return (
      Number.isFinite(itemTime) &&
      itemTime > now &&
      itemTime <= now + rainLookaheadMs &&
      (item.precipitationMm ?? 0) >= precipitationThresholdMm
    );
  });

  const precipitationSummary = getPrecipitationSummary(
    currentPrecipitation,
    data.current.description,
    futurePrecipitation,
    now,
  );

  const umbrellaNeeded =
    currentPrecipitation >= precipitationThresholdMm ||
    (futurePrecipitation
      ? Date.parse(futurePrecipitation.time) <= now + 6 * 60 * 60_000
      : false);

  return [
    {
      icon: umbrellaNeeded ? "mdi:umbrella" : "mdi:umbrella-closed",
      label: umbrellaNeeded ? "Paraply" : "Nederbörd",
      value: precipitationSummary,
    },
    {
      icon: "mdi:weather-windy",
      label: "Vind",
      value:
        data.current.windKph != null
          ? `${formatNumber(data.current.windKph)} km/h`
          : "-",
    },
    {
      icon: "mdi:weather-rainy",
      label: "Nu",
      value: `${formatNumber(currentPrecipitation)} mm`,
    },
    {
      icon: "mdi:water-percent",
      label: "Luftfuktighet",
      value:
        data.current.humidity != null
          ? `${formatNumber(data.current.humidity)} %`
          : "-",
    },
  ];
}

function getPrecipitationSummary(
  currentPrecipitation: number,
  currentDescription: string,
  nextPrecipitation: WeatherData["hourly"][number] | undefined,
  now: number,
): string {
  if (currentPrecipitation >= precipitationThresholdMm) {
    return isSnowDescription(currentDescription) ? "Snö nu" : "Regn nu";
  }

  if (!nextPrecipitation) {
    return "Torrt 8 h";
  }

  const nextTime = Date.parse(nextPrecipitation.time);
  const hoursUntil = Math.max(1, Math.round((nextTime - now) / 60 / 60_000));
  const precipitationType = isSnowDescription(nextPrecipitation.description)
    ? "Snö"
    : "Regn";

  return `${precipitationType} om ~${hoursUntil} h`;
}

function isSnowDescription(description: string): boolean {
  return /snö/i.test(description);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 1,
  }).format(value);
}
