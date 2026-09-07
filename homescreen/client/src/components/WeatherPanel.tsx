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

const sunCardStyles = {
  p: 1,
  borderRadius: 1.25,
  backgroundColor: "rgba(63, 63, 63, 0.04)",
  border: "1px solid rgba(118, 116, 190, 0.44)",
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
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.25,
          mt: 1.25,
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
