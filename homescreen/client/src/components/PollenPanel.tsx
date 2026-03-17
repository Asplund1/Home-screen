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
    <Box>
      {data.types.slice(0, 3).map((item) => (
        <Box key={item.code}>
          {item.value}
          <Typography>{item.name}</Typography>
        </Box>
      ))}
    </Box>
  );
}
