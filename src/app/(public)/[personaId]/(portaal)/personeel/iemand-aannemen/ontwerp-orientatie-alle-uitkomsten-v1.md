# Ontwerp: oriëntatie rekent elke uitkomst (v1)

Stand 25 oktober 2026, branch `feat/iemand-aannemen`. Fase 1 van twee: de
oriëntatie. Fase 2 (gegevens, concept-aanvraag, indienen, besluit per
situatie) volgt daarna en valt hier buiten.

## Waarom

De oriëntatie op `/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt`
(component `_vragen.tsx` met `_balans.tsx`) rekent nu voor elke keuze alsof de
kandidaat Koen is: Participatiewet, doelgroepregister via grond a. De engine
krijgt de feiten uit Koens trace (`src/demo/iemand-aannemen-traces.json`) met
alleen uren en loonwaarde overschreven. Daardoor klopt de uitkomst niet voor
Wajong, WIA, Wsw, beschut werk en de andere routes naar het register, en valt
het loonkostenvoordeel bij een loonwaarde van 100 procent ten onrechte weg.

De werkgever moet voor elke uitgangssituatie uit de **Uitkomstenkaart
Financieel CV** (https://claude.ai/artifact/A8hP2bFR9fgEWVydKxPtUZ, doorsnede
en beslisboom) een kloppende oriëntatie krijgen, berekend door de
regelrecht-engine in de browser. Dekking per situatie, zoals afgestemd:
https://claude.ai/artifact/LhN7eNkDA3ZNBnkit15SLP.

## Doelen

1. Voor elke uitgangssituatie van de kaart geeft de oriëntatie de uitkomsten
   die de kaart noemt, voor alle acht regelingen: loonkostensubsidie (Pwet
   10d), loondispensatie (Wajong 2:20), doelgroepregister (Wfsv 38b),
   loonkostenvoordeel (Wtl), no-riskpolis (ZW 29b), proefplaatsing (Pwet 8a,
   WW 76a, WIA 37, Wajong 2:24), voorzieningen (WIA 35) en begeleiding (Pwet
   10da).
2. Alle uitkomsten komen live uit de regelrecht-engine. De vooraf berekende
   traces blijven alleen als terugval als de worker niet start (zoals nu).
3. Combinaties van vinkjes rekenen mee volgens de doorsnede: een werknemer
   kan in meer rijen vallen; dan gelden de uitkomsten van elke rij, met de
   uitsluitingen die de kaart noemt. Bij samenloop van loonkostenvoordeel telt
   de hoogste (Wtl 4.1 lid 3).

## Niet-doelen

- Geen extra vragen of vervolgvragen. De vier vragen blijven.
- Fase 2 (de stappen na de oriëntatie) blijft Koens verhaal.
- Geen nieuwe wetten of modellen; regelrecht wordt niet gewijzigd. Ontbreekt
  er iets in de engine, dan wordt dat genoteerd als vraag, niet opgelost.

## Anti-doelen (dan is het mislukt, ook als het werkt)

- **De oriëntatie rekent te gunstig.** Liever te zuinig met een (i) dan een
  bedrag dat de werkgever niet krijgt.
- De vragen worden complexer: meer vragen, vervolgvragen of uitleg die nodig
  is om ze te beantwoorden.
- Een uitkomst die afwijkt van de letter van de wet of van de kaart.

## De vier vragen (vastgesteld)

1. **Wie wilt u aannemen? Kies wat past.** Vinkjes, acht opties:
   - Iemand uit het doelgroepregister (banenafspraak)
   - Iemand met een Wajong-uitkering (vinkt het register aan en zet het vast, zoals nu)
   - Iemand met een WIA-uitkering (was: WIA- of WAO-uitkering; WAO gaat naar de (i) bij "Geen van deze")
   - Iemand met een bijstandsuitkering
   - **nieuw:** Heeft een Wsw-indicatie of werkt in de sociale werkvoorziening
   - **nieuw:** Is door de gemeente aangewezen op beschut werk
   - Geen van deze
   - Weet ik nog niet

   "Geen van deze" en "Weet ik nog niet" sluiten de rest uit (zoals nu).
   Beschut werk sluit het register uit (Wfsv 38b lid 1, aanhef): bij dat
   vinkje kan het register niet aan, en omgekeerd; Wajong en beschut werk
   samen kan dus ook niet. De exacte labeltekst van de twee nieuwe opties mag
   de bouwer op B1 bijschaven.
