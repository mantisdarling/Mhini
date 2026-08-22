import { AlertTriangle, RotateCcw } from "lucide-react";
import React, { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class RouteChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[UI] Route failed to load", { name: error.name });
  }

  retry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="route-chunk-error-enter grid min-h-screen place-items-center bg-background px-6 py-16 text-foreground" role="alert">
        <section className="w-full max-w-xl border border-border bg-card p-8 text-center sm:p-12">
          <AlertTriangle className="mx-auto mb-6 text-primary" size={34} aria-hidden="true" />
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-primary">ROUTE SIGNAL LOST</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">This route could not be loaded.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            The latest interface bundle did not arrive. Try the request again, or return to the public portfolio.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={this.retry} className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 font-mono text-xs tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <RotateCcw size={15} aria-hidden="true" />
              TRY AGAIN
            </button>
            <a href="/" className="inline-flex items-center justify-center border border-border px-5 py-3 font-mono text-xs tracking-[0.12em] transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              RETURN HOME
            </a>
          </div>
        </section>
      </main>
    );
  }
}
