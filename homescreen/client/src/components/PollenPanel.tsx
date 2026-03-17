import { Box, Typography } from "@mui/material";
import type { PollenData } from "../types/dashboard";

type PollenPanelProps = {
  data: PollenData | null;
  onEmpty: React.ReactNode;
};

// Pure presentational component för pollendata
export function PollenPanel({ data, onEmpty }: PollenPanelProps) {
  if (!data) {
    return onEmpty;
  }

  return (
    <Box sx={{ display: "grid", gap: 1.2 }}>
      {data.types.slice(0, 3).map((item) => (
        <Box
          key={item.code}
          sx={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gap: 1.2,
            alignItems: "start",
            padding: "0.9rem 1rem",
            borderRadius: "1.15rem",
            border: "1px solid rgba(16, 35, 29, 0.08)",
            background: "rgba(255, 255, 255, 0.56)",
          }}
        >
          <Box
            sx={{
              minWidth: "3rem",
              minHeight: "3rem",
              color: "white",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              backgroundColor: item.color,
            }}
          >
            {item.value}
          </Box>
          <Box sx={{ display: "grid", gap: "0.25rem" }}>
            <Typography sx={{ fontSize: "1.15rem", fontWeight: "bold" }}>
              {item.name}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
