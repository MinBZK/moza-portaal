"use client";

import Link from "next/link";
import {
  TableCell,
  TableRow,
} from "@rijkshuisstijl-community/components-react";
import {
  useAssistentZaken,
  veld,
  zaakDatum,
  zaakRoute,
} from "./_assistentZaken";

/** Zaken uit de Digitale assistent, nieuwste eerst, bovenaan het overzicht. */
const AssistentZakenRijen = () => {
  const zaken = useAssistentZaken();
  if (!zaken?.length) return null;
  return (
    <>
      {[...zaken]
        .sort((a, b) => b.aangemaaktOp - a.aangemaaktOp)
        .map((zaak) => {
          const onderwerp =
            veld(zaak, ["onderwerp", "titel"]) ||
            veld(zaak, ["zaak_type"]) ||
            "Zaak";
          const route = zaakRoute(zaak);
          return (
            <TableRow key={zaak.id}>
              <TableCell>
                {veld(zaak, ["organisatie", "organization", "org"])}
              </TableCell>
              <TableCell>
                {route ? (
                  <Link
                    href={route}
                    className="utrecht-link utrecht-link--html-a"
                  >
                    {onderwerp}
                  </Link>
                ) : (
                  onderwerp
                )}
              </TableCell>
              <TableCell className="rhc-mox-table-cell-date">
                {zaakDatum(zaak)}
              </TableCell>
              <TableCell>{veld(zaak, ["status", "statusLabel"])}</TableCell>
            </TableRow>
          );
        })}
    </>
  );
};

export default AssistentZakenRijen;
