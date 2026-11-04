import type { Metadata } from "next";
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
import CollapsibleNavigation from "@/layouts/navigation/collapsibleNavigation";
import FocusModeSwitch from "@/layouts/navigation/focusModeSwitch";
import Vragen from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_vragen";
import Stappen from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_stappen";
import { werkgeverVan } from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_werkgever";
import KostenBerekening from "./_kostenBerekening";

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
      {flow && <CollapsibleNavigation />}
      <Heading level={1}>{aanvraag.titel}</Heading>
      {flow && <FocusModeSwitch />}
      <Paragraph className="rhc-mox-back-link">
        <Link
          href="/lopendezaken#nog-in-te-dienen"
          className="utrecht-link utrecht-link--html-a"
        >
          <Icon icon="chevron-left" />
          Terug naar Lopende zaken
        </Link>
      </Paragraph>

      {flow && (
        <div className="rhc-mox-card rhc-mox-row-gap">
          <Stappen huidige={1} />
          <Paragraph>
            Beantwoord vier vragen. In de voorbeeldberekening ziet u meteen wat
            het u kan opleveren. Daarna vullen wij de aanvraag voor u in.
          </Paragraph>
          <Vragen
            onderneming={flow.werkgever.onderneming}
            toelichting={aanvraag.toelichting}
          />
        </div>
      )}
      {!flow && (
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
            {aanvraag.berekening && (
              <KostenBerekening {...aanvraag.berekening} />
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default AanvraagPage;
