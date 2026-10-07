import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import type { SubwayData, SubwayDisruption } from "../types/dashboard";

type SubwayPanelProps = {
  data: SubwayData | null;
  onEmpty: React.ReactNode;
};

export function SubwayPanel({ data, onEmpty }: SubwayPanelProps) {
  if (!data) {
    return onEmpty;
  }

  const primaryDisruption = data.disruptions[0];
  const visibleDepartures = primaryDisruption
    ? data.departures.slice(0, 4)
    : data.departures;

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
          mb: 0.75,
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

      {primaryDisruption ? (
        <DisruptionAlert
          disruption={primaryDisruption}
          isStale={data.disruptionsStale}
          additionalCount={Math.max(0, data.disruptions.length - 1)}
        />
      ) : data.disruptionsStale ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            mb: 0.55,
            flexShrink: 0,
          }}
        >
          <Icon icon="mdi:cloud-alert-outline" width={15} />
          <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            Störningsinfo kunde inte uppdateras.
          </Typography>
        </Box>
      ) : null}

      {visibleDepartures.length > 0 ? (
        <Box
          component="ul"
          sx={{
            display: "grid",
            flex: 1,
            gridTemplateRows: `repeat(${visibleDepartures.length}, minmax(0, 1fr))`,
            listStyle: "none",
            minHeight: 0,
            p: 0,
            m: 0,
          }}
        >
          {visibleDepartures.map((departure) => (
            <Box
              component="li"
              key={departure.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "36px minmax(0, 1fr) auto",
                alignItems: "center",
                gap: 1,
                py: primaryDisruption ? 0.45 : 0.85,
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

type DisruptionAlertProps = {
  additionalCount: number;
  disruption: SubwayDisruption;
  isStale: boolean;
};

function DisruptionAlert({
  additionalCount,
  disruption,
  isStale,
}: DisruptionAlertProps) {
  const tone = getDisruptionTone(disruption.severity);
  const details = [disruption.scope, disruption.details]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      title={details}
      sx={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: 0.65,
        alignItems: "center",
        px: 0.75,
        py: 0.55,
        mb: 0.65,
        flexShrink: 0,
        borderRadius: 1,
        backgroundColor: tone.background,
        border: `1px solid ${tone.border}`,
      }}
    >
      <Icon icon="mdi:alert-circle-outline" width={19} />

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            lineHeight: 1.15,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {disruption.title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: "0.7rem",
            lineHeight: 1.15,
            mt: 0.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isStale ? "Kan vara inaktuell · " : ""}
          {details}
        </Typography>
      </Box>

      {additionalCount > 0 && (
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
          +{additionalCount}
        </Typography>
      )}
    </Box>
  );
}

function getDisruptionTone(severity: SubwayDisruption["severity"]): {
  background: string;
  border: string;
} {
  switch (severity) {
    case "high":
      return {
        background: "rgba(211, 47, 47, 0.14)",
        border: "rgba(239, 83, 80, 0.55)",
      };
    case "medium":
      return {
        background: "rgba(245, 124, 0, 0.13)",
        border: "rgba(255, 167, 38, 0.5)",
      };
    default:
      return {
        background: "rgba(255, 193, 7, 0.08)",
        border: "rgba(255, 213, 79, 0.35)",
      };
  }
}
