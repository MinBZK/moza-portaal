import {
  Heading,
  Paragraph,
  DataSummary,
  DataSummaryItem,
  UnorderedList,
  UnorderedListItem,
  AccordionProvider,
  ActionGroup,
  Button,
  Separator,
} from "@/components/rhc";
import {
  getDemoContactgegevens,
  getDemoContactorganisaties,
  getDemoContactkanalen,
  getDemoContactvragen,
} from "@/demo";

const ContactvoorkeurenPage = async () => {
  const [contactgegevens, organisaties, kanalen, vragen] = await Promise.all([
    getDemoContactgegevens(),
    getDemoContactorganisaties(),
    getDemoContactkanalen(),
    getDemoContactvragen(),
  ]);

  const aangesloten = organisaties.filter(
    (organisatie) => organisatie.aangesloten,
  );

  return (
    <>
      <Heading level={1}>Contactvoorkeuren</Heading>
      <Paragraph>
        Uw contactgegevens en de organisaties die deze mogen gebruiken.
      </Paragraph>

      <div className="mox-card">
        <Heading level={2}>Contactgegevens</Heading>
        <DataSummary appearance="column">
          {contactgegevens.map(({ label, waarde }) => (
            <DataSummaryItem key={label} itemKey={label} itemValue={waarde} />
          ))}
        </DataSummary>
        <ActionGroup direction="row">
          <Button appearance="secondary-action-button">
            Contactgegevens wijzigen
          </Button>
        </ActionGroup>
      </div>

      <div className="mox-card">
        <Heading level={2}>Aangesloten organisaties</Heading>
        <Paragraph>
          Deze organisaties gebruiken uw contactgegevens om u te bereiken. U
          gebruikt ze nu bij {aangesloten.length} van de {organisaties.length}{" "}
          organisaties.
        </Paragraph>
        <UnorderedList>
          {organisaties.map(({ id, naam, aangesloten: isAangesloten }) => (
            <UnorderedListItem key={id}>
              {naam} — {isAangesloten ? "aangesloten" : "niet aangesloten"}
            </UnorderedListItem>
          ))}
        </UnorderedList>
        <ActionGroup direction="row">
          <Button appearance="secondary-action-button">
            Organisaties wijzigen
          </Button>
        </ActionGroup>
      </div>

      <div className="mox-card">
        <Heading level={2}>Hoe nemen organisaties contact op?</Heading>
        <DataSummary appearance="column">
          {kanalen.map(({ label, waarde }) => (
            <DataSummaryItem key={label} itemKey={label} itemValue={waarde} />
          ))}
        </DataSummary>
        <ActionGroup direction="row">
          <Button appearance="secondary-action-button">
            Communicatiekanalen wijzigen
          </Button>
        </ActionGroup>
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

export default ContactvoorkeurenPage;
