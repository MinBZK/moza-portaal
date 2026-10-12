"use client";

import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { useAssistentZaken } from "./_assistentZaken";

/** Aantal zaken dat de Digitale assistent aanmaakte, in het menu. */
const ZakenBadge = () => {
  const aantal = useAssistentZaken()?.length ?? 0;
  if (aantal === 0) return null;
  return (
    <>
      <NumberBadge>{aantal}</NumberBadge>
      <VisuallyHidden>nieuw</VisuallyHidden>
    </>
  );
};

export default ZakenBadge;
