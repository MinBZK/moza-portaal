"use client";

import Link from "next/link";
import {
  Button,
  Heading,
  Icon,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@/components/rhc";
import type { DemoConceptAanvraag } from "@/demo";
import { useAfgerondeAanvragen } from "./_afgerondeAanvragen";

/** Aanvragen die nog verstuurd moeten worden; afgeronde aanvragen niet. */
const ConceptAanvragen = ({
  aanvragen,
}: {
  aanvragen: DemoConceptAanvraag[];
}) => {
  const afgerond = useAfgerondeAanvragen();
  const open = aanvragen.filter((aanvraag) => !afgerond.includes(aanvraag.id));
  if (open.length === 0) return null;
  return (
    <section className="rhc-mox-card" aria-labelledby="nog-in-te-dienen">
      <Heading level={2} id="nog-in-te-dienen">
        Aanvragen die u nog moet versturen
      </Heading>
      <Paragraph>
        Deze aanvragen heeft u opgeslagen, maar nog niet verstuurd.
        {/* Alleen een uiterste datum noemen als een aanvraag er een heeft. */}
        {open.some((aanvraag) => aanvraag.indienenVoor) &&
          " Verstuur ze voor de uiterste datum."}
      </Paragraph>
      <div className="rhc-mox-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell scope="col">Aanvraag</TableHeaderCell>
              <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
              <TableHeaderCell scope="col">Tijdsduur</TableHeaderCell>
              <TableHeaderCell scope="col">
                <VisuallyHidden>Acties</VisuallyHidden>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {open.map((aanvraag) => (
              <TableRow key={aanvraag.id}>
                <TableCell>{aanvraag.titel}</TableCell>
                <TableCell>{aanvraag.organisatie}</TableCell>
                <TableCell>{aanvraag.tijdsduur}</TableCell>
                <TableCell>
                  <Link
                    href={`/lopendezaken/aanvragen/${aanvraag.id}`}
                    className="utrecht-link"
                  >
                    <Button appearance="subtle-button">
                      <Icon icon="bewerken" />
                      Bewerken
                    </Button>
                    <VisuallyHidden>: {aanvraag.titel}</VisuallyHidden>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default ConceptAanvragen;
