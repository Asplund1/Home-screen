import { Box, Typography } from "@mui/material";
import type { GlucoseHistoryPoint } from "../types/dashboard";

type GlucoseChartProps = {
  data: GlucoseHistoryPoint[];
  updatedAt: string;
};

type ChartPoint = GlucoseHistoryPoint & {
  timestamp: number;
};

const WINDOW_MS = 24 * 60 * 60_000;
const SVG_WIDTH = 360;
const SVG_HEIGHT = 160;
const PADDING_X = 12;
const PADDING_Y = 16;

export function GlucoseChart({ data, updatedAt }: GlucoseChartProps) {
  const points = toChartPoints(data);

  if (!points.length) {
    return null;
  }

  const latestTimestamp = points[points.length - 1].timestamp;
  const updatedAtTimestamp = Date.parse(updatedAt);

  const endTimestamp = Number.isNaN(updatedAtTimestamp)
    ? latestTimestamp
    : Math.max(updatedAtTimestamp, latestTimestamp);

  const startTimestamp = endTimestamp - WINDOW_MS;

  const values = points.map((point) => point.valueMmol);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  const scaleMin = Math.max(0, Math.floor(rawMin - 1));
  const scaleMax = Math.max(scaleMin + 6, Math.ceil(rawMax + 1));
  const valueRange = scaleMax - scaleMin;

  const usableWidth = SVG_WIDTH - PADDING_X * 2;
  const usableHeight = SVG_HEIGHT - PADDING_Y * 2;

  const getX = (timestamp: number) => {
    const ratio = (timestamp - startTimestamp) / WINDOW_MS;
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    return PADDING_X + clampedRatio * usableWidth;
  };

  const getY = (value: number) => {
    const ratio = (value - scaleMin) / valueRange;
    return PADDING_Y + (1 - ratio) * usableHeight;
  };

  const polylinePoints = points
    .map((point) => {
      const x = getX(point.timestamp);
      const y = getY(point.valueMmol);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const lastPoint = points[points.length - 1];
  const lastX = getX(lastPoint.timestamp);
  const lastY = getY(lastPoint.valueMmol);

  const gridValues = [scaleMin, (scaleMin + scaleMax) / 2, scaleMax];

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Box sx={{ width: "100%", height: 160, color: "primary.main" }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          role="img"
          aria-label="Glukoskurva för senaste dygnet"
        >
          {gridValues.map((value) => {
            const y = getY(value);

            return (
              <line
                key={value}
                x1={PADDING_X}
                y1={y}
                x2={SVG_WIDTH - PADDING_X}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
            );
          })}

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <circle cx={lastX} cy={lastY} r="3.5" fill="currentColor" />
        </svg>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          {formatTime(startTimestamp)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {formatTime(endTimestamp)}
        </Typography>
      </Box>
    </Box>
  );
}

function toChartPoints(data: GlucoseHistoryPoint[]): ChartPoint[] {
  return data
    .flatMap((point) => {
      if (typeof point.valueMmol !== "number") {
        return [];
      }

      const timestamp = Date.parse(point.measuredAt);

      if (Number.isNaN(timestamp)) {
        return [];
      }

      return [{ ...point, timestamp }];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
