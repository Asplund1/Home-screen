type StatusChipProps = {
    label: string;
};

// Små chips används för metadata och korta förklaringar.
export function StatusChip(props: StatusChipProps) {
    return <span className="status-chip">{props.label}</span>;
}
