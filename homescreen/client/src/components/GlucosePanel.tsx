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

  const getBackgroundSx = (level: string) => {
    switch (level) {
      case "high":
        return {
          background:
            "linear-gradient(180deg, rgba(217, 128, 50, 0.18), rgba(255, 252, 247, 0.84) 30%)",
        };
      case "low":
        return {
          background:
            "linear-gradient(180deg, rgba(182, 67, 67, 0.18), rgba(255, 252, 247, 0.84) 30%)",
        };
      default:
        return {
          background:
            "linear-gradient(180deg, rgba(31, 122, 92, 0.18), rgba(255, 252, 247, 0.84) 30%)",
        };
    }
  };

  return (
    <PanelFrame
      className="panel-glucose"
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
      sx={getBackgroundSx(glucoseLevel)}
    >
      {data?.history && data.history.length ? (
        <GlucoseChart data={data.history} />
      ) : (
        <EmptyState
          label={data?.message ?? error ?? "Nightscout ar inte konfigurerat."}
        />
      )}
    </PanelFrame>
  );
}
