import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#38bdf8", // accent-strong
    },
    secondary: {
      main: "#7dd3fc", // accent
    },
    background: {
      default: "#061117", // bg-dark
      paper: "rgba(6, 17, 23, 0.92)", // bg-panel
    },
    text: {
      primary: "#f3f4f6", // text-main
      secondary: "rgba(243, 244, 246, 0.72)", // text-muted
    },
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          background:
            "radial-gradient(circle at top, rgba(29, 145, 175, 0.18), transparent 42%), linear-gradient(160deg, #040a11 0%, #071320 48%, #0c1b2a 100%)",
          fontFamily: '"Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif',
        },
        "button, a": {
          touchAction: "manipulation",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          backgroundImage: "none", // Remove default background image
          border: "1px solid rgba(255, 255, 255, 0.12)", // border-soft
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.48)", // shadow-soft
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(90deg, rgba(16, 35, 29, 0.08), rgba(239, 125, 87, 0.5), rgba(16, 35, 29, 0.08))",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s linear infinite",
          "& .MuiLinearProgress-bar": {
            background: "transparent",
          },
        },
      },
    },
  },
});
