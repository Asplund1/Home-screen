import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import type { SubwayData } from "../types/dashboard";

type SubwayPanelProps = {
  data: SubwayData | null;
  onEmpty: React.ReactNode;
};

export function SubwayPanel({
  data,
  onEmpty,
}: SubwayPanelProps) {
  if (!data) {
    return onEmpty;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Icon icon="mdi:subway-variant" width={32} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Tunnelbana
          </Typography>

          <Typography color="text.secondary">
            Avgångar från {data.station}
          </Typography>
        </Box>
      </Box>

      {data.departures.length > 0 ? (
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
          }}
        >
          {data.departures.map((departure) => (
            <Box
              component="li"
              key={departure.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "48px 1fr auto",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  backgroundColor: "#16833b",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {departure.line || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {departure.destination}
                </Typography>

                {departure.platform && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Spår {departure.platform}
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color:
                    departure.state === "CANCELLED"
                      ? "error.main"
                      : "text.primary",
                }}
              >
                {departure.departureTime}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">
          Inga kommande tunnelbaneavgångar.
        </Typography>
      )}
    </Box>
  );
}