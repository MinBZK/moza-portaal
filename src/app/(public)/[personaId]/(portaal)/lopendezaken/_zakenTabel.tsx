import Link from "next/link";
import {
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import type { DemoZaak } from "@/demo";

/** Tabel met zaken. Afgehandelde zaken hebben geen statuskolom. */
const ZakenTabel = ({
  zaken,
  soort,
}: {
  zaken: DemoZaak[];
  soort: DemoZaak["soort"];
}) => (
  <div className="mox-table-container">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
          <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
          <TableHeaderCell scope="col">
            {soort === "lopend" ? "Datum laatste wijziging" : "Afgehandeld op"}
          </TableHeaderCell>
          {soort === "lopend" && (
            <TableHeaderCell scope="col">Status</TableHeaderCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {zaken.map((zaak) => (
          <TableRow key={zaak.id}>
            <TableCell>{zaak.organisatie}</TableCell>
            <TableCell>
              <Link
                href={`/lopendezaken/${zaak.id}`}
                className="utrecht-link utrecht-link--html-a"
              >
                {zaak.titel}
              </Link>
            </TableCell>
            <TableCell>{zaak.datum}</TableCell>
            {soort === "lopend" && (
              <TableCell>
                {zaak.actieNodig ? (
                  <span className="mox-actie-nodig">
                    <Icon icon="let-op" />
                    {zaak.status}
                  </span>
                ) : (
                  zaak.status
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default ZakenTabel;
