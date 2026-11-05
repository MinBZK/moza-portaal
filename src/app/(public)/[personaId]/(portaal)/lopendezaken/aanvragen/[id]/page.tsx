import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  Alert,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import { getActievePersona } from "@/app/(public)/_persona";
import { getDemoConceptAanvraagById } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import KostenBerekening from "./_kostenBerekening";
import PageSearch from "@/layouts/search";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const [{ id }, persona] = await Promise.all([params, getActievePersona()]);
  const aanvraag = await getDemoConceptAanvraagById(persona?.id, id);
  return { title: `${aanvraag?.titel ?? "Aanvraag"} - Lopende zaken` };
};

/** Een aanvraag die nog niet is ingediend, om verder in te vullen. */
const AanvraagPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [{ id }, persona] = await Promise.all([params, getActievePersona()]);
  const aanvraag = await getDemoConceptAanvraagById(persona?.id, id);
  if (!aanvraag) notFound();
  // Iemand aannemen hoort bij Personeel en rollen; oude links komen daar uit.
  if (aanvraag.flow === "iemand-aannemen")
    redirect("/personeel/iemand-aannemen/voorbeeldberekening");
  return (
    <>
      <HuidigeKruimel
        pad={`/lopendezaken/aanvragen/${aanvraag.id}`}
        label={aanvraag.titel}
      />
      <Heading level={1}>{aanvraag.titel}</Heading>
      <PageSearch />

      <div className="rhc-mox-card rhc-mox-row-gap">
        {aanvraag.indienenVoor && (
          <Alert type="info" closable>
            Verstuur de aanvraag voor {aanvraag.indienenVoor}.
          </Alert>
        )}

        <section className="rhc-mox-stack">
          <DataSummary appearance="column">
            <DataSummaryItem
              itemKey="Organisatie"
              itemValue={aanvraag.organisatie}
            />
            <DataSummaryItem
              itemKey="Tijdsduur"
              itemValue={aanvraag.tijdsduur}
            />
          </DataSummary>
          {aanvraag.toelichting?.map((alinea) => (
            <Paragraph key={alinea}>{alinea}</Paragraph>
          ))}
        </section>

        <section className="rhc-mox-stack" aria-labelledby="aanvraag-kosten">
          <Heading level={2} id="aanvraag-kosten">
            Wat kost het {aanvraag.onderneming ?? "uw onderneming"}?
          </Heading>
          <Paragraph>
            Deze berekening blijft op uw scherm. Er gaat niets naar een
            overheidsorganisatie.
          </Paragraph>
          {aanvraag.berekening && <KostenBerekening {...aanvraag.berekening} />}
        </section>
      </div>
    </>
  );
};

export default AanvraagPage;
