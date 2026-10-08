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
import { components } from "@/network/mock/generated";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import Link from "next/link";

const Zaken = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET(
    "/vng/aanvragen/bedrijf/{bedrijfsKvk}",
    {
      params: { path: { bedrijfsKvk: kvk! } },
    },
  );

  return (
    <>
      <Heading level={1}>Zaken</Heading>
      <section className="mox-card" aria-labelledby="nieuwe-aanvraag">
        <Heading level={2} id="nieuwe-aanvraag">
          Nieuwe aanvraag
        </Heading>
        <ActionGroup>
          <Link
            href="/zaken/parkeervergunning/nieuw"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Parkeervergunning aanvragen
          </Link>
          <Link
            href="/zaken/subsidie/nieuw"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Subsidie aanvragen
          </Link>
        </ActionGroup>
      </section>
      <section className="mox-card" aria-labelledby="lopende-aanvragen">
        <Heading level={2} id="lopende-aanvragen">
          Lopende aanvragen
        </Heading>
        <div className="mox-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Referentie</TableHeaderCell>
                <TableHeaderCell scope="col">Type</TableHeaderCell>
                <TableHeaderCell scope="col">Context</TableHeaderCell>
                <TableHeaderCell scope="col">Status</TableHeaderCell>
                <TableHeaderCell scope="col">Datum aanvraag</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) &&
                data.map(
                  (item: components["schemas"]["VngAanvraagResponse"]) => (
                    <TableRow key={item.referentie}>
                      <TableCell>
                        <Link
                          href={`/zaken/${item.type?.toLocaleLowerCase()}/${item.referentie}`}
                          className="utrecht-link utrecht-link--html-a"
                        >
                          {item.referentie}
                        </Link>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.kenteken ?? item.subtype}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        {format(new Date(item.timestamp!), "dd/MM/yyyy")}
                      </TableCell>
                    </TableRow>
                  ),
                )}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
};

export default Zaken;
