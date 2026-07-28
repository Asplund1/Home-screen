import { Typography, Box } from "@mui/material";
import { formatClock } from "../library/format";

type ClockSectionProps = {
  now: Date;
};

export function ClockSection({ now }: ClockSectionProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: { xs: 140, md: 220 },
      }}
    >
      <Typography
        sx={{
          fontSize: "6rem",
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {formatClock(now)}
      </Typography>
    </Box>
  );
}
