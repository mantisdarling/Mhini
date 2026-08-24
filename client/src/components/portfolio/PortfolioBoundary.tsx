import { AlertTriangle, RotateCcw } from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  label: string;
};

type State = {
  hasError: boolean;
};

export default class PortfolioBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Portfolio] Component recovery", {
      name: error.name,
      componentStack: info.componentStack,
    });
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return <>{this.props.children}</>;
    return (
      <div className="portfolio-component-error" role="alert">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <strong>{this.props.label} paused</strong>
          <p>
            This part of the record could not load. Try it again without leaving
            the page.
          </p>
          <button type="button" onClick={this.retry}>
            <RotateCcw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      </div>
    );
  }
}
