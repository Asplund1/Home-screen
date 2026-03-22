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
          fontSize: { xs: "2.5rem", md: "4.5rem" },
          textAlign: "center",
        }}
      >
        {formatClock(now)}
      </Typography>
    </Box>
  );
}
