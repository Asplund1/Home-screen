import { Box, Typography } from "@mui/material";
import { formatShortTime, formatSyncTime } from "../library/format";

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
      }}
    >
      <Typography sx={{ fontSize: "1rem" }}>
        {props.error
          ? `Fel: ${props.error}`
          : props.updatedAt
            ? `Senast uppdaterad ${formatShortTime(props.updatedAt)}`
            : "Väntar på data"}
      </Typography>
      <Typography sx={{ fontSize: "1rem" }}>
        {props.lastLoadedAt
          ? `Synkad ${formatSyncTime(props.lastLoadedAt)}`
          : "Väntar på synk"}
      </Typography>
    </Box>
  );
}
