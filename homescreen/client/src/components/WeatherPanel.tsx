import { Box, Typography } from "@mui/material";
import { formatShortTime } from "../library/format";
import type { WeatherData } from "../types/dashboard";

type WeatherPanelProps = {
  data: WeatherData | null;
  todayForecast: WeatherData["hourly"];
  tomorrowForecast: WeatherData["hourly"];
  onEmpty: React.ReactNode;
};

// Pure presentational component för väderdata
export function WeatherPanel({
  data,
  todayForecast,
  tomorrowForecast,
  onEmpty,
}: WeatherPanelProps) {
  if (!data) {
    return onEmpty;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: "4rem", md: "6rem" } }}>
            {data.current.temperatureC != null
              ? data.current.temperatureC
              : "-"}
            <Typography component="span"> °C</Typography>
          </Typography>
          <Typography color="text.secondary">
            {data.current.description}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Soluppgång:{" "}
            {data.current.sunrise ? formatShortTime(data.current.sunrise) : "-"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solnedgång:{" "}
            {data.current.sunset ? formatShortTime(data.current.sunset) : "-"}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 3 }}
      >
        {[
          { title: "Resten av dagen", items: todayForecast },
          { title: "Imorgon", items: tomorrowForecast },
        ].map((section) => (
          <Box key={section.title}>
            <Typography fontWeight="bold">{section.title}</Typography>

            {section.items.length ? (
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {section.items.map((item) => (
                  <Box
                    component="li"
                    key={item.time}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto auto 1fr",
                      gap: 1,
                    }}
                  >
                    <Typography color="text.secondary">
                      {formatShortTime(item.time)}
                    </Typography>

                    <Typography fontWeight="bold">
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
