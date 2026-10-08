import { DataSummary, DataSummaryItem, Heading } from "@/components/rhc";
import { components } from "@/network/mock/generated";
import zakenClient from "@/network/mock";
import { format } from "date-fns";

const ParkeervergunningDetail = async ({
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
    { label: "BedrijfsKvk", waarde: aanvraag.bedrijfsKvk },
    { label: "Kenteken", waarde: aanvraag.kenteken },
    { label: "Motivatie", waarde: aanvraag.motivatie },
    { label: "Status", waarde: aanvraag.status },
    { label: "Type", waarde: aanvraag.type },
    {
      label: "Timestamp",
      waarde: format(new Date(aanvraag.timestamp!), "dd/MM/yyyy"),
    },
  ];

  return (
    <>
      <Heading level={1}>Parkeervergunning details</Heading>
      <div className="mox-card">
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

export default ParkeervergunningDetail;
