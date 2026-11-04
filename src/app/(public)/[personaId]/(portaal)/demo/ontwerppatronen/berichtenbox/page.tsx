import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { PatternPage, PatternSection } from "../_parts";

export const metadata: Metadata = {
  title: "Berichtenbox - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Berichtenbox">
    <Paragraph>
      In de berichtenbox krijgen ondernemers berichten van overheidsorganisaties
      en gemeenten. De berichten komen uit het Federatief Berichtenstelsel
      (FBS). Daarin blijven berichten bij de organisatie. Ze worden pas
      opgehaald als de ondernemer kijkt.
    </Paragraph>

    <PatternSection id="doel" title="Ontwerpdoel">
      <Paragraph>
        Onderzoeken hoe een berichtenbox eruitziet en werkt als berichten niet
        op één plek staan, maar uit honderden bronnen (magazijnen) komen. Dat
        heeft gevolgen voor de gebruiker: berichten ophalen kost tijd, en dat
        moet zichtbaar zijn.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bronnen" title="Twee bronnen">
      <Paragraph>
        De berichtenbox haalt berichten uit een van twee bronnen. Welke het is,
        hangt af van de persona:
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Het Federatief Berichtenstelsel</strong>, voor de
          testpersona’s van de proeftuin. Hun berichten komen echt uit de
          testomgeving van het stelsel. De lijst bevat alleen afzender,
          onderwerp en datum. De inhoud en de bijlagen worden pas opgehaald als
          de ondernemer het bericht opent.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Een gegenereerde dataset</strong>, voor alle andere persona’s.
          Het ophalen, nieuwe berichten en een bron die wegvalt, worden hier
          nagebootst.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Beide bronnen tonen berichten op dezelfde manier: de pagina weet niet
        welke bron levert. Lukt ophalen uit het stelsel niet, dan valt de
        berichtenbox niet stil terug op de dataset. Verzonnen berichten tussen
        echte berichten zijn niet van elkaar te onderscheiden.
      </Paragraph>
    </PatternSection>

    <PatternSection id="ophalen" title="Ophalen">
      <Paragraph>
        De lijst begint leeg en vult zich pas als de berichten er zijn. Een
        volledige lijst vooraf zou beweren dat alle organisaties tegelijk
        antwoorden. Dat doen ze in een federatief stelsel niet.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Dataset</strong>: bij het eerste bezoek per persona toont een
          voortgangsbalk hoeveel bronnen doorzocht zijn en hoeveel berichten
          gevonden. De meeste bronnen antwoorden snel, een paar later. Dat duurt
          ongeveer vier seconden. Tot het ophalen klaar is, zijn de teller, het
          zoekveld en de lijst verborgen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Stelsel</strong>: de voortgangsbalk toont de echte
          ophaalronde. Die verschijnt alleen als ophalen langer duurt dan 300
          milliseconden. Anders licht de balk even op en lijkt het een storing.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Zonder JavaScript is er geen lijst. Een <code>&lt;noscript&gt;</code>
        -blok legt dan uit waarom.
      </Paragraph>
    </PatternSection>

    <PatternSection id="tabs" title="Ontvangen, archief en prullenbak">
      <Paragraph>
        Berichten kunnen worden gearchiveerd, verwijderd of verplaatst naar
        mappen. Tabs wisselen tussen Ontvangen, Archief en Prullenbak.
      </Paragraph>
      <Paragraph>
        De teller bij Ontvangen toont het aantal <strong>ongelezen</strong>{" "}
        berichten, niet het totaal.
      </Paragraph>
    </PatternSection>

    <PatternSection id="mappen" title="Mappen">
      <Paragraph>
        Berichten zijn naar mappen te verplaatsen. Er zijn twee mappen vooraf
        (“Belastingen 2025” en “Subsidies”), en de gebruiker kan eigen mappen
        maken. Bij het bekijken van een map:
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          is de juiste tab gemarkeerd met <code>aria-current</code> en{" "}
          <code>aria-selected</code>
        </UnorderedListItem>
        <UnorderedListItem>blijft de kop “Berichtenbox”</UnorderedListItem>
        <UnorderedListItem>
          vervangt informatie over de map de tekst van de teller
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="nieuw" title="Nieuwe berichten">
      <Paragraph>
        Terwijl de ondernemer kijkt, kunnen er nieuwe berichten binnenkomen. Die
        verschijnen bovenaan de eerste pagina. De lijst toont 10 berichten per
        pagina, dus het onderste bericht schuift door naar de volgende pagina.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Dataset</strong>: elke 60 seconden komt er een nieuw bericht
          binnen, hoogstens vijf.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Stelsel</strong>: de pagina vraagt de lijst elke 15 seconden
          opnieuw op, en elke 60 seconden als het tabblad op de achtergrond
          staat. Dat haalt niets nieuws op bij de organisaties; het leest wat
          het stelsel al heeft.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="zoeken" title="Zoeken">
      <Paragraph>
        Het zoekveld zoekt in de afzender en het onderwerp. Het zoekt in alle
        berichten, niet alleen in die op de pagina.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bijlagen" title="Bijlagen">
      <Paragraph>
        In de lijst staat een paperclip bij berichten met bijlagen.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          <strong>Stelsel</strong>: een bijlage is een gewone link naar het
          document bij het stelsel. De pagina van het bericht toont de echte
          bijlagen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Dataset</strong>: de pagina van het bericht bootst het laden
          na. Na 1,5 seconde verschijnen verzonnen namen van pdf’s.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="storingen" title="Storingen">
      <Paragraph>
        Alle meldingen aan de ondernemer staan op één vaste plek op elke pagina
        van de berichtenbox.
      </Paragraph>
      <Paragraph>
        Met de feature flag <strong>Berichtenbox unhappy flow</strong> bootst de
        dataset storingen na: één bron valt uit, geen enkele bron antwoordt, of
        een bron valt weg nadat alles geladen is. De ondernemer ziet dan welke
        bron ontbreekt en kan het opnieuw proberen. Een nagebootste storing
        werkt precies als een echte: de bron levert die berichten gewoon niet.
      </Paragraph>
    </PatternSection>

    <PatternSection id="staat" title="Opgeslagen staat">
      <Paragraph>
        De berichtenbox bewaart in de browser welke berichten gelezen,
        gearchiveerd en verwijderd zijn, de indeling in mappen en de eigen
        mappen. Die staat hoort bij één persona. Na een wissel van persona
        begint die leeg: andere bedrijven hebben andere post. Berichten uit het
        stelsel staan niet in de browser; die bewaart het stelsel 12 uur in een
        sessie op de server.
      </Paragraph>
    </PatternSection>
  </PatternPage>
);

export default Page;
