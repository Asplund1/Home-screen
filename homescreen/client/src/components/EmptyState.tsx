type EmptyStateProps = {
    action?: {
        href?: string;
        label: string;
    };
    label: string;
};

// Enkel tomvy för både loading, saknad setup och nätverksfel.
export function EmptyState(props: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="loading-bar" />
            <p>{props.label}</p>
            {props.action ? (
                props.action.href ? (
                    <a className="action-button" href={props.action.href}>
                        {props.action.label}
                    </a>
                ) : (
                    <span className="action-button">{props.action.label}</span>
                )
            ) : null}
        </div>
    );
}
