import { PanelFooter } from "../components/PanelFooter";
import { GlucosePanel } from "../components/GlucosePanel";
import { EmptyState } from "../components/EmptyState";
import type { GlucoseData, ResourceState } from "../types/dashboard";
import { Box } from "@mui/material";

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
            "linear-gradient(180deg, rgba(217, 128, 50, 0.18), rgba(226, 186, 7, 0.88) 30%)",
        };
      case "low":
        return {
          background:
            "linear-gradient(180deg, rgba(182, 67, 67, 0.18), rgba(148, 54, 16, 0.84) 30%)",
        };
      default:
        return {
          background:
            "linear-gradient(180deg, rgba(31, 122, 92, 0.18), rgba(51, 77, 28, 0.84) 30%)",
        };
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "1.6rem",
        ...getBackgroundSx(glucoseLevel),
      }}
    >
      <GlucosePanel
        data={data ?? null}
        onEmpty={
          <EmptyState
            label={data?.message ?? error ?? "Nightscout är inte konfigurerat."}
          />
        }
      />

      <PanelFooter
        error={error}
        lastLoadedAt={lastLoadedAt}
        updatedAt={data?.updatedAt}
      />
    </Box>
  );
}
