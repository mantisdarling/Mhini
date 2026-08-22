/**
 * Mantis design reminder: keep the shell dark, precise, and calm; motion should feel decisive rather than decorative.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, type ReactNode } from "react";
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
        <Suspense fallback={<RouteLoadingSkeleton variant="portfolio" />}><RouteContent><Home /></RouteContent></Suspense>
      </Route>
      <Route path="/studio">
        <Suspense fallback={<RouteLoadingSkeleton variant="studio" />}><RouteContent><ProjectConsole /></RouteContent></Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><RouteContent><Privacy /></RouteContent></Suspense>
      </Route>
      <Route path="/404">
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><RouteContent><NotFound /></RouteContent></Suspense>
      </Route>
      <Route>
        <Suspense fallback={<RouteLoadingSkeleton variant="privacy" />}><RouteContent><NotFound /></RouteContent></Suspense>
      </Route>
    </Switch>
  );
}

function RouteContent({ children }: { children: ReactNode }) {
  return <div className="route-content-enter">{children}</div>;
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
