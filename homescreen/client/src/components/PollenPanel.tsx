import { Box, Typography } from "@mui/material";
import type { PollenData } from "../types/dashboard";

type PollenPanelProps = {
  data: PollenData | null;
  onEmpty: React.ReactNode;
};

export function PollenPanel({ data, onEmpty }: PollenPanelProps) {
  if (!data) {
    return onEmpty;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Pollenstatus
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: "0–20", text: "Väldigt lågt", color: "#4caf50" },
          { label: "20–80", text: "Lågt", color: "#ffb300" },
          { label: "80–150", text: "Måttligt", color: "#f57c00" },
          { label: "150–300", text: "Mycket högt", color: "#d32f2f" },
        ].map((level) => (
          <Box
            key={level.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.25,
              py: 0.75,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: level.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {level.label}
              </Box>{" "}
              {level.text}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        }}
      >
        {data.types.slice(0, 3).map((item) => (
          <Box
            key={item.code}
            sx={{
              borderRadius: 2,
              p: 2,
              minHeight: 110,
              border: `1px solid ${item.color}`,
              backgroundColor: "black",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item.name}
            </Typography>

            <Typography
              variant="h4"
              sx={{ color: item.color ?? "text.primary", fontWeight: 700 }}
            >
              {item.value}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: item.color ?? "text.primary", fontWeight: 600 }}
            >
              {item.category}
            </Typography>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
