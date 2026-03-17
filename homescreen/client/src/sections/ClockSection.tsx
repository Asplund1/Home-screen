import { ClockPanel } from "../components/ClockPanel";
import { PanelFrame } from "../components/PanelFrame";

type ClockSectionProps = {
  now: Date;
};

export function ClockSection({ now }: ClockSectionProps) {
  return (
    <PanelFrame className="panel-clock" eyebrow="Tid" title="Nu" status="">
      <ClockPanel
        now={now}
        sx={{
          fontSize: { xs: "2.5rem", md: "4.5rem" },
          fontFamily:
            '"Avenir Next", "Segoe UI Semibold", "Trebuchet MS", sans-serif',
          letterSpacing: "-0.05em",
          lineHeight: 0.9,
        }}
      />
    </PanelFrame>
  );
}
