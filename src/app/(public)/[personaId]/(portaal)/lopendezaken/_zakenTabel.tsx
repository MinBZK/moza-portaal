import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Alert,
  VisuallyHidden,
} from "@/components/rhc";
import type { DemoZaak } from "@/demo";
import AssistentZakenRijen from "./_assistentZakenRijen";

/**
 * De status als link naar de zaak. Vraagt de zaak iets van u, dan is de hele
 * waarschuwing de link. Voor schermlezers staat de zaak erbij, anders klinken
 * alle statuslinks hetzelfde ("In behandeling").
 */
const StatusLink = ({ zaak }: { zaak: DemoZaak }) => {
  const tekst = (
    <>
      {zaak.status}
      <VisuallyHidden>: {zaak.titel}</VisuallyHidden>
    </>
  );
  return zaak.actieNodig ? (
    <Link href={`/lopendezaken/${zaak.id}`} className="rhc-mox-alert-link">
      <Alert type="warning">{tekst}</Alert>
    </Link>
  ) : (
    <Link
      href={`/lopendezaken/${zaak.id}`}
      className="utrecht-link utrecht-link--html-a"
    >
      {tekst}
    </Link>
  );
};

/** Tabel met zaken. Afgehandelde zaken hebben geen statuskolom. */
const ZakenTabel = ({
  zaken,
  soort,
}: {
  zaken: DemoZaak[];
  soort: DemoZaak["soort"];
}) => (
  <div className="rhc-mox-table-container">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
          <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
          <TableHeaderCell scope="col">
            {soort === "lopend" ? "Laatste wijziging" : "Afgehandeld op"}
          </TableHeaderCell>
          {soort === "lopend" && (
            <TableHeaderCell scope="col">Status</TableHeaderCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {soort === "lopend" && <AssistentZakenRijen />}
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
                <StatusLink zaak={zaak} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default ZakenTabel;
