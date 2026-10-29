import type { Metadata } from "next";
import {
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  AccordionProvider,
} from "@/components/rhc";
import {
  getDemoPersona,
  getDemoVerwerkingen,
  getDemoVerwerkingVerwachtingen,
  getDemoVerwerkingVragen,
} from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import ActivityLog from "./_activityLog";

export const metadata: Metadata = { title: "Gegevensdeling en dataverwerking" };

const DataverwerkingPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ personaId: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) => {
  const { pagina } = await searchParams;
  const persona = await getDemoPersona((await params).personaId);
  const organisatie = await getActieveOrganisatie(persona);
  const [verwerkingen, verwachtingen, vragen] = await Promise.all([
    getDemoVerwerkingen(organisatie),
    getDemoVerwerkingVerwachtingen(),
    getDemoVerwerkingVragen(),
  ]);

  return (
    <>
      <Heading level={1}>Gegevensdeling en dataverwerking</Heading>
      <Paragraph>
        Hier ziet u hoe overheidsorganisaties de gegevens van uw bedrijf delen
        en gebruiken.
      </Paragraph>

      <div className="rhc-mox-card">
        <Heading level={2}>Geschiedenis</Heading>
        <Paragraph>
          Dit is een overzicht van hoe uw bedrijfsgegevens worden gedeeld en
          verwerkt door overheidsorganisaties.
        </Paragraph>
        <ActivityLog entries={verwerkingen} page={Number(pagina) || 1} />
      </div>

      <div className="rhc-mox-card">
        <Heading level={2}>Wat kunt u straks doen?</Heading>
        <UnorderedList>
          {verwachtingen.map((verwachting) => (
            <UnorderedListItem key={verwachting}>
              {verwachting}
            </UnorderedListItem>
          ))}
        </UnorderedList>
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default DataverwerkingPage;
