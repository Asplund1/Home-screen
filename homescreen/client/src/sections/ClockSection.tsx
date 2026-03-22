import { Typography, Box } from "@mui/material";
import { formatClock } from "../library/format";

type ClockSectionProps = {
  now: Date;
};

export function ClockSection({ now }: ClockSectionProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Typography
        sx={{
          fontSize: "6rem",
          fontWeight: "bold",
          textAlign: "center",
          pt: 6,
        }}
      >
        {formatClock(now)}
      </Typography>
    </Box>
  );
}
