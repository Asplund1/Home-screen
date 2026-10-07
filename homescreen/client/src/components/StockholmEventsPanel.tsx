import { useState } from "react";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { formatEventDate } from "../library/format";
import type { StockholmEvent, StockholmEventsData } from "../types/dashboard";

type StockholmEventsPanelProps = {
  data: StockholmEventsData | null;
  onEmpty: React.ReactNode;
};

export function StockholmEventsPanel({
  data,
  onEmpty,
}: StockholmEventsPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<StockholmEvent | null>(null);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);

  if (!data) {
    return onEmpty;
  }

  const openQr = (event: StockholmEvent) => {
    if (!event.url) {
      return;
    }

    setQrLoadFailed(false);
    setSelectedEvent(event);
  };

  const closeQr = () => {
    setSelectedEvent(null);
    setQrLoadFailed(false);
  };

  return (
    <>
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

          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Vad händer i Stockholm
          </Typography>
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
            {data.events.map((event) => (
              <Box
                component="li"
                key={event.id}
                role={event.url ? "button" : undefined}
                tabIndex={event.url ? 0 : undefined}
                onClick={event.url ? () => openQr(event) : undefined}
                onKeyDown={
                  event.url
                    ? (keyboardEvent) => {
                        if (
                          keyboardEvent.key === "Enter" ||
                          keyboardEvent.key === " "
                        ) {
                          keyboardEvent.preventDefault();
                          openQr(event);
                        }
                      }
                    : undefined
                }
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 9.5rem",
                  gap: 1,
                  px: event.url ? 0.45 : 0,
                  py: 0.7,
                  mx: event.url ? -0.45 : 0,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: event.url ? 0.75 : 0,
                  alignItems: "center",
                  cursor: event.url ? "pointer" : "default",
                  touchAction: "manipulation",
                  transition: "background-color 120ms ease",
                  "&:hover": event.url
                    ? { backgroundColor: "rgba(255,255,255,0.045)" }
                    : undefined,
                  "&:focus-visible": event.url
                    ? {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "-2px",
                      }
                    : undefined,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.55, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "text.primary",
                        display: "block",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {event.title}
                    </Typography>
                    {event.url && (
                      <Box
                        component="span"
                        aria-label="Visa QR-kod"
                        sx={{ display: "inline-flex", flexShrink: 0, color: "text.secondary" }}
                      >
                        <Icon icon="mdi:qrcode" width={16} />
                      </Box>
                    )}
                  </Box>

                  {event.location && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.88rem",
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
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Inga events hittades för den här veckan.
          </Typography>
        )}
      </Box>

      <Dialog
        open={Boolean(selectedEvent)}
        onClose={closeQr}
        aria-labelledby="event-qr-title"
        slotProps={{
          paper: {
            sx: {
              width: "min(88vw, 360px)",
              m: 1.5,
              borderRadius: 2,
              backgroundColor: "#121e27",
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.25,
            p: 2.25,
            pt: 3.25,
          }}
        >
          <IconButton
            aria-label="Stäng QR-kod"
            onClick={closeQr}
            sx={{ position: "absolute", top: 5, right: 5 }}
          >
            <Icon icon="mdi:close" width={22} />
          </IconButton>

          <Typography
            id="event-qr-title"
            sx={{ fontWeight: 700, textAlign: "center", pr: 1.5 }}
          >
            {selectedEvent?.title}
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: "0.85rem", textAlign: "center" }}>
            Skanna QR-koden för att öppna eventet i mobilen.
          </Typography>

          {selectedEvent?.url && !qrLoadFailed ? (
            <Box
              component="img"
              src={getQrImageUrl(selectedEvent.url)}
              alt={`QR-kod till ${selectedEvent.title}`}
              onError={() => setQrLoadFailed(true)}
              sx={{
                display: "block",
                width: 260,
                height: 260,
                maxWidth: "68vw",
                maxHeight: "68vw",
                p: 1,
                borderRadius: 1.5,
                backgroundColor: "#fff",
              }}
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                gap: 1,
                width: 260,
                maxWidth: "68vw",
                minHeight: 180,
                px: 2,
                textAlign: "center",
                borderRadius: 1.5,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Icon icon="mdi:qrcode-remove" width={42} />
              <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                QR-koden kunde inte laddas. Kontrollera internetanslutningen och försök igen.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function getQrImageUrl(url: string): string {
  const parameters = new URLSearchParams({
    text: url,
    size: "260",
    format: "svg",
    margin: "2",
    ecLevel: "M",
  });

  return `https://quickchart.io/qr?${parameters.toString()}`;
}
