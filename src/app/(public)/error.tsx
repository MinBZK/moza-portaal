"use client";

import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PublicError(props: ErrorBoundaryProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-h1 mb-4 text-center">
        Oeps, er is iets misgegaan...
      </h1>
      <ErrorBoundary {...props} />
    </div>
  );
}
