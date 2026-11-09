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
  title: "Terug en Verder in een taak - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Terug en Verder in een taak">
    <Paragraph>
      Een taak in stappen, zoals Iemand aannemen, heeft onderaan elke stap een
      knop om terug te gaan en een knop om verder te gaan. Dit patroon
      beschrijft hoe die knoppen heten, waar ze staan, in welke volgorde het
      toetsenbord ze bereikt, en wat er gebeurt als de ondernemer nog niet
      verder kan.
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
          Bij een taak van meer dan één stap, met een stappenindicator bovenaan.
        </UnorderedListItem>
        <UnorderedListItem>
          Samen met het patroon{" "}
          <TextLink href="/demo/ontwerppatronen/focus-op-een-enkele-taak">
            Focus op een enkele taak
          </TextLink>
          .
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Niet gebruiken bij een formulier van één scherm. Daar is er één knop,
        zoals <strong>Opslaan</strong> of <strong>Versturen</strong>.
      </Paragraph>
    </PatternSection>

    <PatternSection id="knoppen" title="De knoppen">
      <PatternTable
        head={["Knop", "Tekst", "Uiterlijk"]}
        rows={[
          [
            "Verder",
            "De naam van de volgende stap, zoals “Aanvraag nakijken”. Een schermlezer leest “Verder naar Aanvraag nakijken”.",
            "Primaire knop met een pijl vooruit",
          ],
          [
            "Terug",
            "De naam van de vorige stap, zoals “Voorbeeldberekening”. Een schermlezer leest “Terug naar Voorbeeldberekening”.",
            "Secundaire knop met een pijl terug",
          ],
          [
            "Laatste stap, iets versturen",
            "Wat er gebeurt en naar wie, zoals “Versturen naar UWV”",
            "Primaire knop met het icoon verzenden",
          ],
          [
            "Laatste stap, niets te versturen",
            "“Klaar”",
            "Primaire knop met een vinkje",
          ],
        ]}
      />
      <Paragraph>
        Gebruik voor de laatste knop geen groene kleur. Groen betekent dat iets
        gelukt is, en dat is nog niet zo: de aanvraag is pas verstuurd nadat de
        ondernemer op de knop drukt. De laatste knop is dus een gewone primaire
        knop. Groen hoort bij de bevestiging daarna, zoals een melding dat de
        aanvraag is verstuurd.
      </Paragraph>
      <Paragraph>
        De naam van de stap komt uit dezelfde lijst als de stappenindicator. Zo
        zijn de knop en de indicator altijd gelijk. De ondernemer weet vooraf
        waar de knop heen gaat (WCAG 2.4.4).
      </Paragraph>
      <Paragraph>
        “Verder naar” en “Terug naar” zijn niet zichtbaar: de pijl laat de
        richting al zien. Een schermlezer leest ze wel voor, zodat de knop ook
        zonder de pijl duidelijk is. De zichtbare tekst staat in de naam van de
        knop, zodat spraakbediening werkt (WCAG 2.5.3).
      </Paragraph>
      <Paragraph>
        De eerste stap heeft geen Terug-knop. De ondernemer gaat dan terug met
        het kruimelpad of de knop <strong>Vorige</strong> van de browser.
      </Paragraph>
    </PatternSection>

    <PatternSection id="volgorde" title="Plaats en volgorde">
      <Paragraph>
        Vooraan en achteraan volgen de leesrichting, zoals de logische
        eigenschappen in CSS (<code>inline-start</code> en{" "}
        <code>inline-end</code>). In het Nederlands is vooraan links.
      </Paragraph>
      <PatternTable
        head={["Situatie", "Wat de ondernemer ziet", "Volgorde met Tab"]}
        rows={[
          [
            "Breed scherm, knoppen naast elkaar",
            "Terug vooraan, Verder achteraan",
            "Eerst Verder, dan Terug",
          ],
          [
            "Smal scherm, knoppen onder elkaar",
            "Verder bovenaan, Terug eronder",
            "Eerst Verder, dan Terug",
          ],
        ]}
      />
      <Paragraph>
        Verder staat in de HTML vóór Terug. Zo bereikt het toetsenbord de knop
        die de ondernemer het vaakst nodig heeft als eerste, en staat die
        bovenaan op een telefoon. Op een breed scherm zet de opmaak Terug
        vooraan, zoals mensen gewend zijn van vorige en volgende.
      </Paragraph>
      <Paragraph>
        Op een breed scherm gaat de focus daardoor van achteraan naar vooraan.
        WCAG 2.4.3 staat dat toe zolang de betekenis blijft kloppen: de twee
        knoppen zijn los van elkaar te gebruiken. Wel is het een punt om te
        testen met mensen die het toetsenbord gebruiken.
      </Paragraph>
    </PatternSection>

    <PatternSection
      id="niet-verder"
      title="Als de ondernemer nog niet verder kan"
    >
      <UnorderedList>
        <UnorderedListItem>
          De Verder-knop krijgt <code>aria-disabled</code>, niet{" "}
          <code>disabled</code>. Zo blijft de knop bereikbaar met het
          toetsenbord en leest een schermlezer hem voor.
        </UnorderedListItem>
        <UnorderedListItem>
          Kiest de ondernemer toch Verder, dan gaat de focus naar het eerste
          veld dat nog ontbreekt. Onder het label komt een foutmelding, zoals “U
          hebt nog geen geboortedatum ingevuld.”
        </UnorderedListItem>
        <UnorderedListItem>
          Is dat veld ingevuld en ontbreekt er nog iets, dan gaat de focus bij
          de volgende keer Verder naar dat veld. Dat herhaalt zich tot alles wat
          verplicht is, is ingevuld.
        </UnorderedListItem>
        <UnorderedListItem>
          De foutmelding verdwijnt zodra het veld goed is ingevuld. Een nieuwe
          melding komt pas bij de volgende keer Verder.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="stappenindicator" title="Samen met de stappenindicator">
      <UnorderedList>
        <UnorderedListItem>
          Afgeronde stappen in de stappenindicator zijn links terug naar die
          stap.
        </UnorderedListItem>
        <UnorderedListItem>
          Is de ondernemer al verder geweest en teruggegaan, dan zijn ook de
          latere stappen die die al bereikte links. De eerste keer door de taak
          zijn latere stappen geen link.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="portaal" title="In het portaal">
      <Paragraph>
        Het component <code>StepNavigation</code> doet dit, in een{" "}
        <code>ActionGroup</code> met de class{" "}
        <code>rhc-mox-step-navigation</code>. Probeer het in{" "}
        <TextLink href="/personeel/iemand-aannemen/gegevens">
          de stap Gegevens delen van Iemand aannemen
        </TextLink>
        : kies <strong>Verder naar Aanvraag nakijken</strong> zonder iets te
        kiezen, en maak het venster smal.
      </Paragraph>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Helpt de naam van de stap op de knop, of is “Verder” genoeg?
        </UnorderedListItem>
        <UnorderedListItem>
          Raken mensen met het toetsenbord in de war doordat de focus op een
          breed scherm eerst achteraan staat?
        </UnorderedListItem>
        <UnorderedListItem>
          Begrijpen ondernemers waarom Verder nog niet werkt, en vinden ze het
          veld dat ontbreekt?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html"
        title="WCAG 2.4.3 Focus Order"
      >
        <Paragraph>
          De volgorde van de focus hoeft niet gelijk te zijn aan wat je ziet,
          zolang betekenis en bediening kloppen. Het liefst ondersteunt de focus
          de volgorde die je ziet.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html"
        title="WCAG 1.3.2 Meaningful Sequence"
      >
        <Paragraph>
          Als de volgorde betekenis heeft, moet een schermlezer die volgorde ook
          zo voorlezen.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/components/button/"
        title="Button"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Zet knoppen samen in een groep. Een knoptekst zegt wat de knop doet.
          Vermijd uitgeschakelde knoppen: ze hebben weinig contrast en maken
          mensen onzeker.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/patterns/question-pages/"
        title="Question pages"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Eén vraag per pagina, met een knop om verder te gaan. GOV.UK zet de
          weg terug als losse link bovenaan de pagina.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/wizards/"
        title="Wizards: Definition and Design Recommendations"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Toon waar de gebruiker is, laat terug gaan zonder verlies, en zet de
          knoppen op een vaste plek.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
