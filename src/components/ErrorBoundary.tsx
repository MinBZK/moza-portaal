"use client";

import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function ErrorBoundary({ reset }: ErrorBoundaryProps) {
  return (
    <>
      <Alert type="error">
        <Paragraph>
          Wij kunnen deze pagina nu niet tonen. Probeer het opnieuw. Lukt het
          niet? Probeer het later nog een keer.
        </Paragraph>
      </Alert>
      <ActionGroup>
        <Button appearance="primary-action-button" onClick={() => reset()}>
          Opnieuw proberen
        </Button>
      </ActionGroup>
    </>
  );
}
