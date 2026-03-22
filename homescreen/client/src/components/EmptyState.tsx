import { Box, LinearProgress, Typography, Button } from "@mui/material";

type EmptyStateProps = {
  action?: {
    href?: string;
    label: string;
  };
  label: string;
};

// Enkel tomvy för både loading, saknad setup och nätverksfel.
export function EmptyState(props: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        alignContent: "center",
        justifyItems: "start",
        minHeight: "12rem",
        padding: 1.5,
        borderRadius: "1.2rem",
        border: "1px solid rgba(16, 35, 29, 0.08)",
      }}
    >
      <LinearProgress
        sx={{
          width: { xs: "18rem", md: "100%" },
          height: "0.65rem",
          borderRadius: "999px",
          background:
            "linear-gradient(90deg, rgba(16, 35, 29, 0.08), rgba(239, 125, 87, 0.5), rgba(16, 35, 29, 0.08))",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s linear infinite",
          "& .MuiLinearProgress-bar": {
            background: "transparent",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "200% 0" },
            "100%": { backgroundPosition: "-200% 0" },
          },
        }}
      />
      <Typography>{props.label}</Typography>
      {props.action ? (
        props.action.href ? (
          <Button
            variant="contained"
            href={props.action.href}
            sx={{
              padding: "0.9rem 1.1rem",
              background: "primary.main",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {props.action.label}
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{
              padding: "0.9rem 1.1rem",
              background: "primary.main",
              color: "white",
              fontWeight: 700,
            }}
          >
            {props.action.label}
          </Button>
        )
      ) : null}
    </Box>
  );
}
