import { Box, Typography } from "@mui/material";
import { useTicker } from "../hooks/useTicker";
import { formatShortTime, formatSyncTime } from "../library/format";
import type { ResourceStatus } from "../types/dashboard";

type PanelFooterProps = {
  error: string | null;
  lastLoadedAt: number | null;
  status?: ResourceStatus;
  updatedAt: string | undefined;
};

export function PanelFooter(props: PanelFooterProps) {
  const now = useTicker(60_000);
  const staleAge =
    props.status === "stale" && props.updatedAt
      ? formatDataAge(props.updatedAt, now)
      : null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 1,
        flexShrink: 0,
        minHeight: 18,
      }}
    >
      <Typography
        color={props.error || staleAge ? "warning.main" : "text.primary"}
        sx={{
          fontSize: "0.78rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {props.error
          ? `Fel: ${props.error}`
          : staleAge
            ? `Data ${staleAge} gammal`
            : props.updatedAt
              ? `Senast uppdaterad ${formatShortTime(props.updatedAt)}`
              : "Väntar på data"}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
        {props.lastLoadedAt
          ? `Synkad ${formatSyncTime(props.lastLoadedAt)}`
          : "Väntar på synk"}
      </Typography>
    </Box>
  );
}

function formatDataAge(updatedAt: string, now: Date): string {
  const updatedAtMs = Date.parse(updatedAt);
  if (!Number.isFinite(updatedAtMs)) {
    return "okänd tid";
  }

  const ageMs = Math.max(0, now.getTime() - updatedAtMs);
  const minutes = Math.floor(ageMs / 60_000);

  if (minutes < 1) {
    return "mindre än 1 min";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} h ${remainingMinutes} min`
      : `${hours} h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`;
}
