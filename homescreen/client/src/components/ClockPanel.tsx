import { Typography } from "@mui/material";
import { PanelFrame } from "./PanelFrame";
import { formatClock } from "../lib/format";

type ClockPanelProps = {
  now: Date;
};

export function ClockPanel({ now }: ClockPanelProps) {
  return (
    <PanelFrame className="panel-clock" eyebrow="Tid" title="Nu" status="">
      <Typography
        sx={{
          fontSize: { xs: "2.5rem", md: "4.5rem" },
          fontFamily:
            '"Avenir Next", "Segoe UI Semibold", "Trebuchet MS", sans-serif',
          letterSpacing: "-0.05em",
          lineHeight: 0.9,
        }}
      >
        {formatClock(now)}
      </Typography>
    </PanelFrame>
  );
}
