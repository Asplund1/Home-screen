import { formatClock, formatFullDate } from "../lib/format";

type DashboardHeaderProps = {
    now: Date;
};

// Apphuvudet innehaller bara den information som alltid ska synas: titel och klocka.
export function DashboardHeader(props: DashboardHeaderProps) {
    return (
        <header className="topbar">
            <div className="topbar-copy">
                <p className="eyebrow">Home screen</p>
                <h1>Pi dashboard</h1>
                <p className="subtle">
                    Enkel React-dashboard for väder, Nightscout och pollen.
                </p>
            </div>

            <div className="clock-card">
                <span className="clock-date">{formatFullDate(props.now)}</span>
                <span className="clock-time">{formatClock(props.now)}</span>
            </div>
        </header>
    );
}
