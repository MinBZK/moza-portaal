import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Icon,
  Paragraph,
} from "@/components/rhc";
import { getActievePersona } from "@/app/(public)/_persona";
import { getDemoConceptAanvraagById } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";

/** Een aanvraag die nog niet is ingediend, om verder in te vullen. */
const AanvraagPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [{ id }, persona] = await Promise.all([params, getActievePersona()]);
  const aanvraag = await getDemoConceptAanvraagById(persona?.id, id);
  if (!aanvraag) notFound();

  return (
    <>
      <HuidigeKruimel
        pad={`/lopendezaken/aanvragen/${aanvraag.id}`}
        label={aanvraag.titel}
      />
      <div className="mox-card rhc-row-gap">
        <Heading level={1}>{aanvraag.titel}</Heading>
        <Paragraph>
          U heeft deze aanvraag opgeslagen, maar nog niet ingediend. Dien de
          aanvraag in voor {aanvraag.indienenVoor}.
        </Paragraph>

        <section aria-labelledby="aanvraag-gegevens">
          <Heading level={2} id="aanvraag-gegevens">
            Over deze aanvraag
          </Heading>
          <DataSummary appearance="column">
            <DataSummaryItem
              itemKey="Organisatie"
              itemValue={aanvraag.organisatie}
            />
            <DataSummaryItem
              itemKey="Onderneming"
              itemValue={aanvraag.onderneming}
            />
            <DataSummaryItem
              itemKey="Tijdsduur"
              itemValue={aanvraag.tijdsduur}
            />
            <DataSummaryItem
              itemKey="Indienen voor"
              itemValue={aanvraag.indienenVoor}
            />
          </DataSummary>
        </section>

        <Paragraph>
          <Link
            href="/lopendezaken#nog-in-te-dienen"
            className="utrecht-link utrecht-link--html-a"
          >
            <Icon icon="chevron-left" />
            Terug naar Lopende zaken
          </Link>
        </Paragraph>
      </div>
    </>
  );
};

export default AanvraagPage;
