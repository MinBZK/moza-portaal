# Iemand aannemen (Digitale assistent 2.0)

Stand 20 oktober 2026, branch `feat/iemand-aannemen` vanaf `ux-fork`. Voor het
gebruikersonderzoek van half november 2026 (usecase Financieel CV). De
regelrecht-engine rekent live in de browser.

## Wat het is

Negen pagina's onder Personeel en Lopende zaken, naar de flow van het prototype vooringevulde-aanvraag (KVK-versie): eerst drie korte vragen met sliders, dan de aanvraag, voor de persona die in het
portaal actief is (standaard `karin`, Kwekerij De Bloesem, gemeente
Lansingerland). Eén kloppend verhaal: de ondernemer neemt Koen de Wit aan,
32 uur tegen het minimumloon vanaf 1 oktober 2026. Elke gebeurtenis met datum,
actor en wetsgrond staat in `verhaallijn-koen-v1.md` (in deze map).

| Pad | Wat de deelnemer doet |
|---|---|
| `/personeel` | Start "Iemand aannemen"; na het indienen staat de zaak hier |
| `/personeel/iemand-aannemen` | Drie korte vragen (wie, uren als slider, zelfstandig met loonwaarde-slider); rechts live "Uw kosten per jaar": loonkosten min loonkostensubsidie en loonkostenvoordeel uit de engine; de overige regelingen; "Aanvraag laten invullen" |
| `/personeel/iemand-aannemen/gegevens` | Aanvraag laten invullen: namens wie, de kandidaat (Koen, met toestemming), per bron (UWV, gemeente, KVK, Belastingdienst, eigen opgave) de gegevens, de datum en de wetsvraag; vinkje per bron |
| `/personeel/iemand-aannemen/concept-aanvraag` | De vooringevulde aanvraag: per regeling een paneel met gegevens en bron, "Waarom deze uitkomst?", keuzes (jobcoaching, werkplekaanpassing, proefplaatsing), "Ik heb dit gecontroleerd"; Gecontroleerd n van 6; rechts "Wat dit u oplevert" live |
| `/personeel/iemand-aannemen/indienen` | Controleren en indienen: wat naar de gemeente gaat, wat vanzelf geldt, wat later komt, wat niet; bevestiging; Indienen |
| `/personeel/iemand-aannemen/verstuurd` | Bevestiging, link naar de zaak |
| `/lopendezaken` | De zaak staat in het overzicht (via de opslag die ook de Digitale assistent gebruikt) |
| `/lopendezaken/loonkostensubsidie-koen` | Voortgang (status-track), alles wat is vastgelegd (tijdlijn met correctie), komt hierna |
| `/lopendezaken/loonkostensubsidie-koen/besluit` | Besluit van het college, dezelfde berekening als vooraf, "Waarom" met engine-stappen, "Klopt dit niet?" |

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

Wat live is: op het eerste scherm en in de zijkolom van de aanvraag rekent de
engine loonkostensubsidie (Participatiewet 10d) en loonkostenvoordeel (Wtl
2.10) bij elke wijziging van de antwoorden: uren, loonwaarde, zelfstandig.
De loonkosten zelf zijn een vuistregel (uurloon maal uren, plus 8 procent
vakantiebijslag en 20 procent werkgeverslasten), geen wet. De regel eronder
noemt de engine- en corpusrevisie. Lukt de worker niet, dan blijven de vooraf
berekende waarden staan (`src/demo/iemand-aannemen-traces.json`, uit een
TRACE-run van de BDD-suite) met de melding waarom.

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

Nog niet live: het besluit en de bedragen van de overige regelingen
(no-riskpolis, begeleiding, proefplaatsing, loondispensatie) tonen de vooraf
berekende traces. Zelfde engine, zelfde corpus; alleen nog niet aangesloten.

Bundel vernieuwen (in regelrecht-uitleg, branch `feat/engine-live`):
`just bundel`, dan `uit/bundel/pkg` en de browserbestanden naar
`public/regelrecht/`.

## Draaien en controleren

```bash
npm ci
npm run dev                                 # of: npm run build && PORT=3100 npm start
node scripts/iemand-aannemen-schermen.mjs http://localhost:3100 /tmp/iemand-aannemen-beeld karin
```

Het script maakt per pagina schermafdrukken op 1280 en 390, meldt
consolefouten en horizontale scroll, en wacht op "Wat het oplevert" tot de
engine heeft gerekend. CI: `npm run lint`, `npm run lint:css`,
`npm run type-check`, `npm run build`.

## Voor de onderzoeker

- Persona wisselen: het Flags-paneel (persona) of `?persona=<id>`. Werkgever,
  KVK-nummer, vestiging, rekeningnummer en personeelsaantal volgen de persona;
  Koen en de gemeente van de loonkostensubsidie (Lansingerland, zijn
  woonplaats) blijven. Bij een wissel begint het scenario opnieuw
  (`moza-iemand-aannemen` staat in de lijst van het persona-paneel).
- Op de zaak- en besluitpagina: blok "Voor de onderzoeker" met het moment
  (ontvangen, gemeten, vastgesteld, besluit, antwoord, betaling) en "Begin
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
  `.../lopendezaken/loonkostensubsidie-koen/**`; `personeel/page.tsx` vervangt
  "binnenkort beschikbaar".
- Demo-data: `src/demo/iemandAannemen.ts`, `iemand-aannemen-koen.json`,
  `iemand-aannemen-traces.json` (alleen via `@/demo`).
- Engine: `public/regelrecht/**`, `_useRegelrecht.ts`, `_engine.ts`,
  `_balans.tsx`, `_waarom.tsx`, `_uitlegTaalmodel.tsx`.
- Stijl: classes `mox-hiring-*` in `src/styles/mox.css`.
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
5. Live rekenen voor de overige regelingen en het besluit.
