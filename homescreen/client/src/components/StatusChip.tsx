import { Chip } from "@mui/material";

type StatusChipProps = {
  label: string;
};

// Små chips används för metadata och korta förklaringar.
export function StatusChip(props: StatusChipProps) {
  return (
    <Chip
      label={props.label}
      size="small"
      sx={{
        padding: "0.55rem 0.8rem",
        background: "rgba(16, 35, 29, 0.07)",
        fontSize: "0.85rem",
      }}
    />
  );
}
