# MijnOverheid Zakelijk Portaal

## Project

Het MijnOverheid Zakelijk portaal is een overheidsportaal gebouwd met Next.js, React en TypeScript.

## Architectuur

- Gebruik de Next.js App Router onder `src/app/`.
- Gebruik `src/components/` voor kleine herbruikbare UI-componenten.
- Gebruik `src/layouts/` voor gedeelde onderdelen zoals header, footer, navigatie en breadcrumb.
- Gebruik `src/network/` voor API-clients, fetchers, gegenereerde types en React Query-hooks.
- Gebruik `src/utils/` voor algemene hulpfuncties.
- Gebruik `src/styles/` voor globale styling, design tokens en fonts.
- Gebruik de iconen van RHC (`<Icon icon="…" />`). Ontbreekt er een, maak dan een component in `src/components/icons/`.

## React en Next.js

- Gebruik Server Components standaard.
- Voeg `"use client"` alleen toe wanneer state, effects, event handlers of client hooks nodig zijn.
- Gebruik `next/link` voor interne links en `next/image` voor afbeeldingen wanneer passend.
- Hergebruik bestaande layouts, componenten en hooks voordat je nieuwe abstractions toevoegt.
- Houd serverdata en API-logica in de netwerklaag; plaats geen fetch-logica in presentational components.
- Gebruik TypeScript zonder `any`; gebruik bestaande gegenereerde API-types waar mogelijk.

## Design en toegankelijkheid

- Gebruik geen Tailwind-classes, ook niet in bestaande code die je aanpast. Gebruik RHC-componenten (`@/components/rhc`). Waar die niet volstaan, schrijf je een eigen class met RHC-tokens, in een van twee lagen:
  - `src/styles/rhc.css` is de basis die in elke huisstijl geldt. Eigen classes daar krijgen het voorvoegsel `rhc-mox-`, zoals `rhc-mox-main-container`. Zo zijn ze te onderscheiden van de classes van RHC zelf (`rhc-grid`, `rhc-form-field`). Hier horen layout en functionele opmaak.
  - `src/styles/mox.css` is het MOx-thema daarbovenop. Classes daar krijgen het voorvoegsel `mox-` en bouwen voort op de `rhc-mox-`-basis.
  - `src/styles/utils.css` is alleen voor het prototype: hulpmiddelen voor testen en demonstreren, zoals het Flags- en persona-paneel en de PoC-banner. Classes daar krijgen het voorvoegsel `prototype-`. Zet daar niets wat bij het product of de huisstijl hoort.
- Geef eigen classes een Engelse naam, ook als de rest van de code Nederlands is: `mox-sender`, niet `mox-afzender`. Varianten noem je naar hun betekenis, niet naar hun kleur: `mox-badge--article`, niet `mox-badge--blauw`.
- Verticale ruimte regel je met `gap` op de container (grid of flexbox), niet met margins op de kinderen. Een component neemt geen eigen ruimte eromheen mee; de container waarin het staat, bepaalt de afstand.
  - Gebruik het flow-patroon `> * + *` met een margin alleen voor lopende tekst waarvan we de HTML niet zelf maken, zoals `mox-rich-text` en inhoud uit een API.
  - Gebruik nooit `gap` en zo'n margin samen op één container.
- Volg de Rijkshuisstijl, het NL Design System en de bestaande design tokens.
- Gebruik NLDS/Rijkshuisstijl Community-componenten wanneer die passen.
- Gebruik tokens voor de uitzonderingen van MOx (MOBu en MOZa) in `src/styles/rhc.css` in plaats van nieuwe hardcoded ontwerp-waarden.
- Gebruik semantische HTML, correcte headings, landmarks, keyboard navigation en zichtbare focus states.
- Gebruik `aria-current="page"` voor actieve paginalinks.
- Houd iconen schaalbaar met `viewBox="0 0 24 24"` en `currentColor`.
- Schrijf zichtbare teksten helder en op B1-niveau.

## Rijkshuisstijl en NL Design System

- Gebruik Rijks Sans en bestaande Rijksoverheid-kleuren en tokens.
- Gebruik design tokens voor kleur, spacing, typografie, radius en focus.
- Gebruik NLDS/Rijkshuisstijl Community-componenten wanneer die passen bij de taak.
- Importeer NLDS-design tokens en component-CSS één keer in `src/app/layout.tsx`.
- Laat NLDS-componenten binnen de `.rhc-theme`-scope renderen.
- Vermijd nieuwe hardcoded kleuren en parallelle componenten met dezelfde verantwoordelijkheid.

## WCAG en toegankelijkheid

- Bouw volgens WCAG 2.2 AA en EN 301 549.
- Gebruik semantische HTML voordat je ARIA toevoegt. Gebruik alleen ARIA als de juiste HTML elementen en/of attributen niet beschikbaar zijn.
- Zorg voor toetsenbordbediening, logische focusvolgorde en zichtbare `:focus-visible`-stijlen.
- Geef links, knoppen, formulieren, afbeeldingen en statusmeldingen een duidelijke toegankelijke naam.
- Gebruik kleur nooit als enige informatiedrager.
- Controleer loading-, error-, empty- en disabled-states.
- Zet labels boven invoervelden, niet ernaast (WCAG 1.4.10 Reflow).
- Gebruik `aria-disabled` in plaats van `disabled`, zodat een knop focusbaar blijft en een schermlezer deze voorleest.

## Schrijfwijzer (kernregels)

Volledige versie: [docs/schrijfwijzer.md](docs/schrijfwijzer.md). Geldt voor de teksten die we zelf schrijven, niet voor inhoud uit andere bronnen (berichten van organisaties, regelgeving, antwoorden van de assistent).

### Aanspreking en toon

