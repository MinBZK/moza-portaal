import Link from "next/link";
import {
  AccordionProvider,
  ActionGroup,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import PersoneelZaak from "./iemand-aannemen/_personeelZaak";

const vragen = [
  {
    vraag: "Welke gegevens van de kandidaat worden gebruikt?",
    antwoord:
      "Alleen wat de wet nodig heeft om te bepalen of een regeling geldt: of de kandidaat in het doelgroepregister staat (UWV), of de gemeente de kandidaat ondersteunt en wat de loonwaarde is (gemeente), en uw eigen opgave over uren, startdatum en loon. De kandidaat geeft daarvoor toestemming. U ziet per gegeven de bron en de datum waarop het is opgehaald.",
  },
  {
    vraag: "Is de uitkomst een besluit?",
    antwoord:
      "Nee. Wat u vooraf ziet is een berekening met dezelfde regels als de organisatie later gebruikt. Het besluit neemt de gemeente, UWV of de Belastingdienst nadat u een aanvraag heeft verstuurd. Bij het besluit ziet u dezelfde berekening terug.",
  },
];

/** Personeel: de ingang naar Iemand aannemen (Digitale assistent 2.0). */
const PersoneelPage = async () => {
  const situaties = await getDemoIemandAannemenSituaties();
  return (
    <>
      <Heading level={1}>Personeel</Heading>

      <section className="rhc-mox-card" aria-labelledby="iemand-aannemen">
        <Heading level={2} id="iemand-aannemen">
          Iemand aannemen met een afstand tot de arbeidsmarkt
        </Heading>
        <Paragraph>
          Neemt u iemand aan die in het doelgroepregister staat, een uitkering
          heeft of om een andere reden niet zelfstandig het minimumloon kan
          verdienen? Dan ziet u hier vooraf welke regelingen voor u kunnen
          gelden en wat ze opleveren, op basis van wat de overheid al van u en
          van de kandidaat weet.
        </Paragraph>
        <UnorderedList>
          <UnorderedListItem>
            U vult alleen in wat de overheid nog niet weet.
          </UnorderedListItem>
          <UnorderedListItem>
            Per bron ziet u welke gegevens worden gebruikt en vinkt u aan dat ze
            kloppen.
          </UnorderedListItem>
          <UnorderedListItem>
            Een aanvraag staat daarna klaar als concept; u verstuurt hem pas als
            u dat wilt.
          </UnorderedListItem>
        </UnorderedList>
        <ActionGroup>
          <Link
            href="/personeel/iemand-aannemen"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Start: iemand aannemen
          </Link>
        </ActionGroup>
      </section>

      <PersoneelZaak
        zaken={{
          gemeente: situaties.gemeente.zaak,
          wajong: situaties.wajong.zaak,
          wia: situaties.wia.zaak,
        }}
      />

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

export default PersoneelPage;
