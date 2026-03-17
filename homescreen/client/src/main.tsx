import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme";
import App from "./App.tsx";

// Här monteras hela React-appen in i div:en med id="root" i index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* StrictMode hjälper under utveckling genom att hitta osäkra React-mönster tidigt. */}
      <App />
    </ThemeProvider>
  </StrictMode>,
);
