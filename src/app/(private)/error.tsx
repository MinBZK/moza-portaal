"use client";

import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PrivateError(props: ErrorBoundaryProps) {
  return (
    <>
      <h1 className="text-h1 mb-4">
        Er is iets misgegaan in het private gedeelte...
      </h1>
      <ErrorBoundary {...props} />
    </>
  );
}
