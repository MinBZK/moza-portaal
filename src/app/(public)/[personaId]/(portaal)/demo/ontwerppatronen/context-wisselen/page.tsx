import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import {
  ExternalLink,
  PatternPage,
  PatternSection,
  PatternTable,
  Source,
} from "../_parts";

export const metadata: Metadata = {
  title: "Context wisselen - Ontwerppatronen",
};

const SWITCHER = `Robin Vogel van Bloom B.V. ▾
├── Privé
│   └── Robin Vogel
├── Ik handel namens
│   ├── Anne Vogel-de Groot                  Mantelzorg
│   └── Sofia René Vogel                     Ouderlijk gezag
├── Mijn ondernemingen
│   ├── Bloom B.V.                           Eigenaar    ✓
│   ├── Vogel & Partners Consultancy         Eigenaar
│   └── Kwartaal Vastgoed B.V.               Eigenaar
└── Mijn belangen
    ├── VvE Residentie Parkzicht             Bestuurslid
    ├── Volkstuinvereniging De Groene Long   Penningmeester
    └── Familiebedrijf Winter                Gemachtigde`;

const Page = () => (
  <PatternPage title="Context wisselen">
    <Paragraph>
      Een gebruiker van MijnOverheid handelt niet in één vaste rol. Dezelfde
      persoon kan burger zijn, ondernemer van meerdere bedrijven, gemachtigde
      van een familielid én professioneel dienstverlener voor andere
      organisaties. Het ontwerp moet dit ondersteunen, het liefst zonder dat de
      gebruiker steeds opnieuw moet inloggen (<i lang="en">account switching</i>
      ).
    </Paragraph>
    <Paragraph>
      <strong>
        Let op: de oplossingen hieronder zijn niet getoetst aan de technische,
        juridische en organisatorische mogelijkheden van nu. Ze schetsen een
        ideaalbeeld om naartoe te werken.
      </strong>
    </Paragraph>

    <PatternSection id="contexten" title="Contexten">
      <Paragraph>
        Een gebruiker kan in meerdere contexten handelen. Elke context bepaalt
        welke gegevens, taken, berichten en actualiteiten zichtbaar zijn.
      </Paragraph>

      <PatternSection id="prive" title="Privé (burger)" level={3}>
        <Paragraph>
          De persoonlijke omgeving van de burger. Denk aan toeslagen,
          belastingaangiften, berichten van de gemeente en DigiD-zaken.
        </Paragraph>
        <Paragraph>
          Binnen de privécontext kan een burger <strong>gemachtigd</strong> zijn
          om taken namens anderen te doen, bijvoorbeeld:
        </Paragraph>
        <PatternTable
          head={["Gemachtigde voor", "Relatie", "Voorbeelden van taken"]}
          rows={[
            [
              "Ouder(s)",
              "Mantelzorger of wettelijk vertegenwoordiger",
              "Wmo-aanvragen, belastingaangifte, toeslagen beheren",
            ],
            [
              "Kind(eren)",
              "Ouderlijk gezag",
              "Kinderbijslag, studiefinanciering, zorgverzekering",
            ],
            [
              "Partner",
              "Machtiging",
              "Gezamenlijke belastingaangifte, toeslagen",
            ],
            [
              "Buurvrouw of kennis",
              "Vrijwillige machtiging",
              "Digitale post ophalen, formulieren invullen",
            ],
          ]}
        />
      </PatternSection>

      <PatternSection id="zakelijk" title="Zakelijke gebruiker" level={3}>
        <Paragraph>
          De zakelijke omgeving toont gegevens, verplichtingen en actualiteiten
          voor een zakelijke gebruiker. Een persoon kan eigenaar zijn van
          meerdere ondernemingen, bijvoorbeeld:
        </Paragraph>
        <PatternTable
          head={["Onderneming", "Rol", "Wat zichtbaar is"]}
          rows={[
            [
              "Eigen B.V.",
              "Eigenaar of bestuurder",
              "Alles: gegevens, belastingen, personeel, berichten, subsidies",
            ],
            [
              "Tweede onderneming",
              "Eigenaar of vennoot",
              "Alles, mogelijk met een andere branche en een ander vestigingsadres, en dus andere actualiteiten",
            ],
          ]}
        />
      </PatternSection>

      <PatternSection
        id="belangen"
        title="Belangen en machtigingen (zakelijk)"
        level={3}
      >
        <Paragraph>
          Naast eigen ondernemingen kan een persoon een zakelijke relatie hebben
          met ondernemingen van anderen. De soort relatie en de instellingen van
          machtigingen bepalen welke gegevens en taken zichtbaar zijn:
        </Paragraph>
        <PatternTable
          head={["Rol", "Komt voor bij", "Voorbeelden van taken"]}
          rows={[
            [
              "Vennoot (vof)",
              "Vennootschap onder firma",
              "Gezamenlijke belastingaangifte, inzicht in bedrijfsgegevens, personeel",
            ],
            [
              "Bestuurslid",
              "Stichting, vereniging",
              "KVK-gegevens beheren, jaarrekening deponeren, subsidies aanvragen",
            ],
            [
              "Aandeelhouder",
              "B.V., coöperatie",
              "Inzicht in bedrijfsgegevens, mogelijk alleen financiële overzichten",
            ],
            [
              "Boekhouder of accountant",
              "Externe gemachtigde",
              "Belastingaangiften, loonaangiften en btw-aangiften, voor meerdere ondernemingen",
            ],
            [
              "Gemachtigde medewerker",
              "Machtiging",
              "Bepaalde taken namens de onderneming, afhankelijk van het niveau van de machtiging",
            ],
          ]}
        />
      </PatternSection>
    </PatternSection>

    <PatternSection
      id="accountwisselaar"
      title="Ontwerppatroon: accountwisselaar"
    >
      <Paragraph>
        De accountwisselaar is een uitklapmenu bovenaan de pagina, in de header.
        Het toont alle contexten waarin de ingelogde persoon kan handelen,
        gegroepeerd op soort:
      </Paragraph>
      <pre className="rhc-mox-code-block">{SWITCHER}</pre>

      <PatternSection id="ontwerpkeuzes" title="Ontwerpkeuzes" level={3}>
        <UnorderedList>
          <UnorderedListItem>
            <strong>Eén keer inloggen, meerdere contexten</strong>: de gebruiker
            logt één keer in, bijvoorbeeld met DigiD, eHerkenning of een wallet.
            Daarna wisselt die zonder opnieuw in te loggen. De contexten komen
            uit de identiteit, bijvoorbeeld BSN naar KVK-koppelingen en
            machtigingen.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Gegroepeerd op soort relatie</strong>: Privé, Ik handel
            namens (machtigingen voor personen), Mijn ondernemingen (eigenaar of
            vennoot) en Mijn belangen (bestuurslid, gemachtigde) zijn zichtbaar
            gescheiden groepen. Dat houdt het overzichtelijk bij veel contexten.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Rol zichtbaar per context</strong>: naast de naam van de
            organisatie staat de rol (Eigenaar, Bestuurslid, Aandeelhouder,
            Boekhouder). Dat maakt de rechten duidelijk, ook bij organisaties
            waar de gebruiker meerdere rollen heeft.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Actieve context gemarkeerd</strong>: de huidige context
            heeft een zichtbare markering (<code>aria-current</code>). Zo ziet
            de gebruiker altijd namens wie die handelt.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Context in de knop van de wisselaar</strong>: de paginatitel
            hoort bij de omgeving (“MijnOverheid Zakelijk” of “MijnOverheid”) en
            wisselt niet mee. De actieve context staat in de knop, bijvoorbeeld
            “Robin Vogel van Bloom B.V.” of “Robin Vogel voor VvE Residentie
            Parkzicht”.
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="toegankelijkheid" title="Toegankelijkheid" level={3}>
        <UnorderedList>
          <UnorderedListItem>
            De wisselaar volgt het patroon{" "}
            <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/">
              W3C Menu Button
            </ExternalLink>
            : <code>aria-expanded</code>, <code>aria-haspopup</code>,{" "}
            <code>role=&quot;menu&quot;</code> en{" "}
            <code>role=&quot;menuitem&quot;</code>.
          </UnorderedListItem>
          <UnorderedListItem>
            Het menu sluit met <kbd>Escape</kbd> en bij een klik buiten het
            menu.
          </UnorderedListItem>
          <UnorderedListItem>
            De namen van de groepen zijn zichtbaar maar niet interactief. Ze
            ordenen het menu zonder de toetsenbordbediening te storen.
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection
        id="ik-handel-namens"
        title="Machtigingen: Ik handel namens"
        level={3}
      >
        <Paragraph>
          Machtigingen om namens een persoon te handelen hebben geen eigen
          wisselaar. Ze staan in hetzelfde menu, in de groep{" "}
          <strong>Ik handel namens</strong>: Anne Vogel-de Groot (mantelzorg) en
          Sofia René Vogel (ouderlijk gezag).
        </Paragraph>
        <Paragraph>
          De burgeromgeving en de zakelijke omgeving gebruiken hetzelfde menu.
          Alleen de tekst van de knop en het icoon in de header verschillen.
        </Paragraph>
      </PatternSection>
    </PatternSection>

    <PatternSection
      id="visuele-identiteit"
      title="Visuele identiteit per context"
    >
      <Paragraph>
        Na een wissel moet de gebruiker meteen zien <i>waar</i> die is en{" "}
        <i>namens wie</i> die handelt. Daarvoor heeft elke soort context een
        eigen visuele identiteit, binnen één consistent ontwerpsysteem. Het
        verschil mag niet alleen in kleur zitten: dan is het niet toegankelijk
        voor mensen die kleuren slecht onderscheiden.
      </Paragraph>

      <PatternSection id="uitgangspunten" title="Uitgangspunten" level={3}>
        <UnorderedList>
          <UnorderedListItem>
            <strong>Consistentie boven variatie</strong>: in elke context blijft
            de interface herkenbaar als MijnOverheid. Layout, typografie,
            componenten en interactie zijn gelijk. Het verschil zit in signalen,
            niet in een ander ontwerp.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Niet alleen kleur</strong>: kleur mag ondersteunen, maar is
            nooit het enige verschil (
            <ExternalLink href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">
              WCAG 1.4.1 Use of Color
            </ExternalLink>
            ). Elk verschil moet ook zonder kleur te zien zijn.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Weinig soorten context</strong>: het verschil is er per{" "}
            <i>soort</i> context, niet per organisatie. Privé (eigen en
            gemachtigd) en zakelijk (eigen en gemachtigd of belang): hoogstens
            vier varianten.
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="signalen" title="Mogelijke signalen" level={3}>
        <Paragraph>
          Contexten zijn te onderscheiden met een combinatie van deze signalen:
        </Paragraph>
        <PatternTable
          head={["Signaal", "Waar", "Voorbeeld", "Werkt zonder kleur?"]}
          rows={[
            [
              "Tekstlabel in de header",
              "Naast de paginatitel",
              "“MijnOverheid”, “MijnOverheid Zakelijk” of “MijnOverheid Zakelijk namens VvE Residentie Parkzicht”",
              "Ja",
            ],
            [
              "Icoon bij de naam van de context",
              "Accountwisselaar en header",
              "Persoon (privé), gebouw (eigen zakelijk), sleutel of machtiging (gemachtigd)",
              "Ja",
            ],
            [
              "Contextbanner",
              "Boven of onder de header",
              "Een smalle balk met “U handelt namens: VvE Residentie Parkzicht (bestuurslid)”, zolang de context niet de eigen persoon of onderneming is",
              "Ja (tekst en plek)",
            ],
            [
              "Accentkleur van header of rand",
              "Bovenkant van de pagina of rand van de header",
              "Lintblauw (privé), hemelblauw (zakelijk), oranje (gemachtigd)",
              "Nee; ondersteunt alleen, nooit het enige signaal",
            ],
            [
              "Variant van het beeldmerk",
              "Logo in de header",
              "Beeldmerk van de Rijksoverheid (privé), of met een toevoeging (zakelijk)",
              "Ja",
            ],
          ]}
        />
      </PatternSection>

      <PatternSection
        id="gemachtigd"
        title="Aandachtspunten bij handelen namens een ander"
        level={3}
      >
        <Paragraph>
          Wie namens een andere persoon of organisatie handelt, heeft extra
          duidelijkheid nodig. Een belastingaangifte voor de verkeerde
          organisatie heeft echte gevolgen.
        </Paragraph>
        <UnorderedList>
          <UnorderedListItem>
            <strong>Altijd zichtbaar</strong>: de contextbanner (“U handelt
            namens…”) blijft zichtbaar zolang de context actief is, ook bij
            scrollen. Zo vergeet de gebruiker niet namens wie die handelt.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Bevestigen bij gevoelige acties</strong>: bij versturen,
            gegevens wijzigen of een aangifte doen kan een extra stap tonen
            namens wie de actie gebeurt.
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Duidelijk anders dan de eigen context</strong>: lijkt het
            ontwerp te veel op de eigen context, dan vergist de gebruiker zich
            sneller.
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="onderzoeksvragen" title="Onderzoeksvragen" level={3}>
        <Paragraph>
          Dit onderwerp vraagt om gericht gebruikersonderzoek. Deze vragen
          kunnen de basis zijn:
        </Paragraph>
        <UnorderedList>
          <UnorderedListItem>
            <strong>Herkenning</strong>: zien gebruikers in welke context ze
            zijn? Hoe snel? Welke signalen vallen op en welke niet?
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Verwarring</strong>: raken gebruikers in de war bij het
            wisselen, vooral als ze snel tussen eigen en gemachtigde contexten
            schakelen?
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Genoeg verschil</strong>: is het verschil tussen “eigen
            zakelijk” en “gemachtigd zakelijk” groot genoeg? Of ervaren
            gebruikers ze als hetzelfde?
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Kleur als ondersteuning</strong>: voegt een accentkleur,
            zoals een gekleurde lijn in de header, iets toe aan tekst en iconen?
            Of is die overbodig?
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Contextbanner</strong>: zien gebruikers de banner “U handelt
            namens…”? Of zien ze die na een tijd niet meer (bannerblindheid)?
          </UnorderedListItem>
          <UnorderedListItem>
            <strong>Verschillen tussen doelgroepen</strong>: ervaren
            professionele gemachtigden (boekhouders die elke dag wisselen) het
            anders dan wie af en toe iets regelt, zoals een mantelzorger voor
            een ouder?
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="referenties" title="Referenties" level={3}>
        <Source
          href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html"
          title="WCAG 1.4.1 Use of Color"
        >
          <Paragraph>
            Kleur mag niet het enige middel zijn om informatie over te brengen.
            Elk kleurverschil tussen contexten heeft ook een verschil in tekst
            of vorm nodig.
          </Paragraph>
        </Source>
        <Source
          href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html"
          title="WCAG 1.4.11 Non-text Contrast"
        >
          <Paragraph>
            Een markering zoals een gekleurde lijn in de header heeft genoeg
            contrast nodig met de achtergrond: minstens 3:1.
          </Paragraph>
        </Source>
        <Source
          href="https://design-system.service.gov.uk/styles/colour/"
          title="GOV.UK: Colour"
        >
          <Paragraph>
            Het Britse design system gebruikt kleur om betekenis te{" "}
            <i>versterken</i>, niet om die te dragen. Elke kleur hoort bij een
            tekst of icoon met dezelfde informatie. Dat geldt hier ook.
          </Paragraph>
        </Source>
        <Source
          href="https://www.nngroup.com/articles/indicating-focus/"
          title="Indicating Focus to Support Accessibility"
          by="Nielsen Norman Group"
        >
          <Paragraph>
            Laat een staat, ook de actieve context, op meerdere manieren zien:
            kleur, vorm, plek en tekst. Dat geldt voor de header en voor de
            wisselaar.
          </Paragraph>
        </Source>
        <Source
          href="https://baymard.com/blog/mobile-banking-accounts"
          title="Account context patterns in banking apps"
          by="Baymard"
        >
          <Paragraph>
            Bankapps lossen een vergelijkbaar probleem op: wisselen tussen
            privé- en zakelijke rekeningen, gezamenlijke rekeningen en
            machtigingen. Patronen: een accentkleur per soort rekening, altijd
            zichtbaar welke rekening actief is, en bevestigen bij een betaling.
          </Paragraph>
        </Source>
      </PatternSection>
    </PatternSection>

    <PatternSection id="open-vragen" title="Openstaande vragen">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Hoe halen wij machtigingen technisch op?</strong> DigiD
          Machtigen, eHerkenning en het Handelsregister zijn drie verschillende
          bronnen. De accountwisselaar moet ze samenvoegen tot één overzicht.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Wat als er veel contexten zijn?</strong> Een boekhouder met
          tientallen klanten heeft een ander overzicht nodig dan een ondernemer
          met twee B.V.’s. Misschien is zoeken of ordenen nodig bij meer dan
          ongeveer acht contexten.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Welke gegevens wisselen mee?</strong> Bij een wissel
          veranderen bedrijfsgegevens, actualiteiten, berichten en lopende
          zaken. Persoonlijke voorkeuren, zoals taal en meldingen, blijven
          waarschijnlijk hetzelfde.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Hoe voorkomen wij misbruik?</strong> Handelt iemand namens een
          ander, dan moeten die acties worden vastgelegd. De gebruiker moet
          altijd zien namens wie die handelt.
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <PatternSection
        id="bronnen-wisselen"
        title="Wisselen tussen contexten"
        level={3}
      >
        <Source
          href="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/"
          title="W3C ARIA Authoring Practices: Menu Button"
        >
          <Paragraph>
            Het toegankelijke patroon voor een uitklapmenu, de basis van de
            accountwisselaar. Beschrijft de toetsenbordbediening:{" "}
            <kbd>Enter</kbd> of <kbd>Spatie</kbd> opent, <kbd>Escape</kbd>{" "}
            sluit, pijltoetsen navigeren.
          </Paragraph>
        </Source>
        <Source href="https://m3.material.io/" title="Material Design">
          <Paragraph>
            Richtlijnen van Google voor wisselen tussen accounts in apps: een
            pictogram van de gebruiker in de header opent een paneel met alle
            accounts, het actieve account is gemarkeerd.
          </Paragraph>
        </Source>
        <Source
          href="https://fluent2.microsoft.design/"
          title="Microsoft Fluent 2"
        >
          <Paragraph>
            Het patroon van Microsoft voor identiteit en wisselen van rol.
            Relevant voor hoe naam, rol en organisatie compact samen worden
            getoond.
          </Paragraph>
        </Source>
      </PatternSection>

      <PatternSection
        id="bronnen-machtigingen"
        title="Machtigingen en vertegenwoordiging"
        level={3}
      >
        <Source href="https://www.digid.nl/machtigen" title="DigiD Machtigen">
          <Paragraph>
            Hiermee machtigt een burger iemand anders om digitale zaken met de
            overheid te regelen. Relevant voor de privécontext: wie mag namens
            wie handelen.
          </Paragraph>
        </Source>
        <Source href="https://www.eherkenning.nl/" title="eHerkenning">
          <Paragraph>
            De zakelijke tegenhanger van DigiD Machtigen. Met een
            ketenmachtiging kan een boekhouder namens meerdere ondernemingen
            handelen. Dit is de bron voor de groep Mijn belangen.
          </Paragraph>
        </Source>
        <Source href="https://www.kvk.nl/" title="Handelsregister (KVK)">
          <Paragraph>
            De bron voor wie welke rol heeft bij welke onderneming: eigenaar,
            bestuurder, vennoot, gevolmachtigde. Hieruit komen de groepen Mijn
            ondernemingen en Mijn belangen.
          </Paragraph>
        </Source>
      </PatternSection>

      <PatternSection id="bronnen-overheid" title="Overheid" level={3}>
        <Source href="https://mijn.overheid.nl/" title="MijnOverheid">
          <Paragraph>
            Nu zijn burger en ondernemer aparte ingangen, zonder wisselen op de
            pagina. De accountwisselaar kan dat misschien vervangen door één
            geïntegreerde omgeving.
          </Paragraph>
        </Source>
        <Source
          href="https://design-system.service.gov.uk/components/header/"
          title="GOV.UK Design System: Header"
        >
          <Paragraph>
            Toont de naam van de ingelogde gebruiker in de header. Geen
            accountwisselaar, wel identiteit bovenaan de pagina.
          </Paragraph>
        </Source>
        <Source
          href="https://nldesignsystem.nl/community/community-sprints/mijn-services-community/"
          title="NL Design System: Mijn Services Community"
        >
          <Paragraph>
            Werkt aan patronen voor de Mijn-omgevingen van de overheid. Wisselen
            van rol en machtigingen komen daar steeds terug.
          </Paragraph>
        </Source>
        <Source href="https://commonground.nl/" title="Common Ground">
          <Paragraph>
            Uitgangspunt: gegevens blijven bij de bron. Relevant voor hoe de
            accountwisselaar contexten ophaalt: niet alles naar één plek
            kopiëren, maar per context de juiste bronnen raadplegen.
          </Paragraph>
        </Source>
      </PatternSection>
    </PatternSection>
  </PatternPage>
);

export default Page;
