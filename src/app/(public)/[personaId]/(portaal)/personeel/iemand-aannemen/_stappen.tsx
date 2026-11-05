"use client";

import { useEffect } from "react";
import StepIndicator from "@/components/StepIndicator";
import { useAannemen } from "./_useAannemen";

/**
 * De stappen naar het voorbeeld van het concept-prototype. Stap 4 beslaat
 * twee schermen: de ingevulde aanvraag controleren en die versturen.
 */
const STAPPEN = [
  {
    name: "Lees wat er kan",
    href: "/personeel/iemand-aannemen",
  },
  {
    name: "Voorbeeldberekening",
    href: "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt",
  },
  {
    name: "Laat de aanvraag invullen",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "Controleren en versturen",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
];

/**
 * Waar de ondernemer is in Iemand aannemen (1 tot 4). Elke stap waar de
 * ondernemer al is geweest, is een link, ook als die na de huidige stap komt.
 */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 | 4 }) => {
  const { staat, werkBij } = useAannemen();
  const verste = Math.max(huidige, staat?.versteStap ?? 1);
  useEffect(() => {
    if (staat && (staat.versteStap ?? 1) < huidige)
      werkBij({ versteStap: huidige });
  }, [staat, huidige, werkBij]);
  return (
    <StepIndicator
      steps={STAPPEN}
      current={huidige - 1}
      reached={verste - 1}
      label="Stappen"
    />
  );
};

export default Stappen;
