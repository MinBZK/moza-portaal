import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Alert,
  DataSummary,
  DataSummaryItem,
  Heading,
  Icon,
  Paragraph,
} from "@/components/rhc";
import {
  getActieveOrganisatie,
  getActievePersona,
} from "@/app/(public)/_persona";
import {
  getDemoConceptAanvraagById,
  getDemoIemandAannemen,
  getDemoIemandAannemenTraces,
} from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import Vragen from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_vragen";
import { werkgeverVan } from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_werkgever";
import Stappen from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_stappen";
import KostenBerekening from "./_kostenBerekening";

/** Een aanvraag die nog niet is ingediend, om verder in te vullen. */
const AanvraagPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [{ id }, persona] = await Promise.all([params, getActievePersona()]);
  const aanvraag = await getDemoConceptAanvraagById(persona?.id, id);
  if (!aanvraag) notFound();
  // De flow "iemand aannemen" rekent met de regelrecht-engine op de antwoorden
  // van de ondernemer; de werkgever is de actieve organisatie van de persona.
  const flow =
    aanvraag.flow === "iemand-aannemen"
      ? await Promise.all([
          getDemoIemandAannemen(),
          getDemoIemandAannemenTraces(),
          getActieveOrganisatie(persona),
        ]).then(([aannemen, traces, organisatie]) => ({
          aannemen,
          traces,
          werkgever: werkgeverVan(organisatie),
        }))
      : null;

  return (
    <>
      <HuidigeKruimel
        pad={`/lopendezaken/aanvragen/${aanvraag.id}`}
        label={aanvraag.titel}
      />
      <Heading level={1}>{aanvraag.titel}</Heading>
      <Paragraph>
        <Link
          href="/lopendezaken#nog-in-te-dienen"
          className="utrecht-link utrecht-link--html-a"
        >
          <Icon icon="chevron-left" />
          Terug naar Lopende zaken
        </Link>
      </Paragraph>

      {flow && (
        <>
          <Stappen huidige={1} />
          <Paragraph>
            Beantwoord vier vragen. Rechts ziet u meteen wat het u kost en
            oplevert. Daarna vullen wij de aanvraag voor u in.
          </Paragraph>
        </>
      )}
      {!flow && (
        <div className="rhc-mox-card rhc-mox-row-gap">
          {aanvraag.indienenVoor && (
            <Alert type="info">
              Verstuur de aanvraag voor {aanvraag.indienenVoor}.
            </Alert>
          )}

          <section>
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
            {!flow &&
              aanvraag.toelichting?.map((alinea) => (
                <Paragraph key={alinea}>{alinea}</Paragraph>
              ))}
          </section>

          {!flow && (
            <section aria-labelledby="aanvraag-kosten">
              <Heading level={2} id="aanvraag-kosten">
                Wat kost het {aanvraag.onderneming ?? "uw onderneming"}?
              </Heading>
              <Paragraph>
                Deze berekening blijft op uw scherm. Er gaat niets naar een
                overheidsorganisatie.
              </Paragraph>
              {aanvraag.berekening && (
                <KostenBerekening {...aanvraag.berekening} />
              )}
            </section>
          )}
        </div>
      )}
      {flow && (
        <Vragen
          onderneming={flow.werkgever.onderneming}
          toelichting={aanvraag.toelichting}
        />
      )}
    </>
  );
};

export default AanvraagPage;
