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
  p: 1.5,
  borderRadius: 2,
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

  const fixedForecastHours = [8, 12, 16, 20];

  const todayFixedForecast = filterForecastByHours(
    todayForecast,
    fixedForecastHours,
  );

  const tomorrowFixedForecast = filterForecastByHours(
    tomorrowForecast,
    fixedForecastHours,
  );

  const sections = [
    { title: "Idag", items: todayFixedForecast },
    { title: "Imorgon", items: tomorrowFixedForecast },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
          gap: 3,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "4rem", md: "6rem" },
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            {data.current.temperatureC != null
              ? data.current.temperatureC
              : "-"}
            <Box component="span" sx={{ fontSize: "0.45em", ml: 0.5 }}>
              °C
            </Box>
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {data.current.description}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            minWidth: { md: 220 },
          }}
        >
          <Box sx={sunCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Icon
                icon="mdi:weather-sunset-up"
                width={18}
                style={{ color: "#f5b942" }}
              />
              <Typography variant="caption" color="text.secondary">
                Soluppgång
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, mt: 0.75 }}>
              {data.current.sunrise
                ? formatShortTime(data.current.sunrise)
                : "-"}
            </Typography>
          </Box>

          <Box sx={sunCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Icon
                icon="mdi:weather-sunset-down"
                width={18}
                style={{ color: "#f5b942" }}
              />
              <Typography variant="caption" color="text.secondary">
                Solnedgång
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, mt: 0.75 }}>
              {data.current.sunset ? formatShortTime(data.current.sunset) : "-"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mt: 4,
        }}
      >
        {sections.map((section) => (
          <Box key={section.title}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              {section.title}
            </Typography>

            {section.items.length > 0 ? (
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {section.items.map((item) => (
                  <Box
                    component="li"
                    key={item.time}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto auto 1fr",
                      gap: 1.5,
                      py: 0.75,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      {formatShortTime(item.time)}
                    </Typography>

                    <Typography sx={{ fontWeight: 700, minWidth: 42 }}>
                      {item.temperatureC != null
                        ? `${item.temperatureC}°`
                        : "-"}
                    </Typography>

                    <Typography color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">Ingen data.</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
