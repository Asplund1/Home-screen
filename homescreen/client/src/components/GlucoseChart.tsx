import type { GlucoseHistoryPoint } from "../types/dashboard";

type GlucoseChartProps = {
    data: GlucoseHistoryPoint[];
};

export function GlucoseChart({ data }: GlucoseChartProps) {
    if (!data.length) {
        return null;
    }

    const points = [...data]
        .filter((point) => typeof point.valueMmol === "number")
        .sort((a, b) => Date.parse(a.measuredAt) - Date.parse(b.measuredAt));

    const values = points.map((point) => point.valueMmol);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = 10;
    const viewWidth = 300;
    const viewHeight = 140;

    // Keep a bit of space above/below in the graph.
    const scaleMin = Math.max(0, minValue - 1);
    const scaleMax = maxValue + 1;
    const valueRange = Math.max(1, scaleMax - scaleMin);

    const coordinates = points.map((point, index) => {
        const x = padding + (index / (points.length - 1)) * (viewWidth - padding * 2);
        const normalized = (point.valueMmol - scaleMin) / valueRange;
        const y = viewHeight - padding - normalized * (viewHeight - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const last = points[points.length - 1];
    const label = `Senaste (${last.valueMmol.toFixed(1)} mmol/L)`;

    return (
        <div className="glucose-chart">
            <div className="glucose-chart-label">{label}</div>
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="none">
                <polyline
                    className="glucose-chart-line"
                    points={coordinates.join(" ")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <line
                    x1={padding}
                    y1={viewHeight - padding}
                    x2={viewWidth - padding}
                    y2={viewHeight - padding}
                    stroke="currentColor"
                    strokeOpacity={0.2}
                    strokeWidth={1}
                />
            </svg>
        </div>
    );
}
