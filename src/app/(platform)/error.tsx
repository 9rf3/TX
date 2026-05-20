"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-accent-red" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-light mb-2">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted mb-5 font-mono">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all text-sm font-semibold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
