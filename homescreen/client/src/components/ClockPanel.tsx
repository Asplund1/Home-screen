import { Typography } from "@mui/material";
import { formatClock } from "../lib/format";

type ClockPanelProps = {
  now: Date;
  sx?: any;
};

export function ClockPanel({ now, sx }: ClockPanelProps) {
  return <Typography sx={sx}>{formatClock(now)}</Typography>;
}
