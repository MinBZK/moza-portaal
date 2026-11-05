import type { Metadata } from "next";
import {
  OrderedList,
  OrderedListItem,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import {
  PatternPage,
  PatternSection,
  PatternTable,
  Source,
  TextLink,
} from "../_parts";

export const metadata: Metadata = {
  title: "Zoeken en hulp op elke pagina - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Zoeken en hulp op elke pagina">
    <Paragraph>
      Een ondernemer kan op elke pagina vastlopen. Soms gaat de vraag over iets
      algemeens: “Wanneer moet ik btw-aangifte doen?” Soms over de pagina zelf:
      “Wat betekent dit bedrag?” Bij dit patroon kan de ondernemer op elke
      pagina op één vaste plek zoeken of een vraag stellen. Het antwoord past
      bij de pagina waar die op dat moment is, maar kan ook over het hele
      portaal gaan.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit is een aanzet voor een patroon. Het is nog niet getoetst met
        gebruikers en nog niet uitgewerkt in het portaal.
      </strong>
    </Paragraph>

    <PatternSection id="aanname" title="De aanname">
      <Paragraph>
        Een universele zoekbalk bovenaan de pagina, onder de kop, is een
        geschikte plek om zowel algemene als pagina-specifieke hulp te vinden.
      </Paragraph>
      <Paragraph>Wat de bronnen daarover zeggen:</Paragraph>
      <PatternTable
        head={["Onderdeel van de aanname", "Wat de bronnen zeggen", "Gevolg"]}
        rows={[
          [
            "Op elke pagina",
            "Ondersteund. Zoeken moet overal kunnen, omdat niet te voorspellen is waar iemand vastloopt (NN/g). Staat hulp op meerdere pagina’s, dan in dezelfde volgorde ten opzichte van de rest (WCAG 3.2.6).",
            "Het veld staat op elke pagina, steeds op dezelfde plek in de volgorde van de pagina.",
          ],
          [
            "Bovenaan",
            "Ondersteund. Gebruikers zoeken een zoekveld bovenaan de pagina (NN/g).",
            "Het veld staat boven de inhoud, niet onderaan of in een zijbalk.",
          ],
          [
            "Onder de kop",
            "Afwijkend. Gebruikers verwachten zoeken in de header, meestal rechtsboven (NN/g). GOV.UK zet zoeken in de servicenavigatie en MOJ in de navigatie bovenaan, niet in de inhoud.",
            "Toetsen tegen de gangbare plek in de header. Zie Plek van het veld.",
          ],
          [
            "Eén veld voor algemeen en voor deze pagina",
            "Met voorwaarden. Een standaardbereik dat niet “alles” is, verwart gebruikers. Twee zoekvelden met elk een eigen bereik werken bijna nooit (NN/g).",
            "Eén veld, standaard over het hele portaal. De pagina kan suggesties geven, maar beperkt de zoekvraag niet.",
          ],
          [
            "Zoeken en hulp in één veld",
            "Met voorwaarden. Gebruikers typen korte zoekwoorden, ook in een AI-veld. Een veld dat zoeken vervangt door chat, botst met dat beeld (NN/g). Gebruikers wisselen zelf tussen zoeken en AI.",
            "Het veld geeft altijd gewone zoekresultaten. De digitale assistent is een keuze erbij, geen vervanging.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="twee-soorten" title="Twee soorten hulp">
      <PatternTable
        head={["Soort", "Voorbeeld", "Wat werkt"]}
        rows={[
          [
            "Algemene hulp",
            "“Hoe vraag ik loonkostensubsidie aan?”",
            "Zoeken over het hele portaal, op een vaste plek op elke pagina.",
          ],
          [
            "Hulp bij deze pagina",
            "“Waarom staat hier dat ik nog moet betalen?”",
            "Hulp op de plek van de vraag, op het moment dat de ondernemer erom vraagt. Denk aan een uitleg bij een begrip of een vraag aan de digitale assistent met de pagina als context.",
          ],
        ]}
      />
      <Paragraph>
        NN/g noemt dit het verschil tussen hulp die de gebruiker opgedrongen
        krijgt en hulp die de gebruiker zelf ophaalt. Het advies: laat zien dát
        er hulp is, maar toon de inhoud pas als de gebruiker erom vraagt.
      </Paragraph>
      <Paragraph>
        WCAG 3.2.6 gaat over de vaste hulp, zoals zoeken, contact en een
        chatbot. Uitleg bij een veld of een begrip valt daar niet onder. Die mag
        dus per pagina verschillen.
      </Paragraph>
    </PatternSection>

    <PatternSection id="voorstel" title="Voorstel">
      <OrderedList>
        <OrderedListItem>
          <strong>Eén veld, op elke pagina, op dezelfde plek</strong>. Label
          “Zoeken of een vraag stellen”, op elke pagina hetzelfde (NL Design
          System). Knop <strong>Zoeken</strong>.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Standaard over het hele portaal</strong>. De ondernemer hoeft
          niet te kiezen waar die zoekt.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Suggesties tijdens het typen</strong>, met bovenaan wat bij
          deze pagina hoort. Een suggestie voor deze pagina ziet er anders uit
          dan een gewone zoeksuggestie, en zegt waar die over gaat: “Over deze
          pagina: Wat betekent loondispensatie?”
        </OrderedListItem>
        <OrderedListItem>
          <strong>Resultaten met een tweede weg</strong>. Bovenaan de
          zoekresultaten staat “Vraag het de digitale assistent”. De assistent
          krijgt de vraag en de pagina waar de ondernemer vandaan kwam. Zie{" "}
          <TextLink href="/demo/ontwerppatronen/digitale-assistent">
            Digitale assistent
          </TextLink>
          .
        </OrderedListItem>
        <OrderedListItem>
          <strong>Een uitweg naar een mens</strong>. Op de resultatenpagina
          staat altijd hoe de ondernemer contact opneemt, ook als er niets is
          gevonden.
        </OrderedListItem>
      </OrderedList>
    </PatternSection>

    <PatternSection id="plek" title="Plek van het veld">
      <Paragraph>
        Er zijn twee varianten om te toetsen. Beide voldoen aan WCAG 3.2.6
        zolang het veld op elke pagina op dezelfde plek in de volgorde staat.
      </Paragraph>
      <PatternTable
        head={["Variant", "Voor", "Tegen"]}
        rows={[
          [
            "A. In de header",
            "De plek die gebruikers kennen. Duwt de inhoud niet omlaag. Altijd op dezelfde plek, ook als de kop van de pagina lang is.",
            "Minder opvallend. Voelt als zoeken door de site, niet als hulp bij deze pagina.",
          ],
          [
            "B. Onder de kop (de aanname)",
            "Dicht bij de inhoud, dus het voelt als hulp bij deze pagina. Valt op.",
            "Ongebruikelijk. Staat tussen de kop en de inhoud, op elke pagina. Concurreert met de taak van de pagina, zoals een formulier of de berichtenbox.",
          ],
        ]}
      />
      <Paragraph>
        Een tussenvorm: zoeken in de header, en onder de kop alleen een korte
        link naar hulp bij deze pagina. Die opent de digitale assistent met de
        pagina als context.
      </Paragraph>
    </PatternSection>

    <PatternSection id="niet-gebruiken" title="Wanneer niet">
      <UnorderedList>
        <UnorderedListItem>
          In een taak in stappen, zoals Iemand aannemen. Zoeken leidt daar weg
          van de taak. Gebruik hulp bij de stap zelf (MOJ Design System).
        </UnorderedListItem>
        <UnorderedListItem>
          Als vervanging van een goede indeling van het portaal. Zoeken is een
          aanvulling op navigatie, geen oplossing voor navigatie die niet werkt.
        </UnorderedListItem>
        <UnorderedListItem>
          Naast een tweede zoekveld op dezelfde pagina, zoals zoeken in de
          berichtenbox. Geef dat veld dan een eigen label dat zegt wat het
          doorzoekt (NL Design System).
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          Het veld staat in een <code>&lt;search&gt;</code>-element, de landmark
          voor zoeken. Een schermlezer leest al “zoeken” voor, dus zet dat woord
          niet ook in een <code>aria-label</code>.
        </UnorderedListItem>
        <UnorderedListItem>
          Een zichtbaar label boven het veld, geen placeholder als label. Het
          label is op elke pagina hetzelfde.
        </UnorderedListItem>
        <UnorderedListItem>
          Suggesties volgen het combobox-patroon van de WAI-ARIA Authoring
          Practices: met de pijltjestoetsen door de lijst, <kbd>Enter</kbd>{" "}
          kiest en <kbd>Escape</kbd> sluit.
        </UnorderedListItem>
        <UnorderedListItem>
          Het aantal suggesties en resultaten is een statusmelding (WCAG 4.1.3),
          zodat een schermlezer het voorleest zonder dat de focus verspringt.
        </UnorderedListItem>
        <UnorderedListItem>
          Het veld staat op elke pagina op dezelfde plek in de volgorde (WCAG
          3.2.6). Op een smal scherm mag het ergens anders staan.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="suggesties" title="Suggesties tijdens het typen">
      <UnorderedList>
        <UnorderedListItem>
          Hoogstens 10 suggesties op een groot scherm en 4 tot 8 op een telefoon
          (Baymard).
        </UnorderedListItem>
        <UnorderedListItem>
          Gaat de ondernemer met de pijltjes door de lijst, dan komt de
          suggestie in het veld te staan. Zo kan de ondernemer die aanvullen
          (Baymard).
        </UnorderedListItem>
        <UnorderedListItem>
          Herken veelvoorkomende typefouten en zoekwoorden van ondernemers,
          zoals “btw-nummer” en “btw nummer” (Baymard).
        </UnorderedListItem>
        <UnorderedListItem>
          Laat in de suggestie het deel opvallen dat de ondernemer nog niet
          typte, niet wat die al typte (Baymard).
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="risicos" title="Risico’s">
      <UnorderedList>
        <UnorderedListItem>
          De ondernemer denkt dat het veld alleen over deze pagina gaat en zoekt
          niet verder. Daarom zegt de resultatenpagina altijd waarover is
          gezocht.
        </UnorderedListItem>
        <UnorderedListItem>
          De ondernemer verwacht een antwoord, maar krijgt een lijst links. Of
          verwacht links en krijgt een gesprek. Daarom geeft het veld altijd
          beide.
        </UnorderedListItem>
        <UnorderedListItem>
          De digitale assistent krijgt de pagina als context. Op een pagina met
          persoonlijke gegevens vraagt de assistent eerst toestemming, zoals in
          het patroon Digitale assistent.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Vinden ondernemers het veld sneller onder de kop of in de header?
        </UnorderedListItem>
        <UnorderedListItem>
          Typen ze zoekwoorden of hele vragen? Verandert dat als het label “een
          vraag stellen” noemt?
        </UnorderedListItem>
        <UnorderedListItem>
          Verwachten ze dat het veld over de pagina gaat, of over het hele
          portaal?
        </UnorderedListItem>
        <UnorderedListItem>
          Kiezen ze de digitale assistent, of blijven ze bij de zoekresultaten?
          En vertrouwen ze het antwoord?
        </UnorderedListItem>
        <UnorderedListItem>
          Leidt het veld onder de kop af van de taak op de pagina?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://www.nngroup.com/articles/search-visible-and-simple/"
        title="Search: Visible and Simple"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Zoeken hoort op elke pagina, als invulveld en niet als link. Het veld
          staat bovenaan, meestal rechts, en is breed genoeg voor een gewone
          zoekvraag.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/scoped-search/"
        title="Scoped Search: Dangerous, but Sometimes Useful"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Gebruikers verwachten dat zoeken over de hele site gaat. Zet het
          standaardbereik op alles, toon het bereik bij het veld en bij de
          resultaten, en laat met één klik verder zoeken. Twee zoekvelden met
          een eigen bereik op één pagina werken bijna nooit.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/help-and-documentation/"
        title="Help and Documentation (Usability Heuristic #10)"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Bied hulp aan op het moment en op de plek dat de gebruiker die nodig
          heeft.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/onboarding-tutorials/"
        title="Onboarding Tutorials vs. Contextual Help"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Hulp die de gebruiker zelf ophaalt werkt beter dan hulp die opduikt.
          Laat zien dat er hulp is, maar toon de details pas als erom wordt
          gevraagd.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/ai-search-infoseeking/"
        title="GenAI for Complex Questions, Search for Critical Facts"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Gebruikers kiezen AI voor vage of samengestelde vragen en zoeken voor
          feiten die moeten kloppen. De meesten wisselen tussen beide, en
          controleren AI-antwoorden met zoeken.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/site-ai-chatbot/"
        title="What Is Your Site’s AI Chatbot for? Users Can’t Tell"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Gebruikers zien niet waarom ze een chatbot zouden gebruiken als de
          site al zoeken en navigatie heeft. Ze gebruiken de chat als een
          zoekveld: korte invoer, snel antwoord.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/discoverability-ai-amazon/"
        title="Discoverability of AI Features: Learn from Amazon’s Mistakes"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Het beeld dat gebruikers van zoeken hebben, korte zoekwoorden, was de
          grootste drempel om een AI-assistent in het zoekveld te gebruiken.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html"
        title="WCAG 3.2.6 Consistent Help"
      >
        <Paragraph>
          Staat hulp op meerdere pagina’s, zoals contact, een hulppagina of een
          chatbot, dan in dezelfde volgorde ten opzichte van de rest van de
          pagina. Uitleg bij een veld valt hier niet onder.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/patterns/navigate-a-service/"
        title="GOV.UK Design System: Navigate a service"
      >
        <Paragraph>
          Een zoekveld voor de eigen dienst hoort in de servicenavigatie, met
          een tekst die zegt wat het doorzoekt.
        </Paragraph>
      </Source>
      <Source
        href="https://design-patterns.service.justice.gov.uk/components/search/"
        title="MOJ Design System: Search"
      >
        <Paragraph>
          Zoeken over de site staat bovenaan, in de navigatie. Niet gebruiken
          als vervanging van een goede indeling, of om te zoeken in een dienst
          die in stappen verloopt.
        </Paragraph>
      </Source>
      <Source
        href="https://nldesignsystem.nl/text-input/"
        title="NL Design System: Text Input"
      >
        <Paragraph>
          Een algemene zoekfunctie heeft op elke pagina hetzelfde label. Een
          zoekveld met een ander doel krijgt een eigen label.
        </Paragraph>
      </Source>
      <Source
        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search"
        title="The search element"
        by="MDN"
      >
        <Paragraph>
          Het <code>&lt;search&gt;</code>-element is de landmark voor zoeken. De
          resultaten horen er niet in, maar in de hoofdinhoud.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/"
        title="WAI-ARIA Authoring Practices: Combobox"
      >
        <Paragraph>
          Hoe een invulveld met suggesties werkt met het toetsenbord en een
          schermlezer.
        </Paragraph>
      </Source>
      <Source
        href="https://baymard.com/blog/autocomplete-design"
        title="9 UX Best Practice Design Patterns for Autocomplete Suggestions"
        by="Baymard Institute"
      >
        <Paragraph>
          Houd de lijst kort, maak suggesties voor een bereik anders dan gewone
          suggesties, en maak de lijst met het toetsenbord te bedienen.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
