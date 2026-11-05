import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import {
  PatternPage,
  PatternSection,
  PatternTable,
  Source,
  TextLink,
} from "../_parts";

export const metadata: Metadata = {
  title: "Veranderde waarden tonen - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Veranderde waarden tonen">
    <Paragraph>
      Bij een berekening veranderen bedragen terwijl de ondernemer iets invult.
      Staan die bedragen verderop of opzij, dan ziet de ondernemer vaak niet dat
      er iets veranderde. Bij dit patroon wordt een waarde die verandert even
      vet en iets groter. Zo ziet de ondernemer wat de invoer deed, zonder dat
      de pagina verspringt.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit patroon is een voorstel. Het is nog niet getoetst met
        gebruikers.
      </strong>
    </Paragraph>

    <PatternSection id="wanneer" title="Wanneer gebruiken">
      <UnorderedList>
        <UnorderedListItem>
          Bij waarden die direct volgen uit wat de ondernemer invult, zoals
          bedragen in een voorbeeldberekening of het getal bij een
          schuifregelaar.
        </UnorderedListItem>
        <UnorderedListItem>
          Als de waarde op een andere plek staat dan het veld, zodat die buiten
          het zicht van de ondernemer kan veranderen.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>Niet gebruiken:</Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          bij gegevens die vanzelf veranderen, zonder invoer, zoals een teller
          van nieuwe berichten;
        </UnorderedListItem>
        <UnorderedListItem>
          bij lopende tekst of hele blokken; alleen de waarde zelf beweegt;
        </UnorderedListItem>
        <UnorderedListItem>
          bij het laden van de pagina; dan is er nog niets veranderd;
        </UnorderedListItem>
        <UnorderedListItem>
          na een spinner; die liet al zien dat de waarde verandert.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <PatternTable
        head={["Onderdeel", "Afspraak", "Waarom"]}
        rows={[
          [
            "Effect",
            "De waarde wordt even vet en groeit tot 115%, daarna terug",
            "Beweging valt op, ook buiten het midden van het zicht. Zonder signaal mist de ondernemer de verandering (change blindness).",
          ],
          [
            "Duur",
            "Groter worden 400 ms, vet 600 ms en aan het eind vloeiend terug",
            "Kort genoeg om niet af te leiden, lang genoeg om op te merken.",
          ],
          [
            "Wachttijd",
            "150 ms na de laatste wijziging",
            "Bij het slepen van een schuifregelaar of snel typen verandert de waarde voortdurend. Dan beweegt er pas iets als de waarde stil staat.",
          ],
          [
            "Plaats",
            "Op de plek zelf, zonder verschuiven",
            "De opmaak eromheen blijft staan; alleen de waarde groeit even.",
          ],
          [
            "Na een spinner",
            "Geen effect: de nieuwe waarde verschijnt gewoon",
            "De spinner liet al zien dat er iets verandert. Een tweede signaal is dubbel en maakt het onrustig.",
          ],
          [
            "Wat het niet doet",
            "Geen kleur, geen optellen van getallen, geen herhaling",
            "Het blijft een kort signaal, geen versiering.",
          ],
        ]}
      />
      <Paragraph>
        Nielsen Norman Group adviseert dat een effect binnen 0,1 seconde na de
        handeling begint, zodat oorzaak en gevolg samen voelen. De wachttijd van
        150 ms wijkt daarvan af. Wij kiezen voor rust bij snelle invoer. Het
        getal zelf verandert wel direct; alleen het signaal wacht.
      </Paragraph>
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          Heeft de ondernemer in het besturingssysteem minder beweging gekozen (
          <code>prefers-reduced-motion</code>), dan gebeurt er niets. Ook het
          vet blijft dan weg (WCAG 2.3.3).
        </UnorderedListItem>
        <UnorderedListItem>
          Het effect is extra. De waarde zelf is altijd goed te lezen, met en
          zonder beweging.
        </UnorderedListItem>
        <UnorderedListItem>
          Een schermlezer merkt de beweging niet. Gebruik daarom ook een
          statusmelding met de nieuwe uitkomst (WCAG 4.1.3). Lees alleen het
          eindbedrag voor, niet elke regel, en pas als de berekening klaar is.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="portaal" title="In het portaal">
      <Paragraph>
        Het component <code>ChangedValue</code> doet dit. Het staat om de
        bedragen in de voorbeeldberekening van Iemand aannemen, en om de waarde
        van elke schuifregelaar (<code>RangeSlider</code>). De opmaak staat in{" "}
        <code>rhc.css</code> onder <code>rhc-mox-changed-value</code>.
      </Paragraph>
      <Paragraph>
        Probeer het in{" "}
        <TextLink href="/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt">
          de voorbeeldberekening van Iemand aannemen
        </TextLink>
        : verander het aantal uren per week.
      </Paragraph>
      <Paragraph>
        De berekening heeft ook een statusmelding. Is de berekening na een
        wijziging klaar, dan leest een schermlezer het nieuwe eindbedrag voor.
        Bij het laden van de pagina blijft die stil.
      </Paragraph>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Merken ondernemers dat de bedragen veranderen als ze iets invullen?
        </UnorderedListItem>
        <UnorderedListItem>
          Voelt het effect als hulp, of leidt het af?
        </UnorderedListItem>
        <UnorderedListItem>
          Is de wachttijd van 150 ms rustig genoeg, of te traag om het verband
          met de invoer te zien?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://www.nngroup.com/articles/animation-purpose-ux/"
        title="The Role of Animation and Motion in UX"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Beweging werkt het best als korte, rustige feedback. Een korte
          animatie zorgt dat een verandering wordt gezien, waar een vaste
          verandering soms wordt gemist.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/animation-usability/"
        title="Animation for Attention and Comprehension"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Laat een element op zijn plek veranderen, met weinig of geen
          verschuiving. Begin het effect binnen 0,1 seconde om oorzaak en gevolg
          te tonen.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html"
        title="WCAG 2.3.3 Animation from Interactions"
      >
        <Paragraph>
          Beweging die volgt op een handeling moet uit te zetten zijn, onder
          meer met <code>prefers-reduced-motion</code>.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html"
        title="WCAG 4.1.3 Status Messages"
      >
        <Paragraph>
          Een melding over een nieuwe uitkomst is voor een schermlezer te horen
          zonder dat de focus verspringt.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
