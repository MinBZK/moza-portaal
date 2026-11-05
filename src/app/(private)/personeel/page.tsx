import {
  ActionGroup,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@/components/rhc";
import zakenClient from "@/network/mock";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import Link from "next/link";

const Personeel = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET("/uwv/meldingen/{bedrijfsKvk}", {
    params: { path: { bedrijfsKvk: kvk! } },
  });

  return (
    <>
      <Heading level={1}>Personeel en rollen</Heading>
      <section className="rhc-mox-card" aria-labelledby="nieuwe-meldingen">
        <Heading level={2} id="nieuwe-meldingen">
          Nieuwe meldingen
        </Heading>
        <ActionGroup>
          <Link
            href="/personeel/zwangerschapsverlof/nieuw"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Zwangerschapsverlof melden
          </Link>
        </ActionGroup>
      </section>
      <section className="rhc-mox-card" aria-labelledby="lopende-meldingen">
        <Heading level={2} id="lopende-meldingen">
          Lopende meldingen
        </Heading>
        <div className="rhc-mox-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Referentie</TableHeaderCell>
                <TableHeaderCell scope="col">Status</TableHeaderCell>
                <TableHeaderCell scope="col">Datum aanvraag</TableHeaderCell>
                <TableHeaderCell scope="col">Acties</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.referentie}>
                  <TableCell>{item.referentie}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="rhc-mox-table-cell-date">
                    {format(new Date(item.ontvangenOp!), "d MMMM yyyy", {
                      locale: nl,
                    })}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/personeel/zwangerschapsverlof/${item.referentie}`}
                      className="utrecht-link utrecht-link--html-a"
                    >
                      Opmerking toevoegen{" "}
                      <VisuallyHidden>
                        bij melding{item.referentie}
                      </VisuallyHidden>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
};

export default Personeel;
