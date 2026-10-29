import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Personeel en rollen" };

const vragen = [
  {
    vraag: "Welke gegevens van de kandidaat worden gebruikt?",
    antwoord: (
      <>
        <Paragraph>
          Alleen wat de wet nodig heeft om te bepalen of een regeling geldt:
        </Paragraph>
        <UnorderedList>
          <UnorderedListItem>
            van UWV: of de kandidaat in het doelgroepregister staat
          </UnorderedListItem>
          <UnorderedListItem>
            van de gemeente: of die de kandidaat ondersteunt en wat de
            loonwaarde is
          </UnorderedListItem>
          <UnorderedListItem>
            van u: de uren, de startdatum en het loon
          </UnorderedListItem>
        </UnorderedList>
        <Paragraph>
          De kandidaat geeft daarvoor toestemming. U ziet per gegeven de bron en
          de datum waarop het is opgehaald.
        </Paragraph>
      </>
    ),
  },
  {
    vraag: "Is de uitkomst een besluit?",
    antwoord: (
      <Paragraph>
        Nee. Wat u vooraf ziet is een berekening met dezelfde regels als de
        organisatie later gebruikt. Het besluit neemt de gemeente, UWV of de
        Belastingdienst nadat u een aanvraag heeft verstuurd. Bij het besluit
        ziet u dezelfde berekening terug.
      </Paragraph>
    ),
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
          Neemt u iemand aan die niet zelfstandig het minimumloon kan verdienen?
          Bijvoorbeeld omdat die in het doelgroepregister staat of een uitkering
          heeft. Dan ziet u hier vooraf welke regelingen voor u kunnen gelden en
          wat ze opleveren. Wij gebruiken daarvoor wat de overheid al van u en
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
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: antwoord,
          }))}
        />
      </div>
    </>
  );
};

export default PersoneelPage;
