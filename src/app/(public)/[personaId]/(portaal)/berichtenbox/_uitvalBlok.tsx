"use client";

import type { ReactNode } from "react";
import { Alert, Button, Paragraph } from "@/components/rhc";
import { useUitval } from "./_demoSimulatie";

/**
 * De inhoud van een bericht, tenzij de organisatie die het stuurde in de
 * nagebootste storing niet bereikbaar is. Dan zegt de detailpagina hetzelfde
 * als de inbox.
 */
const UitvalBlok = ({
  afzenderId,
  children,
}: {
  afzenderId: string;
  children: ReactNode;
}) => {
  const uitval = useUitval();
  if (!uitval.scenario || !uitval.blokkeert({ afzenderId })) return children;

  return (
    <Alert type="warning">
      <Paragraph>
        Dit bericht is nu niet beschikbaar, omdat{" "}
        {uitval.bron ? <b>{uitval.bron.naam}</b> : "de organisatie"} niet
        bereikbaar is. Probeer het later opnieuw.
      </Paragraph>
      <Button appearance="secondary-action-button" onClick={uitval.herstel}>
        Opnieuw proberen
      </Button>
    </Alert>
  );
};

export default UitvalBlok;
