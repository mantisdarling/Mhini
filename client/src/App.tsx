/**
 * Mantis design reminder: keep the shell dark, precise, and calm; motion should feel decisive rather than decorative.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import RouteLoadingSkeleton from "./components/RouteLoadingSkeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivacyConsent from "./components/PrivacyConsent";

const Home = lazy(() => import("./pages/Home"));
const ProjectConsole = lazy(() => import("./pages/ProjectConsole"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Router() {
  // Route chunks load independently so the shell stays responsive on first visit.
  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<RouteLoadingSkeleton variant="portfolio" />}><Home /></Suspense>
      </Route>
      <Route path="/studio">
        <Suspense fallback={<RouteLoadingSkeleton variant="studio" />}><ProjectConsole /></Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><Privacy /></Suspense>
      </Route>
      <Route path="/404">
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><NotFound /></Suspense>
      </Route>
      <Route>
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><NotFound /></Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PrivacyConsent />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
