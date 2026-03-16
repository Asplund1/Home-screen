import { formatShortTime, formatSyncTime } from "../lib/format";

type PanelFooterProps = {
    error: string | null;
    lastLoadedAt: number | null;
    updatedAt: string | undefined;
};

// Footer-raden visar var datan kommer ifran och nar panelen senast synkades.
export function PanelFooter(props: PanelFooterProps) {
    return (
        <div className="panel-footer">
            <span>
                {props.error
                    ? `Fel: ${props.error}`
                    : props.updatedAt
                        ? `Kalla ${formatShortTime(props.updatedAt)}`
                        : "Vantar pa data"}
            </span>
            <span>
                {props.lastLoadedAt
                    ? `Synkad ${formatSyncTime(props.lastLoadedAt)}`
                    : "Ingen synk annu"}
            </span>
        </div>
    );
}
