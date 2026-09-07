import { Typography, Box } from "@mui/material";
import { formatClock, formatFullDate } from "../library/format";

type ClockSectionProps = {
  now: Date;
};

export function ClockSection({ now }: ClockSectionProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        minHeight: 0,
        gap: { xs: 1, md: 1.5 },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "6rem", md: "7rem" },
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {formatClock(now)}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          fontSize: { xs: "1.25rem", md: "1.4rem" },
          fontWeight: 600,
          textAlign: "center",
          textTransform: "capitalize",
        }}
      >
        {formatFullDate(now)}
      </Typography>
    </Box>
  );
}
