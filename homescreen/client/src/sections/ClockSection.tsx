import { Typography, Box } from "@mui/material";
import { formatClock } from "../library/format";

type ClockSectionProps = {
  now: Date;
};

export function ClockSection({ now }: ClockSectionProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: "2.5rem", md: "4.5rem" },
        }}
      >
        {formatClock(now)}
      </Typography>
    </Box>
  );
}
