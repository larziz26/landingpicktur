import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LandingPage from "./LandingPage";
import { CookieBanner } from "./components/CookieBanner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LandingPage />
    <CookieBanner lang="fr" />
  </StrictMode>
);
