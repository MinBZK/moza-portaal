---
name: copywriter
description: Controleer en verbeter de interfaceteksten van MijnOverheid Zakelijk (knoppen, koppen, labels, foutmeldingen, statusmeldingen, lege staten, aria-labels). Let vooral op verschillende woorden voor hetzelfde begrip (B1-term heeft voorkeur), genderneutrale en inclusieve aanspreking, en de schrijfwijzer van dit project. Gebruik bij "check de teksten", "copy review", "is dit B1", "klopt de terminologie", "gebruiken we overal hetzelfde woord", "is dit genderneutraal", of na het schrijven van nieuwe interfacetekst.
argument-hint: "<bestand, map, route of losse tekst>"
---

# /copywriter

Controleer de teksten die wij zelf schrijven in MijnOverheid Zakelijk. Inhoud uit andere bronnen (berichten van organisaties, regelgeving, antwoorden van de assistent) valt erbuiten.

## Bronnen (in deze volgorde leidend)

1. `docs/schrijfwijzer.md`: de volledige schrijfwijzer van dit project.
2. `CLAUDE.md`, sectie **Schrijfwijzer (kernregels)**, met de tabel **Terminologie**.
3. De skill `rijksoverheid-copy` voor algemene Rijksoverheid-regels (Direct Duidelijk, B1). Spreekt die het project tegen, dan wint het project. Voorbeeld: bedragen schrijven wij zonder spatie (`€385.000`).

Lees de schrijfwijzer en de terminologietabel vóór elke review. Vertrouw niet op het geheugen.

## Werkwijze

1. **Bepaal de reikwijdte**: een bestand, een map, een route (zoek de `page.tsx` en de componenten eronder) of een losse tekst.
2. **Verzamel de zichtbare teksten**: JSX-tekst, `label`, `legend`, `description`, `errorMessage`, `title` in metadata, `aria-label`, tekst in `VisuallyHidden` en `rhc-visually-hidden`, `placeholder`, en teksten in constanten en datafiles (`src/demo/*.json`) als ze in de interface komen. Sla code, commentaar en inhoud van andere bronnen over.
3. **Controleer per tekst** met de checklist hieronder.
4. **Controleer de termen over de hele codebase**: zoek elk begrip ook buiten de reikwijdte (`grep -rn`), want een term is pas consistent als hij overal hetzelfde is.
5. **Rapporteer** (zie Uitvoer). Pas pas teksten aan als de gebruiker daarom vraagt.

## Checklist

### 1. Eén term per begrip

- Gebruik de term uit de terminologietabel. Een synoniem uit de kolom "Niet" is een bevinding.
- Zoek ook groepen die niet in de tabel staan maar in deze code door elkaar lopen. Bekende risico's:
  - aanvraag / verzoek / dossier / zaak
  - indienen / versturen / insturen / verzenden
  - organisatie / instantie / overheidsorganisatie / overheid
  - onderneming / bedrijf / organisatie (voor de eigen zaak van de gebruiker)
  - ondernemer / werkgever / gebruiker
  - kandidaat / werknemer / persoon / medewerker
  - wijzigen / aanpassen / bewerken
  - verwijderen / wissen / weghalen
- Kies de **B1-term**: het woord dat de gebruiker zelf zou gebruiken en typen. Een vakterm alleen als die nodig is, en dan met uitleg (bijvoorbeeld met een `BegripInfo` of `InfoToggletip`).
- Een begrip mag in de flow van betekenis veranderen (een aanvraag wordt na het indienen een zaak). Controleer dan of die overgang klopt en overal hetzelfde moment is.
- Dezelfde naam voor dezelfde plek: navigatie, kruimelpad, paginatitel, kop en knop naar die pagina heten hetzelfde.
- Stel een nieuwe term voor voor de terminologietabel als een groep vaak terugkomt.

### 2. Aanspreking: genderneutraal en inclusief

- "u" en "uw", nooit "je" of "jij". "U heeft", niet "u hebt"; ook "Heeft u …?". De organisatie spreekt als "wij", niet "we".
- Geen "hij", "zij", "hem", "haar", "hij/zij" of "zijn/haar" voor een onbekend persoon. Gebruik "de ondernemer", "de kandidaat", "die", "diegene", de voornaam, of herschrijf de zin.
- Leid geen geslacht af uit een voornaam, ook niet in voorbeelddata.
- Neutrale functienamen: "medewerker", niet "medewerkster"; geen "-ster"/"-es" als het geslacht er niet toe doet.
- Veronderstel geen beperking: "Dit is niet zichtbaar", niet "U kunt dit niet zien". Schrijf over de persoon, niet over de beperking: "iemand met een arbeidsbeperking", niet "een gehandicapte".
- Geen woorden die een groep als afwijkend neerzetten: niet "normale" of "gewone" collega, wel "een collega in dezelfde functie".
- "Nederlanders" alleen als nationaliteit bedoeld is; anders "mensen in Nederland".