2. **Uren per week**, 8 tot 40 (ook verloonde uren per jaar = uren × 52).
3. **Hoeveel kan de kandidaat?**, 30 tot 100 procent. Eén slider; de
   betekenis volgt de situatie: bij de gemeente de loonwaarde (Pwet 10d), bij
   Wajong het percentage voor loondispensatie (Besluit loondispensatie Wajong
   art. 3). De uitleg onder de slider zegt welke betekenis geldt.
4. **Bruto uurloon**, vanaf het minimumloon; alleen voor de loonkosten.

## Aannames, getoond met een (i)

Waar de berekening een aanname doet, staat bij de uitkomst een (i) die de
aanname in gewone taal noemt. Geen vervolgvraag. Vastgesteld:

- **Participatiewet:** gerekend met lid 4 (loonwaarde vooraf vastgesteld).
  De (i) noemt wat lid 5 geeft als de vaststelling pas na de start komt: de
  eerste zes maanden 50 procent, bij voltijd € 1.577,48 per maand, naar rato
  van de uren.
- **WIA:** gerekend als nieuwe werkgever (Wtl 2.6, drie jaar). De (i) noemt
  herplaatsen bij de eigen werkgever (Wtl 2.14, één jaar).
- **Geen van deze:** een (i) dat bij een WIA-keuring onder 35 procent, een
  WAO-uitkering of een WW-uitkering een no-riskpolis, loonkostenvoordeel of
  een proefplaatsing kan gelden.

Komt de bouwer een andere situatie tegen waar een feit uit de vragen niet af
te leiden is, dan: een aanname kiezen die nooit te gunstig uitvalt, een (i)
erbij, en het noteren in de lijst open punten.

## Van antwoorden naar feiten voor de engine

Vandaag: `invoerVan` in `_engine.ts` neemt Koens `gegevens` en overschrijft
uren, loonwaarde en `kan_minimumloon_niet_verdienen`. Nieuw: per vinkje een
vaste set feiten die de route in de engine opent, op een neutrale basis waarin
alle routes dicht staan. Richting, niet uitputtend (de parameternamen staan in
de machine_readable-blokken in `public/regelrecht/wetten.json`):

| Vinkje | Feiten |
|---|---|
| Register | in het register via de blijfgrond (38b lid 6: eerder arbeidsbeperkte, registratie loopt nog). Zo hangt het loonkostenvoordeel niet van de loonwaarde af. |
| Wajong | `heeft_wajong_arbeidsondersteuning_of_uitkering` = waar; loondispensatie-feiten uit vraag 3 (percentage) en het uurloon |
| WIA | WIA-recht in de maand vóór aanvang, nieuwe werkgever |
| Bijstand | Pwet-doelgroep (7 lid 1 a), loonwaarde uit vraag 3, kan WML niet verdienen als loonwaarde onder 100 |
| Wsw | Wsw-indicatie; dienstbetrekking art. 2 zonder detachering (zuinigste lezing: geen loonkostenvoordeel, geen no-riskpolis) |
| Beschut werk | college heeft vastgesteld: uitsluitend beschut werk; dienstbetrekking beschut werk |
| Geen / weet niet | alle routes dicht |

"Weet ik nog niet" rekent als nu: met een (i) "als de kandidaat in het
doelgroepregister staat", maar dan via de blijfgrond, zodat het niet afhangt
van de loonwaarde.

Wsw: de kaart onderscheidt Wsw-indicatie (wel loonkostenvoordeel en
no-riskpolis lid 2 b/d) van een Wsw-dienstbetrekking art. 2 zonder
detachering (geen van beide). Omdat te gunstig rekenen niet mag, rekent de
oriëntatie met de zuinige lezing en noemt de (i) dat bij een indicatie zonder
Wsw-dienstbetrekking het loonkostenvoordeel en de no-riskpolis wel kunnen
gelden.

## Combinaties en uitsluitingen (keuzes bij het ontwerp)

Deze keuzes volgen uit de doorsnede van de kaart (bijlage) en het anti-doel
"nooit te gunstig". Ze staan hier als keuze van het ontwerp, zodat de
opdrachtgever ze kan nalopen.

- **Loonkostensubsidie alleen met het vinkje bijstand.** Wie een
  UWV-uitkering heeft (Wajong, WIA, WW) valt niet onder de Pwet-doelgroep
  (Pwet 7 lid 3 c); Wajong + bijstand of WIA + bijstand geeft dus geen
  loonkostensubsidie. Volg wat de engine daarvoor geeft; `behoort_tot_doelgroep_lks`
  en de oordelen van het college zijn aangeleverde feiten en gaan alleen
  open bij het vinkje bijstand.
