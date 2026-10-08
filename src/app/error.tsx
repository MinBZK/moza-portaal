"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function GlobalError(props: ErrorBoundaryProps) {
  return (
    <>
      <Heading level={1}>Er is een systeemfout opgetreden</Heading>
      <ErrorBoundary {...props} />
    </>
  );
}
