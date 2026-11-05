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
  title: "Autocomplete en autosuggest - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Autocomplete en autosuggest">
    <Paragraph>
      Terwijl de ondernemer typt, kan een veld helpen. Het vult de tekst aan of
      toont een lijst met suggesties. Zo typt de ondernemer minder, maakt die
      minder fouten en ziet die welke woorden werken. Dit patroon beschrijft hoe
      die hulp werkt in MijnOverheid Zakelijk, in het zoekveld en in
      formulieren.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit patroon is een voorstel. Het is nog niet getoetst met
        gebruikers.
      </strong>
    </Paragraph>

    <PatternSection id="begrippen" title="Begrippen">
      <Paragraph>
        De woorden worden door elkaar gebruikt. Nielsen Norman Group ziet
        autocomplete en autosuggest als hetzelfde. Wij maken wel onderscheid,
        omdat het gedrag verschilt.
      </Paragraph>
      <PatternTable
        head={["Begrip", "Wat het doet", "Voorbeeld"]}
        rows={[
          [
            "Autocomplete (aanvullen)",
            "Vult de tekst in het veld zelf aan, achter de cursor.",
            "U typt “loonkost” en in het veld staat “loonkostensubsidie”.",
          ],
          [
            "Autosuggest (suggesties)",
            "Toont onder het veld een lijst met mogelijke zoekwoorden, pagina’s of antwoorden. De tekst in het veld blijft wat de ondernemer typte.",
            "U typt “btw” en onder het veld staan “btw-aangifte doen” en “btw-nummer”.",
          ],
          [
            "Automatisch invullen (autofill)",
            "De browser vult bekende gegevens in, zoals naam en e-mailadres. Dit regelt het HTML-attribuut autocomplete, niet een lijst van ons.",
            "Bij het veld E-mailadres biedt de browser het opgeslagen adres aan.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="wanneer" title="Wanneer gebruiken">
      <UnorderedList>
        <UnorderedListItem>
          In het zoekveld, om de ondernemer te helpen een zoekwoord te kiezen
          dat resultaten geeft.
        </UnorderedListItem>
        <UnorderedListItem>
          Bij een lange lijst met vaste waarden, zoals een gemeente, een land of
          een SBI-code. Daar helpt typen om snel de juiste te vinden.
        </UnorderedListItem>
        <UnorderedListItem>
          Bij persoonlijke gegevens zoals naam, adres en e-mailadres: geef het
          veld het juiste <code>autocomplete</code>-attribuut, zodat de browser
          kan invullen.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>Niet gebruiken:</Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          bij een korte lijst; gebruik dan keuzerondjes of een keuzelijst
          (GOV.UK raadt een gewone keuzelijst aan tot een paar honderd opties);
        </UnorderedListItem>
        <UnorderedListItem>
          als de suggesties niet tot resultaten leiden; een suggestie zonder
          resultaat frustreert meer dan geen suggestie;
        </UnorderedListItem>
        <UnorderedListItem>
          voor open antwoorden, zoals een toelichting of een vraag aan een
          organisatie.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <Paragraph>
        Wij kiezen voor een lijst met suggesties waaruit de ondernemer zelf
        kiest. In de WAI-ARIA Authoring Practices heet dat “list autocomplete
        with manual selection”. De tekst in het veld verandert alleen als de
        ondernemer een suggestie kiest of er met de pijltjes langs gaat.
      </Paragraph>
      <PatternTable
        head={["Onderdeel", "Afspraak", "Waarom"]}
        rows={[
          [
            "Aanvullen in het veld",
            "Niet doen",
            "Tekst die vanzelf verschijnt, typt de ondernemer makkelijk over of verstuurt die per ongeluk. Een schermlezer leest het ook niet altijd goed voor.",
          ],
          [
            "Eerste suggestie vooraf gekozen",
            "Niet doen",
            "Anders zoekt Enter op de suggestie in plaats van op wat de ondernemer typte.",
          ],
          [
            "Aantal suggesties",
            "Hoogstens 8, ook op een groot scherm",
            "Baymard: hoogstens 10 op een groot scherm en 4 tot 8 op een telefoon. Bij een langere lijst leest de ondernemer niet meer alles.",
          ],
          [
            "Hoogte van de lijst",
            "Zo hoog als de suggesties, zonder schuifbalk",
            "Een schuifbalk in de lijst verbergt suggesties (Baymard).",
          ],
          [
            "Nadruk",
            "Vul de suggestie aan het eind aan, maak dan het nieuwe deel vet. Staat het getypte woord midden in de suggestie, maak dan dat woord vet.",
            "De ondernemer ziet zo snel waarin de suggesties verschillen (Baymard, Nielsen Norman Group).",
          ],
          [
            "Groepen",
            "Zet verschillende soorten suggesties in groepen met een kop, zoals “Over deze pagina”, “Laatst gezocht” en “Zoeken in MijnOverheid Zakelijk”.",
            "Een suggestie die maar in één deel zoekt, moet er anders uitzien dan een gewone suggestie (Baymard).",
          ],
          [
            "Actieve suggestie",
            "Achtergrondkleur en een rand",
            "Niet alleen kleur: de rand blijft zichtbaar in de modus met hoog contrast.",
          ],
          [
            "Wanneer tonen",
            "Vanaf het eerste teken. Suggesties voor de pagina mogen al bij een leeg veld.",
            "Een minimum aantal tekens maakt alleen zin bij een trage of grote bron. Meld het dan aan de ondernemer.",
          ],
          [
            "Typefouten en andere woorden",
            "Herken veelvoorkomende varianten, zoals “btw nummer” voor “btw-nummer”.",
            "Ondernemers gebruiken andere woorden dan de overheid (Baymard).",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="toetsenbord" title="Toetsenbord">
      <PatternTable
        head={["Toets", "Wat er gebeurt"]}
        rows={[
          [
            "Typen",
            "De lijst opent of past zich aan. De tekst in het veld is wat de ondernemer typt.",
          ],
          [
            <kbd key="down">Pijl omlaag</kbd>,
            "Naar de volgende suggestie. Die komt in het veld te staan. Na de laatste komt de getypte tekst terug, daarna weer de eerste.",
          ],
          [<kbd key="up">Pijl omhoog</kbd>, "Naar de vorige suggestie."],
          [
            <kbd key="enter">Enter</kbd>,
            "Kiest de actieve suggestie. Is er geen actieve suggestie, dan zoekt Enter op wat er in het veld staat.",
          ],
          [
            <kbd key="escape">Escape</kbd>,
            "Sluit de lijst en zet de getypte tekst terug. Is de lijst al dicht, dan maakt Escape het veld leeg.",
          ],
          [
            <kbd key="tab">Tab</kbd>,
            "Sluit de lijst en gaat naar het volgende element. De suggesties zelf zitten niet in de tabvolgorde.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          Een zichtbaar label boven het veld. Gebruik geen placeholder als label
          of als uitleg.
        </UnorderedListItem>
        <UnorderedListItem>
          Het veld is een combobox volgens de WAI-ARIA Authoring Practices:{" "}
          <code>role=&quot;combobox&quot;</code>,{" "}
          <code>aria-autocomplete=&quot;list&quot;</code>,{" "}
          <code>aria-expanded</code>, <code>aria-controls</code> en{" "}
          <code>aria-activedescendant</code> voor de actieve suggestie. De focus
          blijft in het veld.
        </UnorderedListItem>
        <UnorderedListItem>
          Het aantal suggesties is een statusmelding (WCAG 4.1.3), zoals “5
          suggesties. Kies met de pijltjestoetsen.” Ook “Geen suggesties” is een
          melding.
        </UnorderedListItem>
        <UnorderedListItem>
          Een suggestie kiezen doet alleen wat de ondernemer verwacht: het
          zoekt, of vult het veld. Het verstuurt geen formulier (WCAG 3.2.2).
        </UnorderedListItem>
        <UnorderedListItem>
          Elke suggestie is minstens 24 bij 24 pixels groot om aan te klikken of
          aan te tikken (WCAG 2.5.8).
        </UnorderedListItem>
        <UnorderedListItem>
          Bij persoonlijke gegevens geeft het <code>autocomplete</code>
          -attribuut het doel van het veld aan (WCAG 1.3.5). Zet het op{" "}
          <code>off</code> bij een veld met een eigen lijst, zodat de lijst van
          de browser er niet overheen valt. Niet elke browser houdt zich
          daaraan.
        </UnorderedListItem>
        <UnorderedListItem>
          Zonder JavaScript werkt het veld als een gewoon formulier.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="portaal" title="In het portaal">
      <Paragraph>
        Het zoekveld onder de kop van elke pagina gebruikt dit patroon. Zie{" "}
        <TextLink href="/demo/ontwerppatronen/zoeken-en-hulp">
          Zoeken en hulp op elke pagina
        </TextLink>{" "}
        en het component <TextLink href="/demo#sitesearch">SiteSearch</TextLink>
        . SiteSearch herkent een streepje als spatie en letters met en zonder
        accent als gelijk: “btw nummer” vindt “btw-nummer”. Echte typefouten en
        andere woorden voor hetzelfde, zoals “inschrijvingsnummer” voor
        “KVK-nummer”, herkent het nog niet. Daarvoor is een zoekdienst nodig.
      </Paragraph>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Gebruiken ondernemers de suggesties, of lezen ze die alleen om
          zoekwoorden te vinden?
        </UnorderedListItem>
        <UnorderedListItem>
          Begrijpen ze het verschil tussen een suggestie over de pagina en een
          suggestie voor het hele portaal?
        </UnorderedListItem>
        <UnorderedListItem>
          Welke woorden gebruiken ondernemers voor begrippen van de overheid?
        </UnorderedListItem>
        <UnorderedListItem>
          Werkt de lijst goed met een schermlezer en met vergroting?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/"
        title="Combobox Pattern"
        by="W3C WAI-ARIA Authoring Practices"
      >
        <Paragraph>
          Vier soorten gedrag: geen aanvulling, een lijst met zelf kiezen, een
          lijst met een vooraf gekozen suggestie, en aanvullen in het veld. Met
          de bijbehorende toetsen en ARIA-attributen.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/site-search-suggestions/"
        title="Site Search Suggestions"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Suggesties helpen woorden te kiezen die werken. Maak het verschil
          tussen getypte en voorgestelde tekst zichtbaar. Stel alleen voor wat
          resultaten geeft.
        </Paragraph>
      </Source>
      <Source
        href="https://baymard.com/blog/autocomplete-design"
        title="9 UX Best Practice Design Patterns for Autocomplete Suggestions"
        by="Baymard Institute"
      >
        <Paragraph>
          Hoogstens 10 suggesties op een groot scherm en 4 tot 8 op een
          telefoon. Geen schuifbalk. Maak het voorgestelde deel vet, zet de
          actieve suggestie in het veld en laat de pijltjes rondgaan.
        </Paragraph>
      </Source>
      <Source
        href="https://github.com/alphagov/accessible-autocomplete"
        title="Accessible autocomplete"
        by="GOV.UK"
      >
        <Paragraph>
          Statusmeldingen voor het aantal resultaten, de actieve suggestie en
          geen resultaten. Geen placeholder. Bij een korte lijst eerst een
          gewone keuzelijst.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html"
        title="WCAG 1.3.5 Identify Input Purpose"
      >
        <Paragraph>
          Bij velden voor persoonlijke gegevens geeft het{" "}
          <code>autocomplete</code>-attribuut aan wat er in het veld hoort.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html"
        title="WCAG 4.1.3 Status Messages"
      >
        <Paragraph>
          Een melding over het aantal suggesties is voor een schermlezer te
          horen zonder dat de focus verspringt.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
