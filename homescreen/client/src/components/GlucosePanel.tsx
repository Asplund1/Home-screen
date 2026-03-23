import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { GlucoseChart } from "./GlucoseChart";
import type { GlucoseData } from "../types/dashboard";

type GlucosePanelProps = {
  data: GlucoseData | null;
  onEmpty: ReactNode;
};

const mmolFormatter = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function GlucosePanel({ data, onEmpty }: GlucosePanelProps) {
  if (!data) {
    return onEmpty;
  }

  if (!data.reading || !data.history.length) {
    return (
      <Box sx={{ display: "grid", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Glukos senaste dygnet
        </Typography>

        <Typography color="text.secondary">{data.message}</Typography>

        {data.note ? (
          <Typography variant="body2" color="text.secondary">
            {data.note}
          </Typography>
        ) : null}
      </Box>
    );
  }

  const measuredAtText = new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.reading.measuredAt));

  const deltaText =
    data.reading.deltaMmol === null
      ? "–"
      : `${data.reading.deltaMmol > 0 ? "+" : ""}${mmolFormatter.format(
          data.reading.deltaMmol,
        )} mmol/L`;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "grid", gap: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Glukos senaste dygnet
        </Typography>

        <Typography sx={{ fontSize: "1.8rem", fontWeight: 700 }}>
          {mmolFormatter.format(data.reading.valueMmol)} mmol/L{" "}
          {data.reading.trendArrow}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {data.reading.trendLabel} • Delta {deltaText} • Senast{" "}
          {measuredAtText}
        </Typography>

        {data.note ? (
          <Typography variant="body2" color="text.secondary">
            {data.note}
          </Typography>
        ) : null}
      </Box>

      <GlucoseChart data={data.history} updatedAt={data.updatedAt} />
    </Box>
  );
}
