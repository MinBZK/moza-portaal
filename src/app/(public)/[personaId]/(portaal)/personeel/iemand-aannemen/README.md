# Iemand aannemen (Digitale assistent 2.0)

Stand 25 oktober 2026, branch `feat/iemand-aannemen` vanaf `ux-fork`. Voor het
gebruikersonderzoek van half november 2026 (usecase Financieel CV). De
regelrecht-engine rekent live in de browser.

## Wat het is

Pagina's onder Personeel en Lopende zaken, naar de flow van het prototype
vooringevulde-aanvraag (KVK-versie): eerst vier korte vragen, dan de aanvraag,
voor de persona die in het portaal actief is (standaard `karin`, Kwekerij De
Bloesem, gemeente Lansingerland). Na de oriëntatie volgt de route de situatie
die de werkgever koos (zie "Route per situatie"). Elke gebeurtenis met datum,
actor en wetsgrond van het verhaal via de gemeente staat in
`verhaallijn-koen-v1.md` (in deze map); de ontwerpkeuzes van de routes in
`ontwerp-fase2-per-situatie-v1.md`.

| Pad                                                                       | Wat de deelnemer doet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/personeel`                                                              | Start "Iemand aannemen"; na het indienen staat de zaak hier                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt` | De bewaarde aanvraag (melding op home en Lopende zaken, blok "Aanvragen die u nog moet versturen"): organisatie, tijdsduur, "antwoorden van Ondernemersplein overgenomen"; daaronder vier korte vragen (wie, als meerkeuze met acht opties: Wajong vinkt het doelgroepregister aan en zet het vast, beschut werk sluit het register uit; uren, loonwaarde en uurloon als schuifregelaar); rechts live "Wat de regelingen opleveren": loonkosten min loonkostensubsidie, loondispensatie en loonkostenvoordeel uit de engine, met een (i) bij elke aanname; de regelingen die verder kunnen gelden, ook uit de engine; "Aanvraag laten invullen". `/personeel/iemand-aannemen` verwijst hierheen |
| `/personeel/iemand-aannemen/gegevens`                                     | Aanvraag laten invullen: namens wie, de kandidaat kiezen (met toestemming) of toevoegen (wacht op toestemming), per organisatie een accordeon met de gegevens als vraag en antwoord, de datum en de wetsvraag; alleen de organisaties die iets weten over de situatie; vinkje per organisatie, standaard aan.                                                                                                                                                                                                                                                                                                                                                                                   |
| `/personeel/iemand-aannemen/concept-aanvraag`                             | De vooringevulde aanvraag, per organisatie: een paneel per regeling die de werkgever zelf indient, met gegevens en bron, "Waarom deze uitkomst?", keuzes (jobcoaching, werkplekaanpassing, proefplaatsing bij de gemeente) en "Ik heb dit gecontroleerd"; daaronder "Taken voor de werknemer" en "Gaat vanzelf of via de loonaangifte"; Gecontroleerd n van N (alleen panelen); rechts "Wat dit u oplevert" live, per regeling (loonkostensubsidie, loondispensatie, loonkostenvoordeel; ook als die niet gelden) en samen. Zonder paneel staat er "Klaar" in plaats van indienen                                                                                                               |
| `/personeel/iemand-aannemen/versturen`                                     | Controleren en versturen bij de gemeente of UWV: wat naar die organisatie gaat, wat de werknemer zelf aanvraagt, wat vanzelf geldt, wat later komt, wat niet; bevestiging; Indienen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `/personeel/iemand-aannemen/verstuurd`                                    | Bevestiging, link naar de zaak                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `/personeel/iemand-aannemen/overzicht`                                    | Na de gegevens, waar niets te versturen is (alleen doelgroepregister, beschut werk, geen van deze, of een uitkomst zonder aanvraag): wat voor de werkgever geldt, met de (i)-teksten van de oriëntatie                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `/lopendezaken`                                                           | De zaak staat in het overzicht (via de opslag die ook de Digitale assistent gebruikt)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/lopendezaken/iemand-aannemen/[situatie]`                                | De zaak van die situatie (gemeente, wajong of wia): voortgang (status-track), alles wat is vastgelegd (tijdlijn met correctie), komt hierna; bij WIA de doelgroepverklaring met de stand van de taak van de werknemer                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/lopendezaken/iemand-aannemen/[situatie]/besluit`                        | Besluit (gemeente: college; wajong: UWV), dezelfde berekening als vooraf, "Waarom" met engine-stappen, "Klopt dit niet?". WIA heeft geen besluitpagina                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `/lopendezaken/loonkostensubsidie-koen` en `.../besluit`                  | Oude links; verwijzen door naar de zaak en het besluit van de gemeente                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Route per situatie