### 3. B1 en zinsbouw

- 8 tot 16 woorden per zin, hoogstens één bijzin. Splits langere zinnen.
- Actief en met de handelende partij: "De gemeente beslist", niet "Er wordt beslist".
- Geen ambtelijke woorden zonder uitleg (zie de tabel in `rijksoverheid-copy`): middels, derhalve, ten behoeve van, beschikking, onverwijld.
- Geen afkorting zonder dat die op de pagina eerst voluit staat: "Kamer van Koophandel (KVK)".
- Geen onnodige Engelse woorden: "inloggen", "e-mail" en "website" zijn gewoon; "dashboard", "feed" en "update" niet.
- Geen kleinerende woorden: "gewoon", "simpelweg", "even", "makkelijk".

### 4. Microcopy

- **Knoppen**: kort, met een werkwoord, en zeggen wat er gebeurt: "Versturen", "Annuleren", "Opnieuw proberen". Geen "OK", "Ja" of "Doorgaan" zonder object, behalve in een vaste vraag en antwoord.
- **Links**: beschrijvend. Nooit "klik hier", "meer info", "lees meer" of een kale URL. Dezelfde tekst gaat naar dezelfde plek.
- **Toegankelijke naam**: de zichtbare tekst staat vooraan in `aria-label` of het verborgen deel (WCAG 2.5.3). Een `aria-label` dat alleen herhaalt wat er al staat, is overbodig.
- **Verwijzen naar een knop** in lopende tekst: de naam in `<strong>`, zonder aanhalingstekens: "Kies **Archiveren**".
- **Apparaatneutraal**: "kies" of "selecteer", niet "klik" of "tik".
- **Koppen**: zelfstandige naamwoorden, zonder punt. Uitzonderingen: een begroeting als H1, een vraag als FAQ-kop.
- **Foutmeldingen**: zeg wat nodig is om het te herstellen, bij het veld zelf. "U heeft nog geen eerste werkdag ingevuld", niet "Ongeldige invoer".
- **Lege staten**: zeg wat er nog niet is én wat de gebruiker kan doen.
- **Statusmeldingen** (`role="status"`, `LoadingStatus`): kort, en ze kloppen ook voorgelezen zonder het scherm erbij. Een melding die alleen via kleur of een icoon werkt, is een bevinding.
- **Bevestigingen**: noem de actie en het gevolg: "Aanvraag intrekken? U kunt die daarna niet meer wijzigen."
- **Labels**: boven het veld, nooit alleen een plaatshouder. Een plaatshouder geeft hoogstens een voorbeeld.

### 5. Notatie en leestekens

- Datums: dag, volledige maandnaam, jaar: "12 februari 2018". In invoervelden mag 03-06-2001.
- Bedragen: euroteken en punt, zonder spatie: "€385.000".
- KVK-nummer zonder spaties, btw-nummer aaneen met landcode, telefoon met spaties: "06 12 34 56 78".
- KVK en KVK-nummer in hoofdletters; btw, mkb'er en zzp'er in kleine letters.
- Typografische aanhalingstekens “ ” en ‘ ’, ook in mkb’er. Rechte quotes alleen in code en attributen.
- Beletselteken als één teken: … (niet drie punten).
- Geen punt na items in een opsomming, tenzij het hele zinnen zijn.
- "digitale assistent" en "berichtenbox" klein in lopende tekst, met hoofdletter aan het begin van een zin, kop, knop of menu-item.
- Geen uitroeptekens in de interface.

### 6. Consistentie in de flow

- Teksten die over hetzelfde gaan, zeggen hetzelfde: de knop, de bevestiging erna en de melding in Lopende zaken.
- Termijnen en bedragen in de interface komen overeen met de bron (wet, regeling, demo-data).
- Een tekst die over een volgende stap gaat, gebruikt de naam van die stap (`STAPPEN`, `TAAK_TITEL`), niet een eigen omschrijving.

## Uitvoer

1. **Samenvatting** in twee of drie zinnen: hoeveel bevindingen, en welke het belangrijkst zijn.
2. **Termen die door elkaar lopen**: per begrip de gevonden varianten met het aantal en de plekken (`bestand:regel`), en de voorgestelde term.

   | Begrip | Gevonden | Voorstel | Plekken |
   | ------ | -------- | -------- | ------- |

3. **Bevindingen per tekst**, op volgorde van ernst (eerst wat de gebruiker op een dwaalspoor zet, dan regels uit de schrijfwijzer, dan notatie):

   | Plek | Nu  | Probleem | Voorstel | Regel |
   | ---- | --- | -------- | -------- | ----- |

4. **Voorstellen voor de schrijfwijzer**: nieuwe termen of regels die in `docs/schrijfwijzer.md` of de terminologietabel horen.

Geef bij elk voorstel de nieuwe tekst helemaal, zodat die direct over te nemen is. Twijfel je, noem dan twee opties en zeg welke je aanraadt.
