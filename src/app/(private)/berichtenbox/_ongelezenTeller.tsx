"use client";

import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { telOngelezen, useBerichtenboxState } from "./_useBerichtenboxState";

const OngelezenTeller = ({
  berichten,
}: {
  berichten: { id: string; isOngelezen: boolean }[];
}) => {
  const { staat } = useBerichtenboxState();
  const aantal = staat ? telOngelezen(staat, berichten) : 0;

  if (aantal === 0) return null;
  return (
    <>
      <NumberBadge>{aantal}</NumberBadge>
      <VisuallyHidden>ongelezen</VisuallyHidden>
    </>
  );
};

export default OngelezenTeller;
