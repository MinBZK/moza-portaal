"use client";

import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { useAssistentZaken } from "./_assistentZaken";

/**
 * Aantal in het menu: zaken die de Digitale assistent aanmaakte, plus
 * aanvragen die nog niet zijn ingediend.
 */
const ZakenBadge = ({ nogInTeDienen = 0 }: { nogInTeDienen?: number }) => {
  const nieuw = useAssistentZaken()?.length ?? 0;
  const aantal = nieuw + nogInTeDienen;
  if (aantal === 0) return null;
  // Het getal staat al in de badge; zeg alleen nog waar het over gaat.
  const uitleg =
    nieuw > 0 && nogInTeDienen > 0
      ? `: ${nieuw} nieuw, ${nogInTeDienen} nog in te dienen`
      : nieuw > 0
        ? " nieuw"
        : " nog in te dienen";
  return (
    <span className="mox-badge-holder">
      <NumberBadge>{aantal}</NumberBadge>
      <VisuallyHidden>{uitleg}</VisuallyHidden>
    </span>
  );
};

export default ZakenBadge;
