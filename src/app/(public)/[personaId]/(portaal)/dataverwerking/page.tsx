import {
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  DataSummary,
  DataSummaryItem,
  AccordionProvider,
} from "@/components/rhc";
import { formatDistanceToNowStrict } from "date-fns";
import { nl } from "date-fns/locale";
import {
  getDemoPersona,
  getDemoVerwerkingen,
  getDemoVerwerkingVerwachtingen,
  getDemoVerwerkingVragen,
} from "@/demo";

// Tijden in Nederlandse tijd, ook als de server in UTC draait.
const datumTijd = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

const DataverwerkingPage = async ({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) => {
  const persona = await getDemoPersona((await params).personaId);
  const [verwerkingen, verwachtingen, vragen] = await Promise.all([
    getDemoVerwerkingen(persona?.bedrijf),
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

      <div className="mox-card">
        <Heading level={2}>Activiteitenlogboek</Heading>
        <Paragraph>
          Dit is een overzicht van hoe uw bedrijfsgegevens worden gedeeld en
          verwerkt door overheidsorganisaties.
        </Paragraph>
        <AccordionProvider
          headingLevel={3}
          sections={verwerkingen.map(
            ({ id, organisatie, tijdstip, gegevens }) => ({
              id,
              label: `${organisatie} (${formatDistanceToNowStrict(new Date(tijdstip), { addSuffix: true, locale: nl })})`,
              body: (
                <>
                  <Paragraph>
                    <time dateTime={tijdstip}>
                      {datumTijd.format(new Date(tijdstip))}
                    </time>
                  </Paragraph>
                  <DataSummary appearance="column">
                    {gegevens.map(({ soort, waarde }) => (
                      <DataSummaryItem
                        key={soort}
                        itemKey={soort}
                        itemValue={waarde}
                      />
                    ))}
                  </DataSummary>
                </>
              ),
            }),
          )}
        />
      </div>

      <div className="mox-card">
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
