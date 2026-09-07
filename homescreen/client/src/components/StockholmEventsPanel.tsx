import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { formatEventDate } from "../library/format";
import type { StockholmEvent, StockholmEventsData } from "../types/dashboard";

type StockholmEventsPanelProps = {
  data: StockholmEventsData | null;
  onEmpty: React.ReactNode;
};

const eventMeta: Record<
  StockholmEvent["selectionType"],
  { color: string; icon: string; label: string }
> = {
  featured: {
    color: "#ff9f43",
    icon: "mdi:fire",
    label: "Stort",
  },
  recommended: {
    color: "#7dd3fc",
    icon: "mdi:sparkles",
    label: "Tips",
  },
  wildcard: {
    color: "#facc15",
    icon: "mdi:dice-5",
    label: "Wildcard",
  },
};

export function StockholmEventsPanel({
  data,
  onEmpty,
}: StockholmEventsPanelProps) {
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
        <Icon icon="mdi:calendar-star" width={26} />

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Vad händer i Stockholm?
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: "0.86rem" }}>
            Musik, mat och kvällshäng i veckan
          </Typography>
        </Box>
      </Box>

      {data.events.length > 0 ? (
        <Box
          component="ul"
          sx={{
            display: "grid",
            flex: 1,
            gridTemplateRows: `repeat(${data.events.length}, minmax(0, 1fr))`,
            listStyle: "none",
            minHeight: 0,
            p: 0,
            m: 0,
          }}
        >
          {data.events.map((event) => {
            const meta = eventMeta[event.selectionType];

            return (
              <Box
                component="li"
                key={event.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 9.5rem",
                  gap: 1,
                  py: 0.85,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  alignItems: "center",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "4.4rem minmax(0, 1fr)",
                      gap: 0.65,
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.25,
                        color: meta.color,
                        minWidth: 0,
                      }}
                    >
                      <Icon icon={meta.icon} width={13} />
                      <Typography
                        sx={{
                          color: "inherit",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          lineHeight: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {meta.label}
                      </Typography>
                    </Box>

                    <Typography
                      component={event.url ? "a" : "p"}
                      href={event.url}
                      target={event.url ? "_blank" : undefined}
                      rel={event.url ? "noreferrer" : undefined}
                      sx={{
                        color: "text.primary",
                        display: "block",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        overflow: "hidden",
                        textDecoration: "none",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:hover": event.url
                          ? {
                              color: "primary.main",
                            }
                          : undefined,
                      }}
                    >
                      {event.title}
                    </Typography>
                  </Box>

                  {event.location && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.78rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.location}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    justifyItems: "end",
                    alignContent: "start",
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      textAlign: "right",
                      lineHeight: 1.25,
                    }}
                  >
                    {formatEventDate(
                      event.startDate,
                      event.startTime,
                      event.endDate,
                      event.endTime,
                    )}
                  </Typography>

                  {event.category && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.76rem",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.category}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography color="text.secondary">
          Inga events hittades för den här veckan.
        </Typography>
      )}
    </Box>
  );
}
