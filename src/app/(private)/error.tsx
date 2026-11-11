"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PrivateError(props: ErrorBoundaryProps) {
  return (
    <>
      <Heading level={1}>Er ging iets mis</Heading>
      <ErrorBoundary {...props} />
    </>
  );
}
