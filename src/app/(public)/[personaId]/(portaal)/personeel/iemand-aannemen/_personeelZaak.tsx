"use client";

import Link from "next/link";
import {
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@/components/rhc";
import type { DemoAannemen, DemoAannemenSituatie } from "@/demo";
import { statusTekst, useAannemen, zaakVan } from "./_useAannemen";
import { datumNL } from "./_werkgever";

const SITUATIES: DemoAannemenSituatie[] = ["gemeente", "wajong", "wia"];

/** Op Personeel: de zaak van elke situatie met een ingediende aanvraag. */
const PersoneelZaak = ({
  zaken,
}: {
  zaken: Record<DemoAannemenSituatie, DemoAannemen["zaak"]>;
}) => {
  const { staat } = useAannemen();
  const lopend = staat
    ? SITUATIES.filter((situatie) => zaakVan(staat, situatie).ingediend)
    : [];
  if (!staat || lopend.length === 0) return null;
  return (
    <section className="rhc-mox-card" aria-labelledby="personeel-zaken">
      <Heading level={2} id="personeel-zaken">
        Lopende zaken over personeel
      </Heading>
      {/* Same columns as the table on Lopende zaken. */}
      <div className="rhc-mox-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
              <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
              <TableHeaderCell scope="col">Laatste wijziging</TableHeaderCell>
              <TableHeaderCell scope="col">Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lopend.map((situatie) => {
              const zaak = zaakVan(staat, situatie);
              const onderwerp = zaak.onderwerp ?? zaken[situatie].onderwerp;
              return (
                <TableRow key={situatie}>
                  <TableCell>{zaken[situatie].organisatie}</TableCell>
                  <TableCell>
                    <Link
                      href={zaken[situatie].url}
                      className="utrecht-link utrecht-link--html-a"
                    >
                      {onderwerp}
                    </Link>
                  </TableCell>
                  <TableCell className="rhc-mox-table-cell-date">
                    {zaak.verstuurdOp ? datumNL(zaak.verstuurdOp) : ""}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={zaken[situatie].url}
                      className="utrecht-link utrecht-link--html-a"
                    >
                      {statusTekst(zaak, situatie)}
                      <VisuallyHidden>: {onderwerp}</VisuallyHidden>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default PersoneelZaak;
