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
  title: "Taakgerichte navigatie - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Taakgerichte navigatie">
    <Paragraph>
      Het hoofdmenu volgt nu de onderwerpen van de overheid: Belastingen,
      Personeel en rollen, Subsidies. De ondernemer moet dan zelf weten onder
      welk onderwerp een taak valt. Bij taakgerichte navigatie is het menu
      ingedeeld naar de vraag die de ondernemer heeft: wat moet ik, wat kan ik,
      en wat regelt de overheid voor mij?
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit is een aanzet voor een patroon. Het is nog niet getoetst met
        gebruikers.
      </strong>
    </Paragraph>

    <PatternSection id="ingangen" title="Drie ingangen">
      <PatternTable
        head={["Ingang", "Vraag van de ondernemer", "Voorbeelden", "Kenmerk"]}
        rows={[
          [
            "Wat u moet doen",
            "Wat moet ik regelen, en wanneer?",
            "Btw-aangifte, loonaangifte, boete betalen, jaarrekening deponeren, informatieplicht energiebesparing",
            "Verplicht, met een uiterste datum. Gesorteerd op datum.",
          ],
          [
            "Wat u kunt doen",
            "Waar heb ik recht op, wat levert het op?",
            "Subsidie aanvragen, loonkostenvoordeel, iemand aannemen met afstand tot de arbeidsmarkt, vergunning aanvragen",
            "Vrijwillig. Gesorteerd op hoe goed het past bij de onderneming.",
          ],
          [
            "Wat wij voor u doen",
            "Wat regelt de overheid al, en wat kan zij overnemen?",
            "Zie hieronder",
            "De overheid doet het werk. De ondernemer houdt overzicht en controle.",
          ],
        ]}
      />
      <Paragraph>
        In de tekst van het portaal spreken wij de ondernemer aan met “u”, en de
        overheid met “wij”. Dus “Wat u moet doen”, niet “Dit moet je doen”.
      </Paragraph>
    </PatternSection>

    <PatternSection id="moet-doen" title="Wat kan in Wat u moet doen?">
      <Paragraph>
        Wat verplicht is, met een uiterste datum. Wie het niet doet, krijgt een
        boete of een aanmaning. Wat er staat, hangt af van de rechtsvorm, het
        personeel, de branche en de vestigingen.
      </Paragraph>
      <PatternTable
        head={["Soort", "Voorbeelden"]}
        rows={[
          [
            "Aangifte doen",
            "Btw-aangifte, loonaangifte, aangifte inkomstenbelasting (eenmanszaak) of vennootschapsbelasting (bv), douaneaangifte bij import en export",
          ],
          [
            "Betalen",
            "Een aanslag, een boete, een naheffing, gemeentelijke belastingen zoals reclamebelasting",
          ],
          [
            "Doorgeven",
            "Een wijziging bij KVK (adres, activiteiten, bestuurders), UBO’s registreren, een zieke werknemer melden bij UWV",
          ],
          [
            "Deponeren en rapporteren",
            "De jaarrekening deponeren bij KVK, de informatieplicht energiebesparing, een verplichte enquête van het CBS",
          ],
          [
            "Laten keuren of verlengen",
            "Een vergunning verlengen, de APK van een bedrijfsauto, de tachograaf, een milieumelding",
          ],
          [
            "Op orde hebben",
            "Een risico-inventarisatie en -evaluatie (RI&E) bij personeel, de administratie bewaren, een verwerkingsregister (AVG)",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="kunt-doen" title="Wat kan in Wat u kunt doen?">
      <Paragraph>
        Wat vrijwillig is en geld, ruimte of hulp oplevert. Gesorteerd op hoe
        goed het past bij de onderneming.
      </Paragraph>
      <PatternTable
        head={["Soort", "Voorbeelden"]}
        rows={[
          [
            "Geld krijgen",
            "Subsidies zoals WBSO, MIT en ISDE, fiscale regelingen zoals EIA, MIA en Vamil",
          ],
          [
            "Kosten verlagen",
            "Loonkostenvoordeel (LKV), loonkostensubsidie, no-riskpolis, kleineondernemersregeling (KOR), startersaftrek",
          ],
          [
            "Lenen of garantie krijgen",
            "BMKB, Qredits, een garantie voor export",
          ],
          [
            "Ruimte vragen",
            "Uitstel van een aangifte, een betalingsregeling, bezwaar maken tegen een aanslag",
          ],
          [
            "Personeel",
            "Iemand aannemen met afstand tot de arbeidsmarkt, erkend leerbedrijf worden (SBB)",
          ],
          [
            "Groeien",
            "Meedoen aan aanbestedingen (TenderNed), hulp bij exporteren, advies van KVK of het Ondernemersplein",
          ],
          [
            "Aanvragen",
            "Een vergunning voor iets nieuws, zoals een terras, een verbouwing of een evenement",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="wij-doen" title="Wat kan in Wat wij voor u doen?">
      <Paragraph>
        Alles wat de overheid zelf doet, of kan doen, zodat de ondernemer het
        niet hoeft te doen. Zes soorten:
      </Paragraph>
      <PatternTable
        head={["Soort", "Wat wij doen", "Voorbeeld"]}
        rows={[
          [
            "Vooraf invullen",
            "Een aangifte of aanvraag invullen met gegevens die de overheid al heeft",
            "De aanvraag bij Iemand aannemen, gevuld uit KVK, UWV en de Belastingdienst",
          ],
          [
            "Eén keer doorgeven",
            "Een wijziging doorgeven aan alle organisaties die het gegeven gebruiken",
            "Een nieuw vestigingsadres bij KVK, dat wij doorgeven aan gemeente en Belastingdienst",
          ],
          [
            "Automatisch regelen",
            "Een regeling toekennen zonder aanvraag, als de gegevens kloppen",
            "Een tegemoetkoming die de ondernemer krijgt op basis van de loonaangifte",
          ],
          [
            "In de gaten houden",
            "Een seintje geven als er iets verandert of verloopt",
            "Een vergunning die bijna verloopt, een nieuwe regel voor de branche, een subsidie die past",
          ],
          [
            "Uitzoeken",
            "Uitzoeken welke regels en regelingen gelden, met bronnen",
            "De digitale assistent die nagaat of de informatieplicht energiebesparing geldt",
          ],
          [
            "Klaarzetten",
            "Een document of bewijs maken en bewaren",
            "Een uittreksel uit het Handelsregister, een verklaring omtrent het gedrag, een attestatie in de Business Wallet",
          ],
        ]}
      />
      <Paragraph>
        Elke dienst laat zien: wat wij doen, met welke gegevens en van welke
        organisatie, of de ondernemer daar toestemming voor gaf, en wat die zelf
        nog moet doen. De ondernemer kan een dienst aan- en uitzetten.
      </Paragraph>
    </PatternSection>

    <PatternSection id="grensgevallen" title="Waar de ingangen elkaar raken">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Ruimte vragen bij een plicht</strong>. Een betalingsregeling
          of uitstel hoort bij iets dat moet. Zet de optie bij de taak in Wat u
          moet doen, en ook in de lijst bij Wat u kunt doen. Zo vindt de
          ondernemer haar op de plek waar die de taak tegenkomt.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Een plicht die een ander overneemt</strong>, zoals een
          boekhouder die de aangiften doet, of een btw-aangifte die wij vooraf
          invullen. De taak blijft bij Wat u moet doen, met de vermelding wie
          het doet of dat wij het voorbereiden.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Een subsidie die bijna sluit</strong> blijft bij Wat u kunt
          doen, met de datum erbij. Een termijn maakt iets nog niet verplicht.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="opbouw" title="Opbouw van het menu">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Home</strong>: het overzicht, met bovenaan wat nu aandacht
          vraagt.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>De drie ingangen</strong>, elk met een teller. Bij Wat u moet
          doen telt de teller wat binnenkort afloopt, niet alles.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Wat altijd nodig is</strong> blijft een eigen menu-item:
          Berichtenbox, Lopende zaken en Bedrijfsgegevens. Dat zijn geen taken,
          maar plekken waar de ondernemer steeds terugkomt.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Onderwerpen</strong> zoals Belastingen of Personeel en rollen
          worden een filter binnen de ingangen, geen menu-items meer.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="ontwerpkeuzes" title="Ontwerpkeuzes">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Een taak staat op één plek</strong>, ook als die bij twee
          ingangen lijkt te horen. Zie{" "}
          <TextLink href="#grensgevallen">
            Waar de ingangen elkaar raken
          </TextLink>
          .
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Gestart is Lopende zaken</strong>. Begint de ondernemer aan
          een taak, dan staat die in Lopende zaken. Bij de ingang staat dan een
          link naar de zaak.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Waarom staat dit hier?</strong> Elke taak zegt waarom die voor
          deze onderneming geldt, bijvoorbeeld “U hebt personeel in dienst” of
          “Uw energieverbruik is meer dan 50.000 kWh”. Zie ook{" "}
          <TextLink href="/demo/ontwerppatronen/interactie-op-inhoud">
            Interactie op inhoud
          </TextLink>
          .
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Per onderneming</strong>. Wisselt de ondernemer van
          onderneming, dan wisselen de drie ingangen mee. Zie{" "}
          <TextLink href="/demo/ontwerppatronen/context-wisselen">
            Context wisselen
          </TextLink>
          .
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Een taak doen</strong> gebeurt zonder afleiding. Zie{" "}
          <TextLink href="/demo/ontwerppatronen/focus-op-een-enkele-taak">
            Focus op een enkele taak
          </TextLink>
          .
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="vertrouwen" title="Vertrouwen en controle">
      <Paragraph>
        Wat wij voor u doen vraagt het meeste vertrouwen. De overheid handelt
        dan met gegevens van de onderneming, soms zonder dat de ondernemer iets
        doet.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Toestemming per dienst</strong>, niet één keer voor alles. De
          ondernemer ziet welke gegevens van welke organisatie gebruikt worden.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Terug te zien</strong>: per dienst een overzicht van wat wij
          deden en wanneer, bijvoorbeeld uit het Logboek Dataverwerkingen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Uit te zetten</strong>, met uitleg wat de ondernemer dan zelf
          moet doen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Geen besluit zonder mens</strong>. Een automatisch besluit met
          gevolgen voor de onderneming heeft een uitleg en een manier om bezwaar
          te maken (AVG artikel 22).
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="risicos" title="Risico’s">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Schijn van volledigheid</strong>. Wat u moet doen lijkt een
          complete lijst. Niet alle organisaties zijn aangesloten. Zeg dat, en
          noem welke organisaties wel meedoen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Druk</strong>. Een lange lijst met “moeten” kan stress geven.
          Toon eerst wat binnenkort afloopt, en de rest daarna.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Zoeken op onderwerp</strong>. Wie weet dat het om Belastingen
          gaat, wil daar snel heen. Zoeken en filteren op onderwerp blijft
          nodig.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Delen ondernemers taken op dezelfde manier in? Test dat met een
          kaartsortering.
        </UnorderedListItem>
        <UnorderedListItem>
          Vinden ze een taak sneller dan in de huidige indeling? Test dat met
          een boomtest, naast de huidige indeling.
        </UnorderedListItem>
        <UnorderedListItem>
          Begrijpen ze Wat wij voor u doen? Verwachten ze daar diensten, of
          denken ze aan contact en hulp?
        </UnorderedListItem>
        <UnorderedListItem>
          Welke diensten mag de overheid automatisch doen, en welke willen ze
          eerst zien?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://design-system.service.gov.uk/patterns/step-by-step-navigation/"
        title="GOV.UK Design System: Step by step navigation"
      >
        <Paragraph>
          Toont een taak van de overheid als reeks stappen, ook als die over
          meerdere organisaties gaat.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/card-sorting-definition/"
        title="Card Sorting: Uncover Users’ Mental Models"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Laat gebruikers onderwerpen zelf groeperen, om te zien welke indeling
          bij hun denkwijze past.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/tree-testing/"
        title="Tree Testing: Fast, Iterative Evaluation of Menu Labels and Categories"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Test of gebruikers een taak vinden in een menu, zonder ontwerp
          eromheen.
        </Paragraph>
      </Source>
      <Source
        href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
        title="Algemene verordening gegevensbescherming (AVG)"
      >
        <Paragraph>
          Artikel 22 gaat over besluiten die alleen automatisch worden genomen.
        </Paragraph>
      </Source>
      <Source
        href="https://logius-standaarden.github.io/logboek-dataverwerkingen/"
        title="Logboek Dataverwerkingen"
        by="Logius"
      >
        <Paragraph>
          Standaard om vast te leggen welke organisatie welke gegevens
          verwerkte. Basis voor het overzicht van wat wij deden.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
