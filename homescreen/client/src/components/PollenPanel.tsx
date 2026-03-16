import { EmptyState } from "./EmptyState";
import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { getStatusLabel } from "../lib/format";
import type { PollenData, ResourceState } from "../types/dashboard";

type PollenPanelProps = {
    state: ResourceState<PollenData>;
};

// Pollenpanelen visar dagens sammanfattning och de typer som är mest relevanta.
export function PollenPanel(props: PollenPanelProps) {
    const { data, error, lastLoadedAt } = props.state;

    return (
        <PanelFrame
            className="panel-pollen"
            eyebrow="Google pollen"
            title={data?.location ?? "Pollen"}
            status={getStatusLabel(data?.status, error)}
            footer={
                <PanelFooter
                    error={error}
                    lastLoadedAt={lastLoadedAt}
                    updatedAt={data?.updatedAt}
                />
            }
        >
            {data ? (
                <div className="pollen-list">
                    {data.types.slice(0, 3).map((item) => (
                        <article className="pollen-card" key={item.code}>
                            <div className="pollen-index" style={{ backgroundColor: item.color }}>
                                {item.value}
                            </div>
                            <div className="pollen-copy">
                                <strong>{item.name}</strong>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <EmptyState label={error ?? "Hamtar pollenprognos..."} />
            )}
        </PanelFrame>
    );
}
