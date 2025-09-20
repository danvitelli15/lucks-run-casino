import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app";
import { BrowserRouter } from "react-router";

console.log("Starting Lucks Run Casino...");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
