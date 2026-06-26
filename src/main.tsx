import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { runOneTimeRecordCleanup } from "./lib/recordCleanup";
import "./styles.css";

runOneTimeRecordCleanup();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