- **Beschut werk zonder bijstand: geen loonkostensubsidie.** De kaart noemt
  loonkostensubsidie bij beschut werk "mogelijk". Zonder het vinkje bijstand
  rekent de oriëntatie zonder, met een (i) dat de gemeente
  loonkostensubsidie kan geven. Beschut werk + bijstand: wel, met de
  loonwaarde uit vraag 3.
- **"Weet ik nog niet": alleen het register via de blijfgrond.** Dus
  loonkostenvoordeel banenafspraak en no-riskpolis lid 2 e, geen
  loonkostensubsidie. Een (i) noemt dat er via de gemeente ook
  loonkostensubsidie kan gelden. Dit wijkt af van vandaag (toen rekende "weet
  ik nog niet" met Koens bijstandsfeiten en dus met loonkostensubsidie).
- **Aanvragen en verzoeken.** De oriëntatie gaat ervan uit dat de werkgever
  de nodige aanvragen doet (verzoek loonkostenvoordeel in de loonaangifte,
  doelgroepverklaring Wtl 2.7, aanvraag loondispensatie, toestemming
  proefplaatsing). Dat is geen (i) per regel, maar één zin onder de balans:
  "De bedragen gelden als u de regelingen aanvraagt."
- **Wajong: voorzieningen via Wajong 2:22.** WIA 35 sluit Wajong uit (lid 4
  a); jobcoaching en werkplekaanpassing komen dan uit Wajong 2:22 en staan
  bij "Regelingen die verder kunnen gelden".
- **Fase 2 tot de herziening.** De concept-aanvraag en de stappen daarna
  blijven Koens verhaal. De korte balans daar (`<Balans … kort />`) rekent
  met Koens situatie (bijstand) en de antwoorden op uren, loonwaarde en
  uurloon, niet met de vinkjes. Is de keuze in de oriëntatie niet Koens
  situatie, dan staat bij "Aanvraag laten invullen" een (i) dat het
  prototype de aanvraag uitwerkt voor een kandidaat via de gemeente.

## Wat het scherm toont

"Wat de regelingen opleveren" (`_balans.tsx`) blijft de balans: loonkosten
min wat er terugkomt, wat er voor rekening van de werkgever blijft. Nieuw:

- Regels in de balans zijn de regelingen met een bedrag die voor de keuze
  gelden: loonkostensubsidie, loondispensatie (het verschil met het
  minimumloon per jaar, als bedrag dat de werkgever minder betaalt) en
  loonkostenvoordeel (met de categorie: banenafspraak, arbeidsgehandicapte).
  Regelingen zonder recht staan er niet in.
- Elke regel met een aanname krijgt de (i).
- "Regelingen die verder kunnen gelden" komt uit de engine in plaats van uit
  Koens demo-data: no-riskpolis (met duur: vijf jaar of zonder einde),
  proefplaatsing (welke wet, hoe lang), begeleiding, voorzieningen WIA 35.
- De bron-regel onder de balans (engine- en corpusrevisie) blijft.

De bouwer kiest de vorm van de (i) (Toggletip uit RHC ligt voor de hand) en de
precieze opmaak, binnen de bestaande RHC/MOx-classes.

## Controle

Elke rij van de doorsnede in de kaart wordt een geval in een testtabel
(vinkjes, uren, loonwaarde, uurloon → verwachte uitkomst per regeling, met de
bedragen van peildatum 1 juli 2026). Ten minste: Koen (bijstand, 60 procent,
32 uur: LKS € 897,41 per maand, LKV € 1.680,64), Sadee (Wajong, 70 procent:
loondispensatie € 10,49 per uur), register op 100 procent (LKV blijft),
WIA (€ 3,05 per uur, max € 6.000), Wsw, beschut werk (geen LKV), geen van
deze, en twee combinaties (register + bijstand; WIA + register: hoogste LKV).
De tabel draait tegen de echte worker in de browser (zoals
`scripts/iemand-aannemen-schermen.mjs`). Een uitkomst die afwijkt van de kaart
is een fout, tenzij het een gedocumenteerde aanname met (i) is.

## Wat de bouwer zelf beslist

- Of de feiten per vinkje in een tabel in code, in de demo-data of in een
  eigen bestand staan.
- Hoe de engine per regeling wordt aangeroepen (één aanroep per wet of
  gebundeld), zolang het binnen de bestaande worker en `useBerekening` past.
- De exacte teksten van de (i)'s, op B1, ambtelijk register, zonder
  "niet X maar Y"-zinnen.

## Open punten

- De parameters bestaan in de gepinde corpusversie (`42054d7d`), nagelopen op
  25 oktober: blijfgrond `was_arbeidsbeperkte_lid_1_of_2` met
  `registratie_nog_niet_geeindigd`, `had_wia_recht_maand_voor_aanvang`,
  `is_wsw_geindiceerd_of_oude_indicatie`,
  `verricht_wsw_arbeid_artikel_2_zonder_terbeschikkingstelling`. De hoogste
  tegemoetkoming bij samenloop zit al in Wtl 2.1 (`categorie_lkv`).
- De kaart is van 11 oktober (branch `traject/financieel-cv-0bc401e0`); de
  bundel is gepind op `42054d7d`. Wijken ze af, dan geldt de bundel en wordt
  het verschil gemeld.

## Bijlage: doorsnede uit de Uitkomstenkaart (11 oktober 2026)

Letterlijk overgenomen; per uitgangssituatie wat het model geeft. Een werknemer kan in meer rijen vallen.

| Uitgangssituatie werknemer | Loonkostensubsidie | Loondispensatie | Doelgroepregister | Loonkostenvoordeel | No-riskpolis | WIA 35 | Proefplaatsing |
|---|---|---|---|---|---|---|---|
| Pwet-doelgroep LKS , loonwaarde onder WML | ja: lid 1 of lid 2; lid 4, of eerst lid 5 | geen (geen Wajong) | grond a pwet_lks_uwv_loonwaarde | banenafspraak, € 1,01 per uur | lid 2 e, zonder einde | lid 4 b: niet, college is aan zet | Pwet 8a, 2 + 4 maanden (bij bijstand) |
| Pwet-toegeleid, UWV: kan WML niet verdienen (op verzoek college of eigen verzoek) | alleen als ook doelgroep LKS | geen | grond a of e | banenafspraak | lid 2 e (aanvang vanaf 2015) | lid 4 b | Pwet 8a |
| Wajong , arbeidsondersteuning of AO-uitkering | geen (geen Pwet-doelgroep) | ja bij zes voorwaarden: € 14,99 × percentage | grond c wajong; bij duurzaam geen mogelijkheden alleen met dienstbetrekking | banenafspraak | lid 2 a, zonder einde; lid 2 c als vóór achttien in dienst | lid 4 a: Wajong gaat voor | geen (geen WW) |
| WIA: IVA of WGA | geen | geen | alleen grond g (WGA met experiment loondispensatie) | arbeidsgehandicapte € 3,05, drie jaar; of herplaatsen, één jaar | lid 1 a, vijf jaar; lid 4 bij voortzetting, vijf jaar na vaststelling | jobcoaching en werkplekaanpassing boven de drempel | geen (geen WW) |
| WIA-afwijzing onder 35 procent | geen | geen | geen grond | geen (geen WIA-uitkering) | lid 1 b, vijf jaar | bij structurele beperking | geen |
| Wsw: indicatie of dienstbetrekking | uitgesloten, lid 3 | uitgesloten (Wsw-werknemer) | grond b wsw | banenafspraak, behalve Wsw art. 2 zonder detachering | lid 2 b of d zonder einde; lid 8 sluit uit bij Wsw-dienstbetrekking art. 2 | geen (Wsw) | geen |
| Beschut werk: college stelt vast uitsluitend beschut | mogelijk (10d sluit beschut niet uit) | geen | uitgesloten door de aanhef van lid 1 | geen banenafspraak; 2.6 en 2.14 sluiten beschut uit | lid 2 f, zonder einde | lid 4 b | Pwet 8a |
| Uit vso of praktijkonderwijs, gemeld bij UWV | lid 2 c als zonder startkwalificatie | geen | grond d amvb_38b_1_d | banenafspraak | lid 2 e; of lid 1 c/d, vijf jaar, als niet onder e | lid 4 b als Pwet; anders mogelijk | afhankelijk van bijstand of WW |
| Jonggehandicapt naar oordeel UWV (38b lid 2, zonder Wajong) | geen tenzij Pwet | geen | lid 2 jonggehandicapt_uwv_oordeel | banenafspraak | lid 2 e | mogelijk | afhankelijk |
| Overgangsrecht: b of c op of na 1 januari 2013, niet meer op 1 mei 2015 | geen | geen | grond f overgangsrecht_38b_1_f | banenafspraak | lid 2 e | mogelijk | geen |
| Eerder arbeidsbeperkte, registratie loopt nog | onveranderd | onveranderd | lid 6 blijfgrond_38b_6 | banenafspraak | lid 2 e | onveranderd | onveranderd |
| WW-gerechtigde | geen (tenzij ook Pwet) | geen | geen grond uit de WW | geen | geen | geen | WW 76a: zes maanden plus ziektedagen, uitkering blijft |
| Geen van deze | geen | geen | geen | geen | geen | geen | geen |
