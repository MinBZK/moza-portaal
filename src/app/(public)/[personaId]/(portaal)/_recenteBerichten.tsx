"use client";

import {
  Paragraph,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import type { DemoBericht } from "@/demo";
import BerichtRij from "./berichtenbox/_berichtRij";
import {
  isGemarkeerd,
  isOngelezen,
  statusVan,
  useBerichtenboxState,
} from "./berichtenbox/_useBerichtenboxState";

const AANTAL = 5;

/** De nieuwste berichten uit de inbox. */
const RecenteBerichten = ({ berichten }: { berichten: DemoBericht[] }) => {
  const { staat, zetGemarkeerd } = useBerichtenboxState();

  if (!staat) {
    return <Paragraph role="status">Uw berichten worden geladen.</Paragraph>;
  }

  const recent = berichten
    .filter((bericht) => statusVan(staat, bericht.id) === "inbox")
    .slice(0, AANTAL);

  if (recent.length === 0) {
    return <Paragraph>Er staan geen berichten in uw inbox.</Paragraph>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell scope="col">
              <VisuallyHidden>Gemarkeerd</VisuallyHidden>
            </TableHeaderCell>
            <TableHeaderCell scope="col">Afzender</TableHeaderCell>
            <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
            <TableHeaderCell scope="col">Datum</TableHeaderCell>
            <TableHeaderCell scope="col">
              <VisuallyHidden>Bijlage</VisuallyHidden>
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recent.map((bericht) => {
            const gemarkeerd = isGemarkeerd(staat, bericht.id);
            return (
              <BerichtRij
                key={bericht.id}
                bericht={bericht}
                ongelezen={isOngelezen(staat, bericht.id, bericht.isOngelezen)}
                gemarkeerd={gemarkeerd}
                onMarkeer={() => zetGemarkeerd(bericht.id, !gemarkeerd)}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecenteBerichten;