- Spreek de gebruiker aan met "u" en "uw", nooit "je" of "jij". Bij een begroeting mag de voornaam ("Welkom Robin Vogel").
- Genderneutraal: "de ondernemer" of "u", en "die" of "diegene" als verwijswoord.
- Schrijf "u hebt", niet "u heeft". Spreekt de organisatie over zichzelf, dan "wij", niet "we": "Wij halen uw berichten op."
- Formeel maar toegankelijk, B1-niveau, geen jargon zonder uitleg en geen onnodige Engelse termen.
- Actief boven passief en noem wie iets doet: "De RVO heeft uw aanvraag ontvangen", niet "Uw aanvraag is ontvangen".
- Zeg wat de gebruiker kan doen, niet wat het systeem doet.
- Bij lege staten en fouten: zeg wat de gebruiker kan doen, niet alleen wat er misgaat.
- Zinnen van 8 tot 16 woorden, hoogstens één bijzin. Splits lange zinnen.
- Veronderstel geen beperking: "Dit is niet zichtbaar", niet "U kunt dit niet zien".

### Terminologie

| Handeling of begrip                   | Gebruik                 | Niet                                |
| ------------------------------------- | ----------------------- | ----------------------------------- |
| Item bewaren om later terug te zien   | Bewaren                 | Opslaan, Favoriet, Bladwijzer       |
| Item verbergen                        | Niet relevant voor mij  | Verbergen, Verwijderen, Niet tonen  |
| Item doorsturen                       | Delen                   | Doorsturen, Verzenden               |
| Digitale post                         | Berichten, Berichtenbox | Post, E-mail, Inbox                 |
| Tab met ontvangen berichten           | Ontvangen               | Inbox, Postvak IN                   |
| Registratiegegevens                   | Bedrijfsgegevens        | Gegevens, Registratie, Profiel      |
| Openstaande aanvragen                 | Lopende zaken           | Taken, Aanvragen, Dossiers          |
| Gepersonaliseerd overzicht            | Actualiteiten           | Nieuws, Updates, Feed               |
| Gewijzigde gegevens vastleggen        | Opslaan                 | Bewaren, Versturen, Bevestigen      |
| Formulier naar een organisatie sturen | Versturen               | Bewaren, Opslaan, Bevestigen, Delen |
| Formulier afbreken                    | Annuleren               | Terug, Sluiten, Stoppen             |

De digitale assistent en de berichtenbox schrijf je in lopende tekst met kleine letters ("Vraag het de digitale assistent", "Het bericht staat in uw berichtenbox"). Alleen aan het begin van een zin, in een kop, knop of menu-item een hoofdletter ("Digitale assistent (AI)", "Berichtenbox").

### Notatie en leestekens

- Datums: dag, volledige maandnaam, jaar (12 februari 2018). Na een datum met beschrijving een dubbele punt: "19 februari 2026: De Stationsweg is afgesloten."
- KVK en KVK-nummer in hoofdletters, btw en btw-nummer in kleine letters; mkb'er en zzp'er met kleine letters.
- KVK-nummer zonder punten of spaties, btw-nummer aaneen met landcode (NL00012345678), telefoon met spaties (06 12 34 56 78), bedragen met euroteken en punt (€385.000).
- Afkortingen: bij de eerste keer (op een pagina) de volledige term met de afkorting tussen haakjes.
- Komma eerst; puntkomma als de zin al komma's heeft of om twee nauw samenhangende zinnen te verbinden; gedachtestreep alleen als uiterste middel.
- Typografische aanhalingstekens in zichtbare tekst: “dubbel”, ‘enkel’ en ook in mkb’er en komma’s. Rechte quotes alleen in code en attributen.
- Beletselteken als één teken (…), niet als drie punten (...).
- Kopteksten zijn zelfstandige naamwoorden zonder punt aan het einde. Uitzonderingen: een H1 mag een begroeting zijn, een FAQ-kop is een vraag.
- Geen punt na items in een opsomming, tenzij het volledige zinnen zijn.

### Microcopy

- Knoppen kort en met een werkwoord: "Opslaan", "Versturen", "Annuleren", "Opnieuw proberen".
- Noem je een knop, tab of optie in een tekst, zet de naam dan in `<strong>`, zonder aanhalingstekens: "Kies bij een bericht <strong>Archiveren</strong>."
- Lege staat: zeg wat er nog niet is én wat de gebruiker kan doen.
- Foutmelding: zeg wat nodig is om de fout te herstellen.
- Linkteksten beschrijvend: zeg waar de link heen gaat of wat die doet. Nooit "klik hier", "meer info", "lees meer" of een kale URL. Dezelfde tekst gaat naar dezelfde plek. De zichtbare tekst staat vooraan in de toegankelijke naam (WCAG 2.4.4, 2.5.3).
- Gebruik dezelfde termen in navigatie, kruimelpad, pagina's en formulieren.

## Werkwijze

- Houd wijzigingen klein en gericht op de vraag.
- Wijzig geen gegenereerde bestanden handmatig tenzij dat expliciet nodig is.
- Laat bestaande wijzigingen van de gebruiker staan.
- Voeg geen dependency of abstraction toe zonder duidelijke reden.
- Gebruik ASCII waar mogelijk en voeg alleen strikt noodzakelijke codecommentaren toe die verduidelijken wat de code zelf niet expliciet maakt.

## Validatie

Voer na wijzigingen de kleinst passende controles uit:

- `npx prettier --check <bestand>`
- `npx eslint <bestand>`
- `npm run type-check`
- `npm run build` bij wijzigingen aan routing, layouts of Server/Client Component-grenzen

Meld bestaande, niet-gerelateerde fouten apart en wijzig daar geen code voor.
