import { PanelFrame } from "./PanelFrame";
import { formatClock } from "../lib/format";

type ClockPanelProps = {
    now: Date;
};

export function ClockPanel({ now }: ClockPanelProps) {
    return (
        <PanelFrame
            className="panel-clock"
            eyebrow="Tid"
            title="Nu"
            status=""
        >
            <div className="clock-panel">
                <span className="clock-panel-time">{formatClock(now)}</span>
            </div>
        </PanelFrame>
    );
}
