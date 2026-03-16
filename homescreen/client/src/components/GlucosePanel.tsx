import { EmptyState } from "./EmptyState";
import { MetricCard } from "./MetricCard";
import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { StatusChip } from "./StatusChip";
import { formatShortTime, getGlucoseStatusLabel, getStatusLabel } from "../lib/format";
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
            {data?.reading ? (
                <>
                    <div className="glucose-hero">
                        <div>
                            <div className="glucose-value">
                                {data.reading.valueMmol.toFixed(1)}
                                <span>mmol/L</span>
                            </div>
                            <p className="glucose-secondary">{data.reading.valueMgdl} mg/dL</p>
                        </div>

                        <div className="trend-pill">
                            <strong>{data.reading.trendArrow}</strong>
                            <span>{data.reading.trendLabel}</span>
                        </div>
                    </div>

                    <div className="glucose-grid">
                        <MetricCard label="Matning" value={formatShortTime(data.reading.measuredAt)} />
                        <MetricCard label="Alder" value={`${data.reading.ageMinutes} min sedan`} />
                        <MetricCard label="Status" value={getGlucoseStatusLabel(data.reading.status)} />
                        <MetricCard
                            label="Delta"
                            value={
                                data.reading.deltaMmol !== null
                                    ? `${data.reading.deltaMmol.toFixed(1)} mmol/L`
                                    : "Saknas"
                            }
                        />
                    </div>

                    <div className="chip-row">
                        <StatusChip label={data.message} />
                        {data.note ? <StatusChip label={data.note} /> : null}
                    </div>
                </>
            ) : (
                <EmptyState label={data?.message ?? error ?? "Nightscout ar inte konfigurerat."} />
            )}
        </PanelFrame>
    );
}
