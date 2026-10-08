import {
  ActionGroup,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import zakenClient from "@/network/mock";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import Link from "next/link";

const Personeel = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET("/uwv/meldingen/{bedrijfsKvk}", {
    params: { path: { bedrijfsKvk: kvk! } },
  });

  return (
    <>
      <Heading level={1}>Personeel</Heading>
      <section className="mox-card" aria-labelledby="nieuwe-meldingen">
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
      <section className="mox-card" aria-labelledby="lopende-meldingen">
        <Heading level={2} id="lopende-meldingen">
          Lopende meldingen
        </Heading>
        <div className="mox-table-container">
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
                  <TableCell>
                    {format(new Date(item.ontvangenOp!), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/personeel/zwangerschapsverlof/${item.referentie}`}
                      className="utrecht-link utrecht-link--html-a"
                    >
                      Opmerking toevoegen
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
