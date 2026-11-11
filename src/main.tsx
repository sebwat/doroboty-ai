import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { AppErrorBoundary } from "./features/prototype/error-boundary";
import { startAnalytics } from "./lib/analytics";
import "./app/globals.css";
void startAnalytics();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
