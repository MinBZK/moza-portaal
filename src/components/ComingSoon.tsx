import {
  Heading,
  Paragraph,
  Alert,
  UnorderedList,
  UnorderedListItem,
  AccordionProvider,
} from "@/components/rhc";

export type Vraag = { vraag: string; antwoord: string };

/**
 * Pagina-inhoud voor een onderdeel dat nog niet werkt: wat het wordt, wanneer
 * het er is en antwoorden op veelgestelde vragen.
 */
const BinnenkortBeschikbaar = ({
  titel,
  samenvatting,
  beschikbaarVanaf,
  verwachtingen,
  vragen,
}: {
  titel: string;
  samenvatting: string;
  beschikbaarVanaf: string;
  verwachtingen: string[];
  vragen: Vraag[];
}) => (
  <>
    <Heading level={1}>{titel}</Heading>

    <Alert type="info">
      <Heading level={2}>Binnenkort beschikbaar: {beschikbaarVanaf}</Heading>
      <Paragraph>{samenvatting}</Paragraph>
    </Alert>

    <div className="mox-card">
      <Heading level={2}>Wat kunt u straks doen?</Heading>
      <UnorderedList>
        {verwachtingen.map((verwachting) => (
          <UnorderedListItem key={verwachting}>{verwachting}</UnorderedListItem>
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

export default BinnenkortBeschikbaar;
