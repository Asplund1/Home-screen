import { Box, Typography } from "@mui/material";
import { formatShortTime, formatSyncTime } from "../lib/format";

type PanelFooterProps = {
  error: string | null;
  lastLoadedAt: number | null;
  updatedAt: string | undefined;
};

// Footer-raden visar var datan kommer ifran och nar panelen senast synkades.
export function PanelFooter(props: PanelFooterProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 1.5,
        paddingTop: "0.25rem",
        borderTop: "1px solid rgba(16, 35, 29, 0.08)",
      }}
    >
      <Typography sx={{ fontSize: "0.88rem" }}>
        {props.error
          ? `Fel: ${props.error}`
          : props.updatedAt
            ? `Kalla ${formatShortTime(props.updatedAt)}`
            : "Vantar pa data"}
      </Typography>
      <Typography sx={{ fontSize: "0.88rem" }}>
        {props.lastLoadedAt
          ? `Synkad ${formatSyncTime(props.lastLoadedAt)}`
          : "Ingen synk annu"}
      </Typography>
    </Box>
  );
}
