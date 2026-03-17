import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import LandingPage from "./LandingPage";
import HeroSandbox from "./pages/HeroSandbox";
import AiSortingSandbox from "./pages/AiSortingSandbox";
import { CookieBanner } from "./components/CookieBanner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Switch>
      <Route path="/sandbox" component={HeroSandbox} />
      <Route path="/ai-sorting" component={AiSortingSandbox} />
      <Route component={LandingPage} />
    </Switch>
    <CookieBanner lang="fr" />
  </StrictMode>
);
