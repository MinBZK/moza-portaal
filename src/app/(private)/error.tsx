"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function PrivateError(props: ErrorBoundaryProps) {
  return (
    <>
      <Heading level={1}>Deze pagina doet het nu niet</Heading>
      <ErrorBoundary {...props} />
    </>
  );
}
