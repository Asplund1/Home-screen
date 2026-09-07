import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import type { SubwayData } from "../types/dashboard";

type SubwayPanelProps = {
  data: SubwayData | null;
  onEmpty: React.ReactNode;
};

export function SubwayPanel({ data, onEmpty }: SubwayPanelProps) {
  if (!data) {
    return onEmpty;
  }

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
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          flexShrink: 0,
        }}
      >
        <Icon icon="mdi:subway-variant" width={26} />

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Tunnelbana
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
            Avgångar från {data.station}
          </Typography>
        </Box>
      </Box>

      {data.departures.length > 0 ? (
        <Box
          component="ul"
          sx={{
            display: "grid",
            flex: 1,
            gridTemplateRows: `repeat(${data.departures.length}, minmax(0, 1fr))`,
            listStyle: "none",
            minHeight: 0,
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
                gridTemplateColumns: "36px minmax(0, 1fr) auto",
                alignItems: "center",
                gap: 1,
                py: 0.85,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "#16833b",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                  {departure.line || "-"}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {departure.destination}
                </Typography>

                {departure.platform && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.78rem" }}
                  >
                    Spår {departure.platform}
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color:
                    departure.state === "CANCELLED"
                      ? "error.main"
                      : "text.primary",
                  whiteSpace: "nowrap",
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
