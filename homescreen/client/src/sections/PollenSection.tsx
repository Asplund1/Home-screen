import { PanelFooter } from "../components/PanelFooter";
import { PollenPanel } from "../components/PollenPanel";
import { EmptyState } from "../components/EmptyState";
import type { PollenData, ResourceState } from "../types/dashboard";
import { Box } from "@mui/material";

type PollenSectionProps = {
  state: ResourceState<PollenData>;
};

export function PollenSection({ state }: PollenSectionProps) {
  const { data, error, lastLoadedAt } = state;

  return (
    <Box>
      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        updatedAt={data?.updatedAt}
      />

      <PollenPanel
        data={data ?? null}
        onEmpty={<EmptyState label={error ?? "Hamtar pollenprognos..."} />}
      />
    </Box>
  );
}
