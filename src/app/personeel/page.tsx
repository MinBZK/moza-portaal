import { Button, Card } from "@/components/nl-design-system";
import zakenClient from "@/network/mock";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import { InlineLink } from "@/components/nl-design-system/nextIntegration/InlineLink";

const Personeel = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET("/uwv/meldingen/{bedrijfsKvk}", {
    params: { path: { bedrijfsKvk: kvk! } },
  });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-12">
          <Card heading={"Nieuwe meldingen"} className="space-y-4">
            <div className="flex flex-col gap-2">
              <InlineLink href="/personeel/zwangerschapsverlof/nieuw">
                <Button>Zwangerschapsverlof melden</Button>
              </InlineLink>
            </div>
          </Card>
          <Card heading={"Lopende meldingen"} className="space-y-4">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Referentie</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Datum aanvraag</th>
                  <th className="px-4 py-2 text-left">Acties</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {data?.map((item) => {
                  return (
                    <tr key={item.referentie} className="border-t">
                      <td className="px-4 py-2">{item.referentie}</td>

                      <td className="px-4 py-2">{item.status}</td>

                      <td className="px-4 py-2">
                        {format(new Date(item.ontvangenOp!), "dd/MM/yyyy")}
                      </td>

                      <td className="px-4 py-2">
                        <InlineLink
                          className="text-blue-400 underline"
                          href={`/personeel/zwangerschapsverlof/${item.referentie}`}
                        >
                          Opmerking toevoegen
                        </InlineLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Personeel;
