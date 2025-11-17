"use client";

import {
  Button,
  Card,
  Alert,
  Heading,
  Paragraph,
} from "@/components/nl-design-system";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="*:mb-4">
      <Alert type="error">
        <Heading level={2} appearanceLevel={3}>
          Error
        </Heading>
        <Paragraph>{error.message}</Paragraph>
      </Alert>
      <Card heading={undefined}>
        <Button type={"button"} onClick={() => reset()}>
          Probeer opnieuw
        </Button>
      </Card>
    </div>
  );
}
