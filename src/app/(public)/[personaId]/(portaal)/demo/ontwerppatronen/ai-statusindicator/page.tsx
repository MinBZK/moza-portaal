import type { Metadata } from "next";
import {
  OrderedList,
  OrderedListItem,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import { Denkt } from "../../../digitale-assistent/_onderdelen";
import { PatternPage, PatternSection, TextLink } from "../_parts";

export const metadata: Metadata = {
  title: "AI-statusindicator - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="AI-statusindicator">
    <Paragraph>
      Dit patroon beschrijft wat de gebruiker ziet terwijl de AI denkt, typt en
      reageert.
    </Paragraph>
    <Paragraph>
      De digitale assistent is soms actief zonder dat er al een volledig
      antwoord is. Voor die tijd is een eigen patroon nodig. Het laat zien dat
      het systeem werkt, zonder te doen alsof het antwoord al af is.
    </Paragraph>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Directe feedback</strong>: zodra de vraag verstuurd is,
          verschijnt in het gesprek een statusbericht, zoals “Vraag
          analyseren…”, “Ik controleer de brongegevens…” of “Ik schrijf het
          antwoord…”.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Zichtbaar maar niet afleidend</strong>: de status staat in het
          gesprek zelf en vervangt geen antwoord. Het is een tijdelijke
          tussenstaat, geen vaste melding.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Toegankelijk</strong>: het gesprek is een live region (
          <code>aria-live=&quot;polite&quot;</code>). Liefst krijgt het ook{" "}
          <code>aria-busy=&quot;true&quot;</code> zolang de assistent bezig is.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Knoppen tijdelijk geblokkeerd</strong>: de verzendknop krijgt{" "}
          <code>aria-disabled</code>. De gebruiker kan niet twee vragen tegelijk
          sturen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Tekst die binnenstroomt</strong> verschijnt in kleine stappen,
          zodat de gebruiker ziet dat het antwoord wordt geschreven. Niet met
          een draaiend laadicoon zonder uitleg.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="fasen" title="Gedrag per fase">
      <OrderedList>
        <OrderedListItem>
          <strong>Vraag verstuurd</strong>: de invoer is geblokkeerd en er
          verschijnt een statusbericht in het gesprek.
        </OrderedListItem>
        <OrderedListItem>
          <strong>AI is actief</strong>: een korte tekst zegt wat de assistent
          doet, bijvoorbeeld “Ik controleer de regels…”.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Antwoord verschijnt</strong>: de tekst komt in het gesprek. De
          status blijft tot de laatste zin er staat.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Klaar</strong>: de status verdwijnt, de verzendknop werkt weer
          en de gebruiker kan een vervolgvraag stellen.
        </OrderedListItem>
      </OrderedList>
    </PatternSection>

    <PatternSection id="voorbeeld" title="Wachtindicator">
      <div className="rhc-mox-chat">
        <Denkt tekst="Ik controleer de regels voor uw situatie…" />
      </div>
      <Paragraph>
        De wachtindicator is een rustige animatie in vier stappen die laat zien
        dat het systeem werkt. Hij staat naast de tekst die zegt wat er gebeurt,
        nooit los. In dit portaal is het de component <code>Denkt</code> van de{" "}
        <TextLink href="/digitale-assistent">digitale assistent</TextLink>.
      </Paragraph>
    </PatternSection>

    <PatternSection id="richtlijnen" title="Richtlijnen">
      <UnorderedList>
        <UnorderedListItem>
          Gebruik geen laadicoon zonder tekst: dat zegt niets over wat er
          gebeurt.
        </UnorderedListItem>
        <UnorderedListItem>
          Vermijd lange, vage berichten zoals “Even geduld…”. Zeg wat de
          assistent doet.
        </UnorderedListItem>
        <UnorderedListItem>
          Houd de tekst kort, duidelijk en geruststellend.
        </UnorderedListItem>
        <UnorderedListItem>
          Stroomt het antwoord binnen, toon dan alleen bij de laatste zin of het
          laatste woord een typcursor. Plak niet in één keer het hele antwoord
          neer.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>
  </PatternPage>
);

export default Page;
