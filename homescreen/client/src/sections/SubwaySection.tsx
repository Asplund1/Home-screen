import { Box } from "@mui/material";
import { EmptyState } from "../components/EmptyState";
import { PanelFooter } from "../components/PanelFooter";
import { SubwayPanel } from "../components/SubwayPanel";
import type {
  ResourceState,
  SubwayData,
} from "../types/dashboard";

type SubwaySectionProps = {
  state: ResourceState<SubwayData>;
};

export function SubwaySection({
  state,
}: SubwaySectionProps) {
  const { data, error, lastLoadedAt } = state;

  return (
    <Box>
      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        updatedAt={data?.updatedAt}
      />

      <SubwayPanel
        data={data}
        onEmpty={
          <EmptyState
            label={error ?? "Hämtar tunnelbaneavgångar..."}
          />
        }
      />
    </Box>
  );
}