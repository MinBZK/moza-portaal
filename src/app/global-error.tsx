"use client";

import { Card } from "@/components/nl-design-system";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function GlobalError(props: ErrorBoundaryProps) {
  return (
    <html lang="nl">
      <head>
        <title>MijnOverheid Zakelijk - global error</title>
      </head>
      <body>
        <main className="container p-6">
          <Card heading={"Er is iets misgegaan..."} headingLevel={1}>
            <ErrorBoundary {...props} />
          </Card>
        </main>
      </body>
    </html>
  );
}
