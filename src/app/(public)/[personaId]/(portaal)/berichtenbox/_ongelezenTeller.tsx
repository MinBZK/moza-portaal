"use client";

import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { useNieuweBerichten, useUitval } from "./_demoSimulatie";
import {
  telOngelezen,
  useBerichtenboxState,
  type Weergave,
} from "./_useBerichtenboxState";

const OngelezenTeller = ({
  berichten,
  metNieuwe = true,
}: {
  berichten: {
    id: string;
    isOngelezen: boolean;
    afzenderId?: string;
    plek?: Weergave;
  }[];
  /** Binnengedruppelde demo-berichten meetellen. Niet bij het stelsel. */
  metNieuwe?: boolean;
}) => {
  const { staat } = useBerichtenboxState();
  const nieuwe = useNieuweBerichten();
  // Bij demo-berichten: wat een onbereikbare organisatie niet levert, telt niet mee.
  const uitval = useUitval();
  const alle = metNieuwe
    ? [...(nieuwe ?? []), ...berichten].filter(
        (bericht) =>
          !bericht.afzenderId || !uitval.scenario || !uitval.blokkeert(bericht),
      )
    : berichten;
  const aantal = staat ? telOngelezen(staat, alle) : 0;

  if (aantal === 0) return null;
  return (
    <span className="mox-badge-holder">
      <NumberBadge>{aantal}</NumberBadge>
      <VisuallyHidden>ongelezen</VisuallyHidden>
    </span>
  );
};

export default OngelezenTeller;
