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
  title: "Aanvragen met RegelRecht - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Aanvragen met RegelRecht">
    <Paragraph>
      Een ondernemer wil vooraf weten wat een regeling oplevert, en daarna
      aanvragen zonder alles opnieuw in te vullen. Bij dit patroon rekent
      RegelRecht de uitkomst uit met de regels uit de wet. Eerst met een paar
      antwoorden en aannames, zonder gegevens op te halen. Daarna, als de
      ondernemer wil aanvragen, opnieuw met de gegevens uit de bron. Bij elke
      uitkomst staat waarom, tot het artikel in de wet.
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
          Bij een regeling waarvan de voorwaarden en bedragen in de wet staan en
          als regels in het RegelRecht-corpus zijn uitgewerkt.
        </UnorderedListItem>
        <UnorderedListItem>
          Als de ondernemer eerst wil weten of het de moeite waard is, voordat
          die gegevens deelt of iets aanvraagt.
        </UnorderedListItem>
        <UnorderedListItem>
          Als meer regelingen of meer organisaties bij één situatie horen, zoals
          bij Iemand aannemen.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>Niet gebruiken:</Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          als de uitkomst vooral afhangt van een oordeel van de organisatie,
          zonder regels die vooraf te rekenen zijn;
        </UnorderedListItem>
        <UnorderedListItem>
          als de regels van de regeling nog niet in het corpus staan of nog niet
          zijn getoetst.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <PatternTable
        head={["Stap", "Wat de ondernemer ziet", "Waarom"]}
        rows={[
          [
            "1. Oriëntatievragen",
            "Een paar vragen over de situatie, uit het vragenmodel van de regeling",
            "Zo weinig mogelijk vragen. Wat de wet verder vraagt, vult het portaal aan met aannames die de ondernemer kan zien.",
          ],
          [
            "2. RegelRecht rekent",
            <>
              Per regeling de uitkomst en een voorbeeldbedrag, met{" "}
              <strong>Waarom deze uitkomst?</strong>
            </>,
            "De ondernemer ziet vooraf wat het oplevert. Er worden nog geen gegevens opgehaald.",
          ],
          [
            "3. Gegevens ophalen",
            "Per bron welk gegeven nodig is, met de vraag om toestemming",
            "Alleen wat de regeling nodig heeft, en alleen voor deze aanvraag.",
          ],
          [
            "4. Opnieuw rekenen en kiezen",
            <>
              Per regeling de actie (<strong>Kiezen</strong>,{" "}
              <strong>Controleren</strong>, <strong>Nu geen actie nodig</strong>
              ), het bedrag en waarom
            </>,
            "RegelRecht rekent opnieuw met de opgehaalde gegevens. Wijkt de uitkomst af van stap 2, dan zegt het scherm waardoor.",
          ],
          [
            "5. Versturen",
            "Wat er verstuurd wordt, naar welke organisatie, en de termijn",
            "Na versturen staat de aanvraag als dossier in Lopende zaken.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="fasen" title="Twee fasen">
      <PatternTable
        head={["Fase", "Stappen", "Wat er gebeurt"]}
        rows={[
          [
            "Oriënteren",
            "1 en 2",
            "Rekenen met antwoorden en aannames. Geen gegevens opgehaald, geen zaak bij de overheid.",
          ],
          [
            "Aanvragen",
            "3 tot en met 5",
            "Met toestemming gegevens ophalen, opnieuw rekenen en versturen naar de organisatie die beslist.",
          ],
        ]}
      />
      <Paragraph>
        De overgang tussen de fasen is een bewuste keuze van de ondernemer, met
        een knop als <strong>Ja, ik wil regelingen aanvragen</strong>. Wie
        alleen wil weten wat het oplevert, stopt na stap 2.
      </Paragraph>
    </PatternSection>

    <PatternSection id="uitleg" title="Uitleg bij elke uitkomst">
      <UnorderedList>
        <UnorderedListItem>
          RegelRecht rekent deterministisch: dezelfde invoer geeft altijd
          dezelfde uitkomst.
        </UnorderedListItem>
        <UnorderedListItem>
          Elk bedrag is te herleiden tot het artikel in de wet.{" "}
          <strong>Waarom deze uitkomst?</strong> toont die afleiding in gewone
          taal, met het artikel erbij.
        </UnorderedListItem>
        <UnorderedListItem>
          Een aanname staat bij de uitkomst waar die gebruikt is, met een (i).
          De ondernemer kan die aanname in stap 3 of 4 vervangen door een echt
          gegeven.
        </UnorderedListItem>
        <UnorderedListItem>
          Het voorbeeldbedrag is geen besluit. De organisatie die beslist,
          bepaalt het daadwerkelijke bedrag.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="per-regeling" title="Per regeling nodig">
      <PatternTable
        head={["Onderdeel", "Wat het is"]}
        rows={[
          [
            "Regels",
            "De wet als regels in het RegelRecht-corpus, getoetst met scenario’s",
          ],
          [
            "Vragenmodel",
            "Welke vragen en welke aannames bij de oriëntatie horen",
          ],
          [
            "Bronnen",
            "Waar elk gegeven vandaan komt, en of toestemming nodig is",
          ],
          [
            "Uitvoering",
            "De organisatie die beslist en met dezelfde regels rekent",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="na-versturen" title="Na het versturen">
      <OrderedList>
        <OrderedListItem>
          De organisatie ontvangt de aanvraag met de gegevens, de uitkomst en de
          versie van de regels.
        </OrderedListItem>
        <OrderedListItem>
          De organisatie rekent met dezelfde regels en stelt vast wat alleen zij
          kan vaststellen, zoals de loonwaarde.
        </OrderedListItem>
        <OrderedListItem>
          Het besluit is een toekenning of een afwijzing, herleidbaar tot het
          artikel. Wijkt het af van de berekening vooraf, dan staat erbij
          waarom.
        </OrderedListItem>
        <OrderedListItem>
          De ondernemer volgt het dossier in Lopende zaken, en kan bezwaar maken
          of een wijziging doorgeven.
        </OrderedListItem>
      </OrderedList>
      <Paragraph>
        Dit deel is nog niet uitgewerkt. Wat per regeling verschilt: wie
        beslist, wat die zelf vaststelt, en de termijnen.
      </Paragraph>
    </PatternSection>

    <PatternSection id="voorbeeld" title="Voorbeeld in dit portaal">
      <Paragraph>
        <TextLink href="/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt">
          Iemand aannemen met afstand tot de arbeidsmarkt
        </TextLink>{" "}
        volgt dit patroon: vier oriëntatievragen, de voorbeeldberekening voor
        zeven regelingen, en daarna <strong>Kandidaat kiezen</strong> en{" "}
        <strong>Controleren en versturen</strong>.
      </Paragraph>
      <Paragraph>
        In het prototype rekent stap 4 nog met de antwoorden van de werkgever,
        bijgewerkt bij <strong>Kandidaat kiezen</strong>. De opgehaalde gegevens
        zijn daar voorbeeldgegevens en gaan nog niet als invoer naar RegelRecht.
      </Paragraph>
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          Een bedrag dat meeverandert met de antwoorden, volgt het patroon{" "}
          <TextLink href="/demo/ontwerppatronen/veranderde-waarden-tonen">
            Veranderde waarden tonen
          </TextLink>
          , en wordt voorgelezen zodra het rekenen klaar is.
        </UnorderedListItem>
        <UnorderedListItem>
          Terwijl RegelRecht rekent, staat er een statustekst. De knop om verder
          te gaan blijft bruikbaar en zegt waarop de ondernemer wacht.
        </UnorderedListItem>
        <UnorderedListItem>
          De stappen volgen{" "}
          <TextLink href="/demo/ontwerppatronen/terug-en-verder">
            Terug en Verder in een taak
          </TextLink>
          .
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen">
      <UnorderedList>
        <UnorderedListItem>
          Begrijpt de ondernemer het verschil tussen een voorbeeldbedrag en een
          besluit?
        </UnorderedListItem>
        <UnorderedListItem>
          Is de overgang van oriënteren naar aanvragen duidelijk, en geeft de
          ondernemer daarna met vertrouwen toestemming?
        </UnorderedListItem>
        <UnorderedListItem>
          Wat doet de ondernemer als de uitkomst na het ophalen van de gegevens
          anders is dan vooraf?
        </UnorderedListItem>
        <UnorderedListItem>
          Leest de ondernemer <strong>Waarom deze uitkomst?</strong>, en is de
          afleiding te volgen zonder kennis van de wet?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://design-system.service.gov.uk/patterns/check-a-service-is-suitable/"
        title="Check a service is suitable"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Eerst laten zien of een dienst past, voordat de gebruiker gegevens
          invult.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/patterns/check-answers/"
        title="Check answers"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Voor het versturen alles op één pagina laten controleren en wijzigen.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
