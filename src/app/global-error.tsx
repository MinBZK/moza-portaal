"use client";

import { Heading } from "@/components/rhc";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function GlobalError(props: ErrorBoundaryProps) {
  return (
    <html lang="nl">
      <head>
        <title>MijnOverheid Zakelijk - global error</title>
      </head>
      <body>
        <main>
          <div className="mox-card">
            <Heading level={1}>Er is iets misgegaan...</Heading>
            <ErrorBoundary {...props} />
          </div>
        </main>
      </body>
    </html>
  );
}
