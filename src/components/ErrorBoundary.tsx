"use client";

import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <>
      <Alert type="error">
        <Paragraph>{error.message}</Paragraph>
      </Alert>
      <ActionGroup>
        <Button appearance="primary-action-button" onClick={() => reset()}>
          Opnieuw proberen
        </Button>
      </ActionGroup>
    </>
  );
}
