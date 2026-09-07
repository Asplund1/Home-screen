import { Box, Typography } from "@mui/material";
import { formatShortTime, formatSyncTime } from "../library/format";

type PanelFooterProps = {
  error: string | null;
  lastLoadedAt: number | null;
  updatedAt: string | undefined;
};

export function PanelFooter(props: PanelFooterProps) {
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
        sx={{
          fontSize: "0.78rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {props.error
          ? `Fel: ${props.error}`
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
