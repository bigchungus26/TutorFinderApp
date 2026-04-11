// ── ErrorBoundary ─────────────────────────────────────────────
// Top-level error boundary with friendly recovery screen.
// Also exports a per-route boundary for isolated failures.
import React, { Component, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { variants } from "@/lib/motion";
import { getRoleAppPath, getSelectedRole } from "@/lib/rolePreference";

interface Props {
  children: ReactNode;
  /** Optional compact mode for per-section boundaries */
  compact?: boolean;
  /** Optional custom error display */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function isChunkLoadError(error: Error) {
  const message = String(error?.message ?? "");
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);

    if (typeof window === "undefined" || !isChunkLoadError(error)) {
      return;
    }

    const reloadKey = `lazy-reload:${window.location.pathname}`;
    const alreadyReloaded = window.sessionStorage.getItem(reloadKey) === "1";

    if (!alreadyReloaded) {
      window.sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
      return;
    }

    window.sessionStorage.removeItem(reloadKey);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    if (this.props.compact) {
      return <InlineError onRetry={this.handleRetry} />;
    }

    return <FullErrorScreen onRetry={this.handleRetry} />;
  }
}

// ── Full-screen recovery ──────────────────────────────────────
function FullErrorScreen({ onRetry }: { onRetry: () => void }) {
  const selectedRole = getSelectedRole();
  const homeHref = selectedRole ? getRoleAppPath(selectedRole) : "/";

  return (
    <motion.div
      variants={variants.fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h1 className="text-display-md text-ink mb-3">Something broke on our end</h1>
      <p className="text-body-sm text-ink-muted mb-8 max-w-[280px]">
        An unexpected error occurred. Your data is safe — you can retry or go back home.
      </p>
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="flex items-center gap-2 h-12 px-5 rounded-lg border border-border text-label font-medium text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <RefreshCw size={16} />
          Retry
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.97 }}
          href={homeHref}
          className="flex items-center gap-2 h-12 px-5 rounded-lg bg-accent text-accent-foreground text-label font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Home size={16} />
          Go home
        </motion.a>
      </div>
    </motion.div>
  );
}

// ── Inline error for per-route boundary ───────────────────────
function InlineError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-danger" />
      </div>
      <p className="text-body-sm text-ink-muted mb-4">
        This section failed to load.
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-label text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <RefreshCw size={14} />
        Try again
      </motion.button>
    </div>
  );
}

// ── QueryError inline component ───────────────────────────────
// Use this for React Query error states inside components.
interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center py-12 px-8 text-center">
      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center mb-3">
        <AlertTriangle size={18} className="text-danger" />
      </div>
      <p className="text-body-sm text-ink-muted mb-4">
        {message ?? "Failed to load. Check your connection."}
      </p>
      {onRetry && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-label text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <RefreshCw size={14} />
          Retry
        </motion.button>
      )}
    </div>
  );
}
