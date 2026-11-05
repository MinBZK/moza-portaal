"use client";

import { NumberBadge, VisuallyHidden } from "@/components/rhc";
import { useAssistentZaken } from "./_assistentZaken";

/** Aantal in het menu: zaken die de Digitale assistent aanmaakte. */
const ZakenBadge = () => {
  const aantal = useAssistentZaken()?.length ?? 0;
  if (aantal === 0) return null;
  // Het getal staat al in de badge; zeg alleen nog waar het over gaat.
  return (
    <span className="mox-badge-holder">
      <NumberBadge>{aantal}</NumberBadge>
      <VisuallyHidden> nieuw</VisuallyHidden>
    </span>
  );
};

export default ZakenBadge;
