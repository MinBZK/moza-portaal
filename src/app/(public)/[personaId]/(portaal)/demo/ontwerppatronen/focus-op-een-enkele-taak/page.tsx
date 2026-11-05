import type { Metadata } from "next";
import {
  OrderedList,
  OrderedListItem,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import { PatternPage, PatternSection, PatternTable, Source } from "../_parts";

export const metadata: Metadata = {
  title: "Focus op een enkele taak - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Focus op een enkele taak">
    <Paragraph>
      Een ondernemer die een aanvraag invult of gegevens wijzigt, is bezig met
      één taak. Alles op het scherm dat niet bij die taak hoort, leidt af en
      nodigt uit om weg te klikken. Bij dit patroon verdwijnt die afleiding
      zolang de taak loopt. Wat blijft: waar de ondernemer is, namens wie die
      handelt, de volgende stap en een duidelijke uitweg.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit patroon is een voorstel. Het is nog niet getoetst met
        gebruikers en nog niet uitgewerkt in het portaal.
      </strong>
    </Paragraph>

    <PatternSection id="wanneer" title="Wanneer gebruiken">
      <UnorderedList>
        <UnorderedListItem>
          Bij een taak in stappen die eindigt met versturen of opslaan, zoals
          Iemand aannemen, een aanvraag of contactgegevens wijzigen.
        </UnorderedListItem>
        <UnorderedListItem>
          Als de ondernemer onderweg gegevens invult die verloren kunnen gaan.
        </UnorderedListItem>
        <UnorderedListItem>
          Als een fout gevolgen heeft, bijvoorbeeld een aanvraag namens de
          verkeerde onderneming.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>Niet gebruiken:</Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          op pagina’s om te lezen, te zoeken of te vergelijken, zoals
          Actualiteiten, Subsidies of de berichtenbox;
        </UnorderedListItem>
        <UnorderedListItem>
          bij een taak van één scherm, zoals een bericht archiveren.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <PatternTable
        head={["Onderdeel", "Tijdens de taak", "Waarom"]}
        rows={[
          [
            "Zijnavigatie",
            "Verborgen",
            "De grootste bron van afleiding. Wie weg wil, gebruikt de uitweg.",
          ],
          [
            "Header",
            "Logo, naam van de ondernemer en de onderneming",
            "Laat zien namens wie de ondernemer handelt. Geen zoekveld of menu.",
          ],
          [
            "Kruimelpad",
            "Verborgen",
            "Elke kruimel is een uitgang zonder waarschuwing. De stappen tonen waar de ondernemer is.",
          ],
          [
            "Stappen",
            "Zichtbaar, met de huidige stap",
            "De ondernemer ziet hoe ver die is en wat nog komt.",
          ],
          [
            "Uitweg",
            "Altijd zichtbaar",
            "De ondernemer moet de taak kunnen stoppen zonder te zoeken.",
          ],
          [
            "Footer",
            "Ingekort tot toegankelijkheid, privacy en contact",
            "Hulp en wettelijke informatie blijven bereikbaar.",
          ],
          [
            "Digitale assistent",
            "Alleen als hulp bij de taak",
            "Een algemene chat trekt de ondernemer uit de taak.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="uitweg" title="Altijd een uitweg">
      <Paragraph>
        Minder navigatie mag nooit voelen als opgesloten zitten. Elke stap heeft
        daarom een vaste uitweg, op dezelfde plek.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Opslaan en later afronden</strong> bewaart wat er is ingevuld.
          De ondernemer vindt de taak terug in Lopende zaken, bij de aanvragen
          die nog verstuurd moeten worden. Zeg dat ook in de bevestiging.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Annuleren</strong> stopt de taak. Gaat er dan iets verloren,
          vraag het eerst na en zeg wat er verloren gaat. Is er niets ingevuld,
          stop dan zonder vraag.
        </UnorderedListItem>
        <UnorderedListItem>
          De knop <strong>Vorige</strong> van de browser werkt gewoon en gaat
          een stap terug, zonder dat er antwoorden verloren gaan.
        </UnorderedListItem>
        <UnorderedListItem>
          Het logo in de header blijft een link naar Home. Ook daar geldt: eerst
          vragen als er iets verloren gaat.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="verloop" title="Verloop">
      <OrderedList>
        <OrderedListItem>
          <strong>Start</strong>: de ondernemer kiest de taak in het portaal,
          met de gewone navigatie of indien de ondernemer via een andere ingang
          bij betreffende taak in het portaal belandt. De startpagina zegt wat
          er nodig is en hoe lang het ongeveer duurt.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Stappen</strong>: de navigatie verdwijnt. Per pagina één
          onderwerp of vraag, met de stappen en de uitweg.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Controleren</strong>: alle antwoorden op één pagina, met per
          antwoord een link om het te wijzigen. Na wijzigen komt de ondernemer
          terug op deze pagina.
        </OrderedListItem>
        <OrderedListItem>
          <strong>Bevestiging</strong>: de navigatie komt terug. De pagina zegt
          wat er is verstuurd, aan wie, en waar de ondernemer de zaak volgt.
        </OrderedListItem>
      </OrderedList>
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          De landmarks blijven: <code>header</code>, <code>main</code> en{" "}
          <code>footer</code>. Alleen de <code>nav</code> voor het hoofdmenu
          valt weg. De skiplink naar de inhoud blijft.
        </UnorderedListItem>
        <UnorderedListItem>
          De paginatitel noemt de stap en de taak, bijvoorbeeld “Stap 2 van 4:
          Gegevens, Iemand aannemen”. Zo weet ook een schermlezer waar de
          ondernemer is.
        </UnorderedListItem>
        <UnorderedListItem>
          Bij een nieuwe stap gaat de focus naar de kop van die stap, niet naar
          het begin van de pagina.
        </UnorderedListItem>
        <UnorderedListItem>
          Geen toetsenbordval: alle uitwegen zijn met <kbd>Tab</kbd> te
          bereiken.
        </UnorderedListItem>
        <UnorderedListItem>
          Vraag niet twee keer om hetzelfde gegeven in één taak (
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html">
            WCAG 3.3.7 Redundant Entry
          </a>
          ). Vul in wat de ondernemer al gaf, of laat het kiezen.
        </UnorderedListItem>
        <UnorderedListItem>
          Een kortere header en footer zijn toegestaan onder{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation">
            WCAG 3.2.3 Consistent Navigation
          </a>
          , zolang wat er staat in dezelfde volgorde staat als op de andere
          pagina’s.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Merken ondernemers dat de navigatie weg is? Voelen ze zich daardoor
          geholpen of juist opgesloten?
        </UnorderedListItem>
        <UnorderedListItem>
          Vinden ze de uitweg, en begrijpen ze het verschil tussen{" "}
          <strong>Opslaan en later afronden</strong> en{" "}
          <strong>Annuleren</strong>?
        </UnorderedListItem>
        <UnorderedListItem>
          Vinden ze een opgeslagen taak later terug in Lopende zaken?
        </UnorderedListItem>
        <UnorderedListItem>
          Missen ze tijdens de taak iets, zoals de berichtenbox of de digitale
          assistent?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://design-system.service.gov.uk/patterns/question-pages/"
        title="GOV.UK Design System: Question pages"
      >
        <Paragraph>
          Hoe een pagina met een vraag eruitziet: een terug-link, één vraag per
          pagina en een knop om verder te gaan.
        </Paragraph>
      </Source>
      <Source
        href="https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/"
        title="One thing per page"
        by="GOV.UK Design Notes"
      >
        <Paragraph>
          Eén onderwerp per pagina maakt een taak makkelijker: minder om te
          lezen, fouten per stap, en voortgang die te bewaren is.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/wizards/"
        title="Wizards: Definition and Design Recommendations"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Een taak in stappen werkt goed voor ongeoefende gebruikers en taken
          die zelden voorkomen. Toon de stappen, laat terug gaan toe zonder
          verlies, en bewaar wat al is ingevuld.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html"
        title="WCAG 3.2.3 Consistent Navigation"
      >
        <Paragraph>
          Navigatie die op meerdere pagina’s terugkomt, staat steeds in dezelfde
          volgorde. Onderdelen weglaten mag.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html"
        title="WCAG 3.3.7 Redundant Entry"
      >
        <Paragraph>
          Gegevens die de gebruiker in dezelfde taak al gaf, worden ingevuld of
          zijn te kiezen.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
