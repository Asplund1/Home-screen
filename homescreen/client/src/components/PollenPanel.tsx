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
  const topPollen = data.types[0];

  const summaryText = topPollen
    ? `${topPollen.description}`
    : "Ingen polleninformation tillgänglig just nu.";

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Pollenstatus
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        {summaryText}
      </Typography>

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