`situatieVan` in `_route.ts` kiest uit de vinkjes van vraag 1 de eerste die
past: Wajong, WIA, bijstand of register, anders uitleg (beschut werk,
geen van deze of niets gekozen). `routeVoor` maakt daarvan de route met de uitkomsten van
de engine: welke panelen er zijn per organisatie, welke taken de werknemer
heeft, wat vanzelf gaat en of er een zaak is. Geeft de engine geen recht, dan
is er geen paneel; blijft er niets over, dan volgt na de gegevens het
overzicht. Elke route begint bij de gegevens (toestemming en wat de overheid al
weet). Bij de
gemeente telt werkplekaanpassing alleen niet als aanvraag: zonder
loonkostensubsidie, jobcoaching of proefplaatsing volgt ook het overzicht. Het
loonkostenvoordeel arbeidsgehandicapte geeft in elke situatie de taak
doelgroepverklaring; alleen bij WIA is dat een eigen zaak.

| Situatie                                              | Route na de oriëntatie                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `gemeente` (bijstand)                                 | gegevens → concept-aanvraag → versturen naar de gemeente → verstuurd → zaak → besluit van het college                                |
| `wajong`                                              | idem bij UWV: loondispensatie; jobcoach en werkplek vraagt de werknemer aan (Wajong 2:22)                                            |
| `wia`                                                 | gegevens → concept-aanvraag → Klaar → zaak "Doelgroepverklaring"; de werkgever dient niets in, de werknemer vraagt de verklaring aan |
| `register`                                            | overzicht: loonkostenvoordeel in de loonaangifte en de no-riskpolis                                                                  |
| `uitleg` (beschut werk, geen van deze, niets gekozen) | overzicht met uitleg; geen aanvraag in het portaal                                                                                   |

De opslag bewaart per situatie een eigen zaak (`zaken[situatie]`); een oudere
opslag met één zaak hoort bij de gemeente (`migreerZaken`). Bij indienen (en
bij "Klaar" voor WIA) krijgt de zaak een kopie van de antwoorden en het
onderwerp; zaak en besluit rekenen met die kopie (`antwoordenVoorZaak`), zodat
een andere oriëntatie een ingediende zaak niet verandert. In `moza-zaken`
dragen de zaken `flow: "iemand-aannemen"` en de situatie; Lopende zaken linkt
alleen die (en oude zaken met een zaaknummer uit de demo-bestanden) naar deze
zaakpagina's, nooit een chat-zaak met een vergelijkbaar onderwerp.

Schermafdrukken maakt `scripts/iemand-aannemen-schermen.mjs` (1280 en 390, consolefouten, overflow, live berekening); `docs/` staat in .gitignore, dus kies een eigen map.

## De regelrecht-engine in de browser

