import { PanelFooter } from "../components/PanelFooter";
import { PanelFrame } from "../components/PanelFrame";
import { GlucosePanel } from "../components/GlucosePanel";
import { EmptyState } from "../components/EmptyState";
import { getStatusLabel } from "../lib/format";
import type { GlucoseData, ResourceState } from "../types/dashboard";

type GlucoseSectionProps = {
  state: ResourceState<GlucoseData>;
};

export function GlucoseSection({ state }: GlucoseSectionProps) {
  const { data, error, lastLoadedAt } = state;
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
      <GlucosePanel
        data={data ?? null}
        onEmpty={
          <EmptyState
            label={data?.message ?? error ?? "Nightscout ar inte konfigurerat."}
          />
        }
      />
    </PanelFrame>
  );
}
