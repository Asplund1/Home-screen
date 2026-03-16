type MetricCardProps = {
    label: string;
    value: string;
};

// Ett litet kort for nyckeltal som kan ateranvandas i flera widgets.
export function MetricCard(props: MetricCardProps) {
    return (
        <div className="metric-card">
            <span>{props.label}</span>
            <strong>{props.value}</strong>
        </div>
    );
}
