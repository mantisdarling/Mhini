/**
 * Mantis design reminder: keep the shell dark, precise, and calm; motion should feel decisive rather than decorative.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, type ReactNode } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivacyConsent from "./components/PrivacyConsent";

const Home = lazy(() => import("./pages/Home"));
const ProjectConsole = lazy(() => import("./pages/ProjectConsole"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span>LOADING</span>
    </div>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

function HomeRoute() {
  return <LazyRoute><Home /></LazyRoute>;
}

function StudioRoute() {
  return <LazyRoute><ProjectConsole /></LazyRoute>;
}

function PrivacyRoute() {
  return <LazyRoute><Privacy /></LazyRoute>;
}

function NotFoundRoute() {
  return <LazyRoute><NotFound /></LazyRoute>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/studio" component={StudioRoute} />
      <Route path="/privacy" component={PrivacyRoute} />
      <Route path="/404" component={NotFoundRoute} />
      <Route component={NotFoundRoute} />
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