`public/regelrecht/` bevat de WASM-kern van
[regelrecht-uitleg](https://github.com/ravimeijerrig/regelrecht-uitleg)
(`pkg/`), de gepinde wetversies (`wetten.json`, 59 versies van 13 regelingen,
15 MB; gecomprimeerd 2,4 MB), de presentatielaag en `manifest.json` met de
pins: engine `0a1a76c8` (regelrecht main) en corpus `42054d7d`
(`traject/financieel-cv-0bc401e0`). `worker.js` laadt dat één keer in een
Web Worker; `_useRegelrecht.ts` praat ermee. De kern toetst elk aangeleverd
bestand aan zijn ingebakken pin: een ander bestand is een fout, geen stille
afwijking.

Wat live is: de oriëntatie rekent voor elke uitgangssituatie van de
Uitkomstenkaart Financieel CV de acht regelingen (loonkostensubsidie,
loondispensatie, doelgroepregister, loonkostenvoordeel, no-riskpolis,
proefplaatsing, begeleiding, voorzieningen WIA 35) bij elke wijziging van de
antwoorden. `_uitkomsten.ts` zet de antwoorden om in feiten voor de engine
(neutrale basis `_basisfeiten.json` plus feiten per vinkje) en de uitkomsten in
wat het scherm toont; nooit te gunstig, met een (i) bij een aanname. Ontwerp en
keuzes: `ontwerp-orientatie-alle-uitkomsten-v1.md`. Elke aanroep van de kern
kost bijna een seconde, dus alleen de aanroepen die bij de vinkjes iets kunnen
opleveren gaan naar de worker, de bedragen eerst.
De loonkosten zelf zijn een vuistregel (opgegeven uurloon maal uren, plus 8 procent
vakantiebijslag en 20 procent werkgeverslasten), geen wet. Het uurloon gaat
niet naar de engine: subsidie en voordeel gaan uit van het minimumloon. De regel eronder
noemt de engine- en corpusrevisie. Lukt de worker niet, dan staat er een
melding en geen bedrag: vooraf berekende waarden van de demo-kandidaat kunnen voor een andere
keuze te gunstig zijn.

Ook live: "Waarom deze uitkomst?" in elk paneel van de concept-aanvraag
(`_waarom.tsx`). De kern levert per output de afleiding in drie lagen: kort
(de beslissende voorwaarden en de berekening), de motivering per artikel en
de volledige afleiding stap voor stap met bron. Deterministisch, zonder
taalmodel; dat volgt Bos, Schuth en Chen, "From Rules as Executed to Citizen
Explanation" (JURIX 2026): expliciete beslissende voorwaarden houden de uitleg
trouw aan de uitvoering.

Daaronder de knop "Leg dit uit in gewone taal" (`_uitlegTaalmodel.tsx`): de
Graph-variant uit dat paper. Het portaal stuurt de beslisgraaf van de kern
(`afleiding.uitkomst`: uitkomst, voorwaarden voldaan of niet, gegevens,
wetsgrond) plus de korte samenvatting naar de dienst `/uitleg` van de
Digitale assistent (moza-poc-digitale-assistent, PDR-016) via
`/api/assistent/uitleg`, met de API-sleutel en het test-KVK uit het
Flags-paneel. Het prompt staat in de backend, niet hier. De dienst roept het
taalmodel aan zonder tools en toetst het antwoord tegen de graaf (bedragen,
percentages, wetsartikel, leesbaarheid); bij een afgekeurde toets toont het
portaal de tekst met de waarschuwing "wijkt af van de afleiding". De
afleiding erboven blijft de toetssteen. Zonder `ASSISTENT_BACKEND_URL`,
zonder sleutel, of op een backend die `/uitleg` nog niet kent, geeft de knop
een melding en verder niets. Gemeten op 20 oktober 2026 met Claude: beide
LKS-grafen in één aanroep van ruim duizend tokens, toets geslaagd, 61 tot 73
woorden, zinnen van gemiddeld 7 tot 8 woorden. Voor de gebruikerstest: dit is precies de vraag uit
het paper (begrijpelijk is niet hetzelfde als juridisch juist); vergelijk wat
deelnemers van de kale afleiding begrijpen met wat ze van de taalmodeltekst
begrijpen, en toets de taalmodeltekst zin voor zin aan de afleiding.

Ook zaak en besluit rekenen mee. De demo-bestanden per situatie
(`src/demo/iemand-aannemen-koen.json` voor de gemeente, `-wajong.json` en
`-wia.json`) bevatten datums, actoren en teksten; bedragen, percentages en uren
staan erin als sjabloon met plaatshouders: `{uren}`, `{loonwaarde}`,
`{lksPerMaand}`, `{lksTweeMaanden}`, `{aanspraakPerUur}` en `{lkvPerJaar}`;
de gegevens van de werkgever (`{onderneming}`, `{kvkNummer}`, `{vestiging}`,
`{fulltime}`, `{parttime}`, `{iban}`) komen uit de persona (`_werkgever.ts`).
`_route.ts` vult ze met `vulSjabloon` en `waardenVoor` uit de antwoorden en de
uitkomsten van de engine. Een uitkomst die de engine niet geeft, staat als
"—"; een onbekende plaatshouder blijft staan. `besluitGeldt` toont besluit en
toekenning alleen als de engine de regel van de situatie geeft (lks bij de
gemeente, ld bij Wajong). De vooraf berekende traces in
`iemand-aannemen-traces.json` zijn alleen nog de terugval zonder uitkomst.
Het verhaal van het besluit is uitgewerkt voor drie kandidaten, één per
volledige route.

Bundel vernieuwen (in regelrecht-uitleg, branch `feat/engine-live`):
`just bundel`, dan `uit/bundel/pkg` en de browserbestanden naar
`public/regelrecht/`. Daarna `node scripts/iemand-aannemen-basisfeiten.mjs` en
de testtabel.

## Draaien en controleren

```bash
npm ci
npm run dev                                 # of: npm run build && PORT=3100 npm start
node scripts/iemand-aannemen-schermen.mjs http://localhost:3100 /tmp/iemand-aannemen-beeld karin
```

Het script maakt schermafdrukken op 1280 en 390 van de route via de gemeente
en van Wajong, WIA, alleen het register en beschut werk (overzicht). Het meldt
consolefouten en horizontale scroll, en wacht per pagina tot de engine heeft
gerekend. De testtabel rekent de gevallen uit de
Uitkomstenkaart en de routes per situatie met dezelfde WASM-kern in Node (ruim twee minuten):
`node --test scripts/iemand-aannemen-uitkomsten.test.mjs`. CI: `npm run lint`, `npm run lint:css`,
`npm run type-check`, `npm run build`.

## Voor de onderzoeker

- Persona of onderneming wisselen: het Flags-paneel (persona), `?persona=<id>`
  of de keuze van de onderneming in de header. Elke persona heeft de aanvraag
  onder "Aanvragen die u nog moet versturen". Werkgever, KVK-nummer, vestiging,
  rekeningnummer en personeelsaantal volgen de actieve onderneming; de kandidaat
  en de gemeente van de loonkostensubsidie (Lansingerland, de woonplaats van de
  kandidaat) blijven. Bij een wissel begint het scenario opnieuw: de opslag
  onthoudt van welke persona en onderneming hij is (`_eigenaar.ts`), en
  `moza-iemand-aannemen` staat in de lijst van het persona-paneel.
- Op de zaakpagina van elke situatie: blok "Voor de onderzoeker" met het moment
  (per situatie eigen fasen; bij de gemeente ontvangen, gemeten, vastgesteld, besluit, antwoord, betaling; bij WIA de stand van de taak van de werknemer) en "Begin
  het scenario opnieuw".
- "Klopt dit niet?" op het besluit zet de vraag in de tijdlijn; het antwoord
  van de gemeente verschijnt bij het moment "Antwoord op uw vraag".

## Wat vastligt en wat niet

- Bedragen: loonkostensubsidie € 897,41 per maand bij loonwaarde 60 procent en
  32 uur (vergoeding werkgeverslasten in de grondslag van het 70-procentmaximum,
  letter van Pwet 10d lid 4; de vraag of de uitvoering afwijkt ligt bij UWV),
  loonkostenvoordeel banenafspraak € 1.680,64 per jaar.
- Het besluit is van het college; de engine onderbouwt.
- Loonwaarde 60 procent is een aangeleverd feit van het college
  (juristfeedback 24 en 25 september 2026).
- Toestemming van Koen als grondslag voor het gebruik van zijn gegevens is een
  aanname van het prototype.

## Bestanden

- Pagina's: `src/app/(public)/[personaId]/(portaal)/personeel/**`,
  `.../lopendezaken/iemand-aannemen/[situatie]/**` (zaak en besluit),
  `.../lopendezaken/loonkostensubsidie-koen/**` (doorverwijzing); `personeel/page.tsx` vervangt
  "binnenkort beschikbaar".
- Demo-data: `src/demo/iemandAannemen.ts`, `iemand-aannemen-koen.json`
  (gemeente), `-wajong.json`, `-wia.json`, `iemand-aannemen-traces.json` (alleen via `@/demo`).
- Route: `_route.ts` (situatieVan, routeVoor, vulSjabloon, waardenVoor,
  besluitGeldt, migreerZaken), `_useAannemen.ts` (opslag per situatie).
- Engine: `public/regelrecht/**`, `_useRegelrecht.ts`, `_engine.ts`,
  `_balans.tsx`, `_waarom.tsx`, `_uitlegTaalmodel.tsx`.
- Stijl: algemene classes uit `src/styles/rhc.css` (`rhc-mox-timeline`, `rhc-mox-highlight`, `rhc-mox-cluster`) en de componenten `TextBadge`, `InfoToggletip` en de RHC-`Accordion`. Geen eigen `mox-hiring-*`-classes.
- Aangepast: `_assistentZaken.ts` (route naar de zaak), `personaPaneel.tsx`
  (scenario wissen bij persona-wissel), `breadcrumb/index.tsx` (labels).

## Open punten

1. Gegevens per bron: vijf kaarten onder elkaar is lang op een telefoon.
2. "Waarom deze uitkomst?" komt uit de kern; de korte laag is nog
   ambtelijk ("het college heeft vastgesteld dat"). Is dat laag genoeg, of
   is de taalmodeltekst nodig, en klopt die dan nog?
3. De tijdlijn noemt Regelgeving, Besluit en Uitvoering; de termen lexogram,
   decretogram en executogram staan niet op het scherm.
4. Berichtenbox: ontvangstbevestiging en besluit staan nog niet als bericht.
5. De gegevens-stap toont de kop van elke organisatie als h1 (accordeon van het
   designsysteem); de pagina heeft dan zes h1's.
