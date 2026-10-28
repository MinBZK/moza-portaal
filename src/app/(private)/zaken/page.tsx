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
import { nl } from "date-fns/locale";
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
      <Heading level={1}>Lopende zaken</Heading>
      <section className="rhc-mox-card" aria-labelledby="nieuwe-aanvraag">
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
      <section className="rhc-mox-card" aria-labelledby="lopende-aanvragen">
        <Heading level={2} id="lopende-aanvragen">
          Uw lopende zaken
        </Heading>
        <div className="rhc-mox-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Referentie</TableHeaderCell>
                <TableHeaderCell scope="col">Soort</TableHeaderCell>
                <TableHeaderCell scope="col">Details</TableHeaderCell>
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
                        {format(new Date(item.timestamp!), "d MMMM yyyy", {
                          locale: nl,
                        })}
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
