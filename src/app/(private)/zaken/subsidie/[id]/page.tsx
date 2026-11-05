import { DataSummary, DataSummaryItem, Heading } from "@/components/rhc";
import { components } from "@/network/mock/generated";
import zakenClient from "@/network/mock";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const SubsidieDetail = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { data } = await zakenClient.GET("/vng/aanvragen/{id}", {
    params: { path: { id: id } },
  });
  const aanvraag = data as components["schemas"]["VngAanvraagResponse"];

  const gegevens = [
    { label: "Referentie", waarde: aanvraag.referentie },
    { label: "KVK-nummer", waarde: aanvraag.bedrijfsKvk },
    { label: "Soort subsidie", waarde: aanvraag.subtype },
    { label: "Motivatie", waarde: aanvraag.motivatie },
    { label: "Status", waarde: aanvraag.status },
    { label: "Type", waarde: aanvraag.type },
    {
      label: "Datum aanvraag",
      waarde: format(new Date(aanvraag.timestamp!), "d MMMM yyyy", {
        locale: nl,
      }),
    },
  ];

  return (
    <>
      <Heading level={1}>Uw aanvraag</Heading>
      <div className="rhc-mox-card">
        <DataSummary appearance="column">
          {gegevens.map(({ label, waarde }) => (
            <DataSummaryItem
              key={label}
              itemKey={label}
              itemValue={String(waarde ?? "")}
            />
          ))}
        </DataSummary>
      </div>
    </>
  );
};

export default SubsidieDetail;
