"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PublicError(props: ErrorBoundaryProps) {
  return (
    <>
      <Heading level={1}>Oeps, er is iets misgegaan...</Heading>
      <ErrorBoundary {...props} />
    </>
  );
}
