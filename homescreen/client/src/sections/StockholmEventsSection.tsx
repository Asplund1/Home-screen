import { Box } from "@mui/material";
import { EmptyState } from "../components/EmptyState";
import { PanelFooter } from "../components/PanelFooter";
import { StockholmEventsPanel } from "../components/StockholmEventsPanel";
import type { ResourceState, StockholmEventsData } from "../types/dashboard";

type StockholmEventsSectionProps = {
  state: ResourceState<StockholmEventsData>;
};

export function StockholmEventsSection({ state }: StockholmEventsSectionProps) {
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
        <StockholmEventsPanel
          data={data}
          onEmpty={
            <EmptyState
              label={error ?? "Hämtar events från Visit Stockholm..."}
            />
          }
        />
      </Box>
    </Box>
  );
}
