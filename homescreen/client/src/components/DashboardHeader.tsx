import { Box, Typography, Paper } from "@mui/material";
import { formatClock, formatFullDate } from "../lib/format";

type DashboardHeaderProps = {
  now: Date;
};

// Apphuvudet innehaller bara den information som alltid ska synas: titel och klocka.
export function DashboardHeader(props: DashboardHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontSize: "0.76rem",
            fontWeight: 700,
            color: "secondary.main",
          }}
        >
          Home screen
        </Typography>
        <Typography variant="h1" sx={{ margin: 0 }}>
          Pi dashboard
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Enkel React-dashboard for väder, Nightscout och pollen.
        </Typography>
      </Box>

      <Paper
        sx={{
          display: "grid",
          gap: "0.3rem",
          minWidth: "13rem",
          padding: "1rem 1.1rem",
          borderRadius: "1.4rem",
          textAlign: "right",
        }}
      >
        <Typography sx={{ fontSize: "0.96rem", color: "text.secondary" }}>
          {formatFullDate(props.now)}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "2.2rem", md: "3.5rem" },
            fontFamily:
              '"Avenir Next", "Segoe UI Semibold", "Trebuchet MS", sans-serif',
            lineHeight: 0.9,
          }}
        >
          {formatClock(props.now)}
        </Typography>
      </Paper>
    </Box>
  );
}
