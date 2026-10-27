"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PrivateError(props: ErrorBoundaryProps) {
  return (
    <>
      <Heading level={1}>
        Er is iets misgegaan in het private gedeelte...
      </Heading>
      <ErrorBoundary {...props} />
    </>
  );
}
