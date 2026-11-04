import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { Assistent, Gebruiker } from "../../../digitale-assistent/_onderdelen";
import { ExternalLink, PatternPage, PatternSection, TextLink } from "../_parts";
import ShareRequestExample from "./_shareRequestExample";

export const metadata: Metadata = {
  title: "Digitale assistent - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Digitale assistent">
    <Paragraph>
      De digitale assistent is een chat. Daarin stelt een ondernemer vragen en
      laat die taken voorbereiden, zoals uitzoeken welke regels gelden of een
      rapportage indienen. AI maakt de antwoorden. Daarom rust het patroon op
      drie beloftes: de ondernemer ziet{" "}
      <strong>waar een antwoord vandaan komt</strong>, bepaalt{" "}
      <strong>zelf welke gegevens gedeeld worden</strong> en kan{" "}
      <strong>altijd verder</strong>, ook als de assistent vastloopt.
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: de assistent is een proof of concept. De backend staat in een
        eigen repository (
        <ExternalLink href="https://github.com/MinBZK/moza-poc-digitale-assistent">
          moza-poc-digitale-assistent
        </ExternalLink>
        ). Dit patroon beschrijft de voorkant.
      </strong>
    </Paragraph>

    <PatternSection id="doel" title="Ontwerpdoel">
      <Paragraph>
        Onderzoeken hoe een AI-assistent in een overheidsportaal betrouwbaar kan
        zijn, zonder te beweren dat die nooit fouten maakt. Daarvoor moet de
        chat meer doen dan tekst tonen. Hij toont bronnen, vraagt toestemming en
        stelt vragen met vaste antwoorden, zodat de ondernemer niet alles hoeft
        te typen.
      </Paragraph>
    </PatternSection>

    <PatternSection id="opbouw" title="Opbouw van het scherm">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Gesprek</strong>: één <code>role=&quot;log&quot;</code> met{" "}
          <code>aria-live=&quot;polite&quot;</code>. Een schermlezer hoort
          nieuwe berichten zonder dat de focus verspringt.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Invoer</strong>: een <code>&lt;textarea&gt;</code> met een
          (visueel verborgen) label. <kbd>Enter</kbd> verstuurt,{" "}
          <kbd>Shift+Enter</kbd> maakt een nieuwe regel. Het veld groeit mee met
          de tekst.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Acties</strong>: Vraag stellen, Nieuw gesprek starten en
          Gesprek bewaren, in een actiegroep.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Disclaimer</strong>: onder het gesprek, altijd zichtbaar. Zegt
          dat AI de antwoorden maakt en dat die fouten kunnen bevatten. Noemt de
          bronnen en verwijst voor juridisch advies naar een adviseur of de
          bevoegde organisatie.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Status van bronnen</strong>: achter een feature flag. Zie{" "}
          <TextLink href="#status-bronnen">Status van bronnen</TextLink>.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="instappen" title="Instappen">
      <PatternSection id="eerste-bezoek" title="Eerste bezoek" level={3}>
        <Paragraph>
          Bij het eerste bezoek stelt de assistent zich voor in drie
          tekstballonnen, steeds na een korte pauze: wie die is, wat die kan, en
          dat gegevens pas gebruikt worden{" "}
          <strong>als de ondernemer daar toestemming voor geeft</strong>. Daarna
          volgen drie voorbeeldvragen. Bij een volgend bezoek komen alleen de
          voorbeeldvragen, met de knop Toon de uitleg opnieuw.
        </Paragraph>
      </PatternSection>
      <PatternSection
        id="met-vraag"
        title="Met een vraag binnenkomen"
        level={3}
      >
        <Paragraph>
          Bij subsidies, regelingen en buurtberichten staat de link Vraag het de
          digitale assistent. Die opent de assistent met <code>?vraag=</code> en
          verstuurt de vraag meteen. De uitleg valt dan weg, ook bij een eerste
          bezoek: wie een vraag stelt, wil een antwoord en geen drie
          tekstballonnen ertussen. De uitleg telt dan niet als gezien. Wie later
          zonder vraag binnenkomt, krijgt hem alsnog.
        </Paragraph>
      </PatternSection>
    </PatternSection>

    <PatternSection id="wachten" title="Wachten">
      <Paragraph>
        Zodra een vraag verstuurd is, verschijnt een wachtindicator met een
        tekst die zegt wat de assistent doet: “Vraag analyseren…”, en daarna de
        naam van de bron die de assistent raadpleegt. De verzendknop krijgt{" "}
        <code>aria-disabled</code>; een tweede vraag tegelijk versturen kan
        niet. Zie het patroon{" "}
        <TextLink href="/demo/ontwerppatronen/ai-statusindicator">
          AI-statusindicator
        </TextLink>
        .
      </Paragraph>
      <Paragraph>
        Ook zonder vraag “denkt” de assistent even voordat die iets zegt: bij
        een nieuw gesprek en bij het laden van de pagina. Een scherm dat meteen
        met kant-en-klare tekst begint, leest niet als een gesprek.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bronvermelding" title="Antwoord met bronvermelding">
      <Paragraph>
        Onder elk antwoord staan de bronnen die de assistent raadpleegde: de
        naam van de bron, waar die over ging en de datum. De naam is een link
        naar de bron zelf, zodat de ondernemer het kan nalezen. Eén bron heet
        “Bron:”, meer bronnen “Bronnen:”.
      </Paragraph>
      <div className="rhc-mox-chat">
        <div className="rhc-mox-chat-rule">
          <Gebruiker
            item={{
              id: "voorbeeld-vraag",
              soort: "gebruiker",
              tekst: "Geldt de informatieplicht energiebesparing voor mij?",
            }}
          />
        </div>
        <div className="rhc-mox-chat-rule">
          <Assistent
            item={{
              id: "voorbeeld-antwoord",
              soort: "assistent",
              tekst:
                "Ja, die geldt voor uw bedrijf. U gebruikt per jaar meer dan 50.000 kWh stroom. Dan moet u energie besparen en melden welke maatregelen u hebt genomen.\n\nU meldt dit uiterlijk 1 december 2026 bij de RVO.",
              bronnen: [
                {
                  label: "KOOP Regelingenbank",
                  titel: "Activiteitenbesluit milieubeheer, artikel 2.15",
                  url: "https://wetten.overheid.nl/BWBR0022762/",
                  geraadpleegdOp: "23 september 2026",
                },
                {
                  label: "RVO",
                  titel: "Informatieplicht energiebesparing, rapportagetermijn",
                  url: "https://www.rvo.nl/onderwerpen/informatieplicht-energiebesparing",
                  geraadpleegdOp: "23 september 2026",
                },
              ],
            }}
          />
        </div>
      </div>
      <UnorderedList>
        <UnorderedListItem>
          De bronnen komen bij voorkeur als gegevens mee met het antwoord (
          <code>bronnen</code>). Zet de backend ze als laatste regel in de tekst
          (“Bron: RegelRecht (art. 5.15 …)”), dan haalt de chat die regel eruit
          en toont hem op dezelfde manier. Een opsomming midden in een antwoord
          blijft inhoud en wordt geen bron.
        </UnorderedListItem>
        <UnorderedListItem>
          Noemt de assistent alleen de naam van een bron, dan komt de link uit
          een lijst met bekende bronnen. Een bron zonder openbare pagina blijft
          zonder link; de Business Wallet is in dit prototype nagebootst.
        </UnorderedListItem>
        <UnorderedListItem>
          De tekst van een antwoord krijgt beperkte opmaak: alinea’s,
          opsommingen, vet, cursief en links. Een kop uit het antwoord wordt
          vet, geen <code>&lt;h2&gt;</code> tot en met <code>&lt;h6&gt;</code>:
          de ballon staat midden in de koppen van de pagina.
        </UnorderedListItem>
      </UnorderedList>
      <PatternSection id="in-beeld" title="In beeld brengen" level={3}>
        <Paragraph>
          Past een nieuw bericht in het venster, dan schuift de chat door naar
          onderen. Is het langer, dan komt de <strong>bovenkant</strong> in
          beeld. Anders begint de ondernemer aan het eind van een antwoord dat
          die nog moet lezen.
        </Paragraph>
      </PatternSection>
    </PatternSection>

    <PatternSection id="deelverzoek" title="Toestemming vragen (deelverzoek)">
      <Paragraph>
        De assistent raadpleegt een bron met gegevens van het bedrijf pas als de
        ondernemer daar toestemming voor gaf. Is die toestemming er nog niet,
        dan volgt na de uitleg een kaart met de vraag, de bron en wat er gedeeld
        wordt.
      </Paragraph>
      <ShareRequestExample />
      <UnorderedList>
        <UnorderedListItem>
          <strong>Een besluit, geen tekst</strong>: de focus gaat naar Delen,
          niet naar het invoerveld. De kop en de uitleg hangen met{" "}
          <code>aria-describedby</code> aan de knop, zodat een schermlezer de
          vraag voorleest.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Delen</strong> vervangt de kaart door “Toestemming gegeven
          voor [bron].” en stuurt een beurt met het veld{" "}
          <code>toestemming</code>. De kaart verdwijnt niet: de ondernemer moet
          terug kunnen lezen waar die ja tegen zei.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Niet delen</strong> toont dat de assistent deze bron niet
          raadpleegt, en stuurt dat als bericht mee. Anders blijft de assistent
          wachten op een antwoord dat al gegeven is.
        </UnorderedListItem>
        <UnorderedListItem>
          Toestemming wordt vastgelegd, nooit stilzwijgend ingetrokken of
          aangenomen. De chat stuurt het veld alleen mee in de beurt waarin de
          ondernemer op Delen drukte.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Na Delen toont de energiekaart de gedeelde gegevens als{" "}
        <code>&lt;dl&gt;</code>: de uitgever, het peiljaar en per waarde of die
        boven of onder de wettelijke grens ligt. Die grens komt uit RegelRecht,
        niet uit de code van de voorkant.
      </Paragraph>
    </PatternSection>

    <PatternSection
      id="formulier"
      title="Vragen van de assistent als formulier"
    >
      <Paragraph>
        Heeft de assistent antwoorden in een vaste vorm nodig, bijvoorbeeld
        welke maatregelen van de Erkende Maatregelenlijst zijn uitgevoerd? Dan
        krijgt de ondernemer een formulier in plaats van een open vraag.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          Elke vraag is een <code>&lt;fieldset&gt;</code> met{" "}
          <code>&lt;legend&gt;</code>. Keuzes zijn selectievakjes of
          keuzerondjes, geen vrij tekstveld dat het model weer moet uitleggen.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Keuze in stappen</strong> bij lange lijsten: eerst het
          onderdeel (Gebouwen, Faciliteiten, Processen), daarna alleen de
          categorieën daaronder. Vinkt de ondernemer een onderdeel weer uit, dan
          gaan ook de vinkjes eronder weg. Die zouden anders onzichtbaar
          meegestuurd worden.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Vooraf ingevuld, met herkomst</strong>: leidt de backend een
          antwoord af uit een registratie, dan staat het al aangevinkt, met
          uitleg waar het vandaan komt. Zo kan de ondernemer het tegenspreken.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Leg mij dit uit</strong> stuurt de titel en de vragen van het
          formulier mee. Het formulier blijft staan, zodat de ondernemer na de
          uitleg alsnog antwoordt.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Niet alles ingevuld</strong>: een melding boven de knoppen
          vraagt om elke vraag te beantwoorden.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Na versturen</strong> blijven de antwoorden zichtbaar maar
          vergrendeld, en maken de knoppen plaats voor “Antwoord verstuurd”. De
          antwoorden gaan mee als leesbaar bericht én als losse{" "}
          <code>opgaven</code> per veld. Zo hoeft de regel aan de andere kant
          niet te raden welk antwoord bij welke vraag hoort.
        </UnorderedListItem>
        <UnorderedListItem>
          Het formulier krijgt dezelfde bronvermelding als een antwoord. Het
          vraagt gegevens namens een regeling, dus de herkomst hoort erbij.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="focus" title="Focus">
      <UnorderedList>
        <UnorderedListItem>
          Vraagt de assistent iets in het gesprek (deelverzoek, formulier), dan
          gaat de focus naar het eerste veld of de eerste knop. De kop en de
          inleiding hangen eraan met <code>aria-describedby</code>.
        </UnorderedListItem>
        <UnorderedListItem>
          Staat er half getypte tekst in het invoerveld, dan blijft de focus
          daar. Iemand midden in een zin de cursor afpakken is erger dan een
          extra <kbd>Tab</kbd>.
        </UnorderedListItem>
        <UnorderedListItem>
          De focusring verschijnt alleen voor wie het toetsenbord gebruikt. Een
          tekstveld matcht <code>:focus-visible</code> ook na een muisklik, en
          een element dat daarna focus krijgt van de code erft die ring. De chat
          houdt daarom zelf bij wat de laatste invoer was en verbergt de ring
          waar die niet hoort. Bij de eerste toets die de focus verplaatst, is
          de ring er weer.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="vervolgstap" title="Vervolgstap">
      <Paragraph>
        Onder een bericht staat alleen een knop als die past bij wat er net
        gebeurde. Een knop die er altijd staat, wijst net zo vaak de verkeerde
        kant op als de goede.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          Heeft de assistent een zaak ingediend, dan staat onder het antwoord
          Bekijk in Lopende zaken. De zaak staat meteen bij Lopende zaken, en de
          teller in de zijnavigatie werkt direct bij.
        </UnorderedListItem>
        <UnorderedListItem>
          Loopt het vast, dan staat onder de foutmelding Neem contact op.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="fouten" title="Foutmeldingen">
      <Paragraph>
        Een fout is een foutmelding in het gesprek. De tekst zegt wat er aan de
        hand is en wat de ondernemer kan doen:
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          De assistent reageerde te lang niet. Probeer het opnieuw.
        </UnorderedListItem>
        <UnorderedListItem>
          De assistent heeft een technisch probleem. Probeer het later opnieuw.
        </UnorderedListItem>
        <UnorderedListItem>
          De assistent is niet bereikbaar. Controleer uw internetverbinding en
          probeer het opnieuw.
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Wie niet is ingelogd als een bedrijf dat de assistent kent, krijgt “log
        eerst in” als gewoon antwoord, niet als fout. Er is niets stuk; er
        ontbreekt een stap.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bewaren" title="Gesprek bewaren en opnieuw beginnen">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Binnen een tabblad blijft het gesprek staan</strong>: wie naar
          Lopende zaken gaat en terugkomt, vindt het terug. Het staat in{" "}
          <code>sessionStorage</code> en is weg als het tabblad sluit. Zo blijft
          er op een gedeelde computer geen gesprek achter.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Elk bedrijf een eigen gesprek</strong>: wisselt de persona,
          dan wisselt het gesprek mee. Het gesprek van een ander bedrijf loopt
          niet door.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Nieuw gesprek starten</strong> en{" "}
          <strong>Gesprek bewaren</strong> staan uit (<code>aria-disabled</code>
          , niet <code>disabled</code>) tot er een vraag is gesteld. Zo blijven
          ze bereikbaar voor toetsenbord en schermlezer. Tijdens een antwoord
          doen ze niets, anders verdwijnt het gesprek onder het lopende
          antwoord.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Gesprek bewaren</strong> zet het gesprek bij Bewaarde items,
          onder Gesprekken met de digitale assistent. De titel is de eerste
          vraag. De knop wordt Gesprek bewaard en een statusmelding bevestigt
          dat. Lukt bewaren niet, dan zegt de melding dat, in plaats van te doen
          alsof het gelukt is.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Een bewaard gesprek openen</strong> zet het terug in de chat (
          <code>?gesprek=</code>). Een vervolgvraag begint bij de backend een
          nieuw gesprek: de oude sessie is daar dan al opgeruimd.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="status-bronnen" title="Status van bronnen">
      <Paragraph>
        Achter een feature flag staat onder het gesprek welke bronnen de
        assistent gebruikt, en of die nu bereikbaar zijn.
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>
          De status staat in woorden in een uitleg bij de naam van de bron; het
          icoon is versiering. De naam is met het toetsenbord te bereiken en de
          uitleg sluit met <kbd>Escape</kbd> (WCAG 1.4.13 Content on Hover or
          Focus).
        </UnorderedListItem>
        <UnorderedListItem>
          Een bron die in deze omgeving bewust uit staat, staat niet in de
          lijst, in plaats van als “niet bereikbaar”. Een besluit is geen
          storing, en een deelnemer aan een onderzoek leest “niet bereikbaar”
          als “er is iets kapot”.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="identiteit" title="Identiteit">
      <Paragraph>
        De chat stuurt het KVK-nummer van de actieve persona mee in de header{" "}
        <code>X-Test-User</code>. De backend toetst dat aan een lijst met
        toegestane nummers en zet het zelf bij elke vraag aan een bron; het
        model kan de identiteit niet kiezen.{" "}
        <strong>Dit is geen authenticatie</strong>: de header is in de browser
        aan te passen. Voor een gesloten testgroep met verzonnen gegevens is dat
        aanvaardbaar.
      </Paragraph>
    </PatternSection>

    <PatternSection id="demo-modus" title="Demomodus">
      <Paragraph>
        Onder <strong>Flags</strong> staat de demomodus. De assistent speelt dan
        een vast draaiboek af in plaats van een model. Het draaiboek levert
        dezelfde events als de backend, en de chat verwerkt ze op dezelfde
        manier. Wat in de demo te zien is, krijgt een gebruiker dus ook live: de
        toestemmingsvraag, de energiekaart, de formulieren, de zaak en de
        foutmelding. Er zit geen toeval in. Zo doet een demo in
        gebruikersonderzoek en presentaties elke keer hetzelfde.
      </Paragraph>
    </PatternSection>
  </PatternPage>
);

export default Page;
