import { notFound } from "next/navigation";
import { DataSummary, DataSummaryItem, Heading } from "@/components/rhc";
import { getDemoZaakById } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import StatusTrack from "../_statusTrack";
import ZakenTabs from "../_zakenTabs";

const ZaakPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const zaak = await getDemoZaakById((await params).id);
  if (!zaak) notFound();

  const voortgang = (
    <section aria-labelledby="zaak-voortgang">
      <Heading level={2} id="zaak-voortgang">
        Voortgang
      </Heading>
      <StatusTrack stappen={zaak.stappen} />
    </section>
  );
  const gegevens = (
    <section aria-labelledby="zaak-gegevens">
      <Heading level={2} id="zaak-gegevens">
        Over deze zaak
      </Heading>
      <DataSummary appearance="column">
        <DataSummaryItem itemKey="Organisatie" itemValue={zaak.organisatie} />
        {zaak.gegevens.map(({ label, waarde }) => (
          <DataSummaryItem key={label} itemKey={label} itemValue={waarde} />
        ))}
      </DataSummary>
    </section>
  );

  return (
    <>
      <HuidigeKruimel pad={`/lopendezaken/${zaak.id}`} label={zaak.titel} />
      <div className="mox-card mox-row-gap">
        <ZakenTabs actief={zaak.soort} />
        <Heading level={1}>{zaak.titel}</Heading>
        {zaak.gegevensBovenaan ? (
          <>
            {gegevens}
            {voortgang}
          </>
        ) : (
          <>
            {voortgang}
            {gegevens}
          </>
        )}
      </div>
    </>
  );
};

export default ZaakPage;
