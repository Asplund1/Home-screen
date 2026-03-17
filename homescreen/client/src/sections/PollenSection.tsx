import { PanelFooter } from "../components/PanelFooter";
import { PanelFrame } from "../components/PanelFrame";
import { PollenPanel } from "../components/PollenPanel";
import { EmptyState } from "../components/EmptyState";
import { getStatusLabel } from "../lib/format";
import type { PollenData, ResourceState } from "../types/dashboard";

type PollenSectionProps = {
  state: ResourceState<PollenData>;
};

export function PollenSection({ state }: PollenSectionProps) {
  const { data, error, lastLoadedAt } = state;

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
      <PollenPanel
        data={data ?? null}
        onEmpty={<EmptyState label={error ?? "Hamtar pollenprognos..."} />}
      />
    </PanelFrame>
  );
}
