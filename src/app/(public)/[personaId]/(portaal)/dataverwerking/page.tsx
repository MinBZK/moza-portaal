import {
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  DataSummary,
  DataSummaryItem,
  AccordionProvider,
  Separator,
} from "@/components/rhc";
import {
  getDemoVerwerkingen,
  getDemoVerwerkingVerwachtingen,
  getDemoVerwerkingVragen,
} from "@/demo";

const DataverwerkingPage = async () => {
  const [verwerkingen, verwachtingen, vragen] = await Promise.all([
    getDemoVerwerkingen(),
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
        {verwerkingen.map((verwerking) => (
          <div key={verwerking.id}>
            <Heading level={3}>{verwerking.organisatie}</Heading>
            <Paragraph>{verwerking.datum}</Paragraph>
            <DataSummary appearance="column">
              {verwerking.gegevens.map(({ soort, waarde }) => (
                <DataSummaryItem
                  key={soort}
                  itemKey={soort}
                  itemValue={waarde}
                />
              ))}
            </DataSummary>
            <Separator />
          </div>
        ))}
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
      <AccordionProvider
        sections={vragen.map(({ vraag, antwoord }) => ({
          label: vraag,
          body: <Paragraph>{antwoord}</Paragraph>,
        }))}
      />
    </>
  );
};

export default DataverwerkingPage;
