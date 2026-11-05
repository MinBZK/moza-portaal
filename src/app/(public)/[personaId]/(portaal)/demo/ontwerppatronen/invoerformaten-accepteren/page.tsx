import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { PatternPage, PatternSection, PatternTable, Source } from "../_parts";

export const metadata: Metadata = {
  title: "Verschillende invoerformaten accepteren - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Verschillende invoerformaten accepteren">
    <Paragraph>
      Ondernemers schrijven hetzelfde gegeven op verschillende manieren. De een
      typt een telefoonnummer met spaties, de ander met streepjes of met +31.
      Keurt een veld dat af, dan denkt de ondernemer dat die iets fout heeft
      gedaan. Bij dit patroon accepteert het veld alle gangbare vormen. Het
      systeem zet de invoer daarna zelf om naar één vaste vorm.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: dit patroon is een voorstel. Het is nog niet getoetst met
        gebruikers.
      </strong>
    </Paragraph>

    <PatternSection id="waarom" title="Waarom">
      <UnorderedList>
        <UnorderedListItem>
          Minder foutmeldingen, dus minder ondernemers die vastlopen of afhaken.
        </UnorderedListItem>
        <UnorderedListItem>
          Het helpt vooral mensen met een leer- of geheugenbeperking, ouderen en
          mensen die gewend zijn aan een andere schrijfwijze. Zij twijfelen na
          een afwijzing aan zichzelf.
        </UnorderedListItem>
        <UnorderedListItem>
          Gegevens die de ondernemer kopieert en plakt, zoals een IBAN uit een
          bankapp, komen vaak met spaties of in een andere vorm mee.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Dit staat niet als eis in WCAG. Het is aanvullende richtlijn van de W3C
        voor cognitieve toegankelijkheid, en een richtlijn van NL Design System.
      </Paragraph>
    </PatternSection>

    <PatternSection id="patroon" title="Ontwerppatroon">
      <UnorderedList>
        <UnorderedListItem>
          Accepteer spaties, streepjes, punten en haakjes waar die niets aan de
          betekenis veranderen. Haal ze weg voordat je controleert.
        </UnorderedListItem>
        <UnorderedListItem>
          Negeer hoofdletters en kleine letters, en spaties aan het begin en
          eind.
        </UnorderedListItem>
        <UnorderedListItem>
          Bewaar en toon het gegeven daarna in één vaste vorm, volgens de
          schrijfwijzer. Laat de ondernemer zien hoe het is opgeslagen, zodat
          die het kan controleren.
        </UnorderedListItem>
        <UnorderedListItem>
          Zet geen grens op het aantal tekens met <code>maxlength</code>. Wie
          spaties typt, komt anders tekens tekort zonder het te merken.
        </UnorderedListItem>
        <UnorderedListItem>
          Gebruik geen <code>pattern</code>-attribuut en geen invoermasker dat
          tekens toevoegt of weigert tijdens het typen.
        </UnorderedListItem>
        <UnorderedListItem>
          Geef een voorbeeld in de beschrijving onder het label, niet als
          placeholder. Een placeholder verdwijnt zodra de ondernemer typt.
        </UnorderedListItem>
        <UnorderedListItem>
          Vraag alleen wat echt nodig is. Elk verplicht veld is een kans op een
          fout.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="voorbeelden" title="Voorbeelden">
      <PatternTable
        head={["Gegeven", "Accepteer onder meer", "Bewaar en toon als"]}
        rows={[
          ["KVK-nummer", "12345678, 1234 5678, 12.34.56.78", "12345678"],
          [
            "Btw-nummer",
            "NL000099998B57, nl 0000 9999 8B57, NL0000.99.998.B57",
            "NL000099998B57",
          ],
          [
            "Postcode",
            "1234 AB, 1234AB, 1234ab, ook met spaties ervoor of erna",
            "1234 AB",
          ],
          [
            "Telefoonnummer",
            "0612345678, 06-12345678, 06 12 34 56 78, +31 6 12345678, 0031612345678, (070) 123 45 67",
            "06 12 34 56 78",
          ],
          [
            "IBAN",
            "NL91ABNA0417164300, nl91 abna 0417 1643 00",
            "NL91 ABNA 0417 1643 00",
          ],
          [
            "Bedrag",
            "385000, 385.000, €385.000, 385.000,00, € 385 000",
            "€385.000",
          ],
          [
            "Datum",
            "15-3-1984, 15-03-1984, 15/03/1984, 15 3 1984, 15 maart 1984, 15 mrt 1984",
            "15 maart 1984",
          ],
          [
            "Naam",
            "Letters met accenten, apostrof en koppelteken: Zoë van ’t Hof-Øvergaard",
            "Zoals getypt",
          ],
        ]}
      />
      <Paragraph>
        Is een vorm echt dubbelzinnig, zoals 03-04 als datum, vraag dan om
        bevestiging. Gebruik in het voorbeeld een dag van 13 of hoger, zoals
        “15-3-1984”. Dan ziet de ondernemer welke volgorde wordt bedoeld en dat
        een 0 vooraan niet hoeft.
      </Paragraph>
    </PatternSection>

    <PatternSection id="foutmelding" title="Als het toch niet klopt">
      <UnorderedList>
        <UnorderedListItem>
          Controleer pas als de ondernemer het veld verlaat of het formulier
          verstuurt, niet tijdens het typen.
        </UnorderedListItem>
        <UnorderedListItem>
          Zeg wat er nodig is, niet dat het formaat ongeldig is: “Een KVK-nummer
          heeft 8 cijfers. U hebt er 7 ingevuld.” Niet: “Ongeldig formaat.”
          (WCAG 3.3.3)
        </UnorderedListItem>
        <UnorderedListItem>
          Laat staan wat de ondernemer typte. Maak het veld niet leeg.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="techniek" title="Techniek">
      <UnorderedList>
        <UnorderedListItem>
          Gebruik <code>type=&quot;text&quot;</code> met{" "}
          <code>inputmode=&quot;numeric&quot;</code> voor nummers zoals een
          KVK-nummer, niet <code>type=&quot;number&quot;</code>. Een numberveld
          weigert spaties en verandert de waarde bij scrollen.
        </UnorderedListItem>
        <UnorderedListItem>
          Gebruik <code>type=&quot;tel&quot;</code> voor telefoonnummers en{" "}
          <code>type=&quot;email&quot;</code> voor e-mailadressen. Dan toont een
          telefoon het juiste toetsenbord.
        </UnorderedListItem>
        <UnorderedListItem>
          Geef velden met persoonlijke gegevens het juiste{" "}
          <code>autocomplete</code>-attribuut (WCAG 1.3.5). Zet{" "}
          <code>spellcheck=&quot;false&quot;</code> bij nummers, namen en
          e-mailadressen.
        </UnorderedListItem>
        <UnorderedListItem>
          Zet het omzetten naar de vaste vorm op één plek in de code, zodat elk
          formulier hetzelfde accepteert.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="portaal" title="In het portaal">
      <Paragraph>
        Bij Iemand aannemen vraagt de stap Gegevens delen om de geboortedatum
        van een nieuwe kandidaat, met de vorm dag-maand-jaar in het label. Dat
        veld controleert nu alleen of het is ingevuld. Volgens dit patroon
        accepteert het straks alle vormen uit de tabel, en staat het voorbeeld
        in een beschrijving onder het label.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p08-input-formats/"
        title="Accept different input formats"
        by="W3C, aanvullende richtlijn voor cognitieve toegankelijkheid"
      >
        <Paragraph>
          Accepteer verschillende vormen voor bedragen, tijden, adressen,
          telefoon- en kaartnummers. Vermijd een vaste lengte en verplichte
          scheidingstekens.
        </Paragraph>
      </Source>
      <Source
        href="https://nldesignsystem.nl/richtlijnen/formulieren/voorkom-fouten/keur-niet-te-snel-af/"
        title="Keur niet te snel af"
        by="NL Design System"
      >
        <Paragraph>
          Accepteer alle schrijfwijzen van bijvoorbeeld een postcode en laat de
          software ze omzetten.
        </Paragraph>
      </Source>
      <Source
        href="https://nldesignsystem.nl/richtlijnen/formulieren/voorkom-fouten/geen-invoerpatronen/"
        title="Vermijd invoerpatroon op een formulierveld"
        by="NL Design System"
      >
        <Paragraph>
          Geen <code>pattern</code>-attribuut en geen placeholder om aan te
          geven hoe een veld moet worden ingevuld.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/components/text-input/"
        title="Text input"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Geen strenge maximale lengte,{" "}
          <code>inputmode=&quot;numeric&quot;</code> in plaats van{" "}
          <code>type=&quot;number&quot;</code>, en spellingcontrole uit bij
          nummers en namen.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/patterns/dates/"
        title="Dates"
        by="GOV.UK Design System"
      >
        <Paragraph>
          Een voorbeelddatum met een dag van 13 of hoger en een maand van 9 of
          lager maakt de volgorde duidelijk.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html"
        title="WCAG 3.3.3 Error Suggestion"
      >
        <Paragraph>
          Weet het systeem hoe een fout te herstellen is, dan zegt de
          foutmelding dat.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;
