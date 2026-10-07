import { Box } from "@mui/material";
import { EmptyState } from "../components/EmptyState";
import { PanelFooter } from "../components/PanelFooter";
import { SubwayPanel } from "../components/SubwayPanel";
import type { ResourceState, SubwayData } from "../types/dashboard";

type SubwaySectionProps = {
  state: ResourceState<SubwayData>;
};

export function SubwaySection({ state }: SubwaySectionProps) {
  const { data, error, lastLoadedAt } = state;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        status={data?.status}
        updatedAt={data?.updatedAt}
      />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <SubwayPanel
          data={data}
          onEmpty={
            <EmptyState label={error ?? "Hämtar tunnelbaneavgångar..."} />
          }
        />
      </Box>
    </Box>
  );
}
