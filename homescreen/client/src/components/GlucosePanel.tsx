import { EmptyState } from "./EmptyState";
import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { GlucoseChart } from "./GlucoseChart";
import { getStatusLabel } from "../lib/format";
import type { GlucoseData, ResourceState } from "../types/dashboard";

type GlucosePanelProps = {
    state: ResourceState<GlucoseData>;
};

// Glukospanelen har tydligt fokus pa värdet just nu och hur det rör sig.
export function GlucosePanel(props: GlucosePanelProps) {
    const { data, error, lastLoadedAt } = props.state;
    const glucoseLevel = data?.reading?.status ?? "normal";

    return (
        <PanelFrame
            className={`panel-glucose panel-glucose-${glucoseLevel}`}
            eyebrow="Nightscout"
            title="Glukos"
            status={getStatusLabel(data?.status, error)}
            footer={
                <PanelFooter
                    error={error}
                    lastLoadedAt={lastLoadedAt}
                    updatedAt={data?.updatedAt}
                />
            }
        >
            {data?.history && data.history.length ? (
                <GlucoseChart data={data.history} />
            ) : (
                <EmptyState label={data?.message ?? error ?? "Nightscout ar inte konfigurerat."} />
            )}
        </PanelFrame>
    );
}
