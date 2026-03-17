import { Box, Paper, Typography, Chip } from "@mui/material";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

type PanelFrameProps = {
  children: ReactNode;
  className?: string;
  eyebrow: string;
  footer?: ReactNode;
  status: string;
  title: string;
  sx?: SxProps<Theme>;
};

// Gemensam panelram ger samma struktur i alla widgets utan att dölja för mycket logik.
export function PanelFrame(props: PanelFrameProps) {
  return (
    <Paper
      sx={{
        display: "grid",
        gap: 2,
        padding: 1.5,
        borderRadius: "1.6rem",
        minHeight: 0,
        ...(props.className && {
          ...(props.className.includes("panel-clock") && {
            display: "grid",
            height: "100%",
            placeItems: "center",
          }),
          ...(props.className.includes("panel-weather") && {
            minHeight: 0,
          }),
        }),
        ...props.sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "secondary.main",
            }}
          >
            {props.eyebrow}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              margin: 0,
              fontFamily:
                '"Avenir Next", "Segoe UI Semibold", "Trebuchet MS", sans-serif',
              fontWeight: 700,
              letterSpacing: "-0.04em",
              fontSize: { xs: "1.4rem", md: "2.1rem" },
            }}
          >
            {props.title}
          </Typography>
        </Box>

        {props.status ? (
          <Chip
            label={props.status}
            sx={{
              padding: "0.45rem 0.75rem",
              background: "rgba(16, 35, 29, 0.08)",
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          />
        ) : null}
      </Box>

      {props.children}
      {props.footer}
    </Paper>
  );
}
