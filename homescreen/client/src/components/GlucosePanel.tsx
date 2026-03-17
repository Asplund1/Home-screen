import { GlucoseChart } from "./GlucoseChart";
import type { GlucoseData } from "../types/dashboard";

type GlucosePanelProps = {
  data: GlucoseData | null;
  onEmpty: React.ReactNode;
};

// Pure presentational component för glukosdata
export function GlucosePanel({ data, onEmpty }: GlucosePanelProps) {
  if (!data?.history || !data.history.length) {
    return onEmpty;
  }

  return <GlucoseChart data={data.history} />;
}
