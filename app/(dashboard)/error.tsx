"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { AlertCircle } from "lucide-react";
import { logError } from "@/lib/error-logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { digest: error.digest, context: "dashboard" });
  }, [error]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Something went wrong"
        description="An error occurred while loading this page."
      />
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
