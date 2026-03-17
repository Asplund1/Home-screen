import { Box, Typography } from "@mui/material";

type MetricCardProps = {
  label: string;
  value: string;
};

// Ett litet kort for nyckeltal som kan ateranvandas i flera widgets.
export function MetricCard(props: MetricCardProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: "0.35rem",
        padding: "0.85rem",
        borderRadius: "1rem",
        border: "1px solid rgba(16, 35, 29, 0.08)",
        background: "rgba(255, 255, 255, 0.56)",
      }}
    >
      <Typography>{props.label}</Typography>
      <Typography sx={{ fontSize: "1.06rem", fontWeight: "bold" }}>
        {props.value}
      </Typography>
    </Box>
  );
}
