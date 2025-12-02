"use client";

import Button from "@/components/button";
import Card from "@/components/card";
import { Notification } from "@/components/notifications";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="*:mb-4">
      <Notification variant="error">
        <h1>Er is een fout opgetreden</h1>
        {error.message}
      </Notification>
      <Card>
        <Button type={"button"} onClick={() => reset()}>
          Probeer opnieuw
        </Button>
      </Card>
    </div>
  );
}
