# Ontwerp: na de oriëntatie per situatie (fase 2, v1)

Stand 25 oktober 2026, branch `feat/iemand-aannemen`. Bouwt voort op fase 1
(`ontwerp-orientatie-alle-uitkomsten-v1.md`): de oriëntatie rekent al elke
uitgangssituatie live met de regelrecht-engine. Afgestemde opzet:
https://claude.ai/artifact/2kUGz3tkpveoeEjrehbLXp (versie 2). Dit document is
leidend; de artifact is een samenvatting ervan.

## Waarom

Na "Aanvraag laten invullen" volgt elke werkgever nu één verhaal: een kandidaat
via de gemeente, met loonkostensubsidie, een zaak bij de gemeente en een besluit
van het college. Vinkt de werkgever Wajong of WIA aan, dan klopt wat volgt niet
meer: de aanvraag hoort bij een andere organisatie, of de werkgever hoeft niets
aan te vragen. Voor de gebruikerstest van half november moet de route na de
oriëntatie volgen wat de werkgever koos.

## Doelen

1. Na de oriëntatie volgt elke stap (gegevens, concept-aanvraag, indienen,
   verstuurd, zaak, besluit) de situatie uit de oriëntatie.
2. Per situatie ziet de werkgever, gebundeld per organisatie: wat naar de
   gemeente gaat, wat naar UWV gaat, wat via de loonaangifte loopt, wat vanzelf
   gaat, en wat de werknemer zelf moet aanvragen.
3. Volledig uitgewerkt tot en met het besluit: **via de gemeente (bijstand)**,
   **Wajong** en **WIA**. Korte route met een overzicht: **alleen
   doelgroepregister**. Uitlegpagina: **beschut werk**, **Wsw** en **geen van
   deze**. **Weet ik nog niet**: eerst de gegevens ophalen, dan de oriëntatie
   opnieuw.
4. Bedragen en uitkomsten in fase 2 komen uit dezelfde engine-berekening als de
   oriëntatie (`useUitkomsten`), niet uit vooraf berekende traces.

## Niet-doelen

- Geen nieuwe vragen in de oriëntatie (blijft vier vragen).
- Geen wijziging van regelrecht of het corpus.
- Geen echte koppeling met UWV of gemeente; indienen, behandeling en besluit
  blijven gesimuleerd, met het blok "Voor de onderzoeker" om de zaak door te
  laten lopen.

## Anti-doelen

- Te gunstig: een bedrag of recht tonen dat de werkgever niet krijgt.
- De werkgever laten indienen wat volgens de wet de werknemer aanvraagt.
- Situaties of stappen noemen naar een demo-kandidaat. Koppen, tests en
  code-identifiers heten naar de situatie ("via de gemeente", "Wajong", "WIA").
  Een kandidaat op het scherm mag een naam hebben waar een persoon nodig is.

## Welke situatie

Uit de vinkjes van vraag 1, in deze volgorde (eerste die past):

| Vinkjes bevatten | Situatie | Route |
|---|---|---|
| `wajong` | Wajong | volledig |
| `wia` | WIA | volledig |
| `bijstand` (zonder Wajong of WIA) | via de gemeente | volledig (de route van nu) |
| `register` | alleen doelgroepregister | overzicht |
| `beschut`, `wsw`, `geen` | uitleg | uitlegpagina |
| `weetniet` of leeg | weet niet | gegevens ophalen, terug naar de oriëntatie |

Wajong gaat voor WIA: wie beide heeft, krijgt de voorzieningen via de Wajong
(WIA 35 lid 4 a) en de loondispensatie via UWV. Bij WIA + register telt het
hoogste loonkostenvoordeel (fase 1); de route is die van WIA.

## Wie vraagt wat aan (letter van de wet)

| Regeling | Uitvoerder | Wie vraagt aan | Grond |
|---|---|---|---|
| Loonkostensubsidie | gemeente | werkgever | Pwet 10d |
| Proefplaatsing, begeleiding | gemeente | werkgever (met de gemeente) | Pwet 8a, 10da |
| Loondispensatie | UWV | werkgever of werknemer | Wajong 2:20 lid 1; Besluit loondispensatie Wajong 1, 2, 3, 5 |
| Voorzieningen (jobcoach, werkplek) bij Wajong | UWV | de werknemer (jonggehandicapte) | Wajong 2:22 |
| Voorzieningen bij WIA | UWV | de werknemer | WIA 35 lid 1 |
| Doelgroepverklaring | UWV | de werknemer, binnen drie maanden na aanvang; de werkgever bewaart hem bij de loonadministratie | Wtl 2.7 lid 1 en 3 |
| Loonkostenvoordeel | UWV, via de loonaangifte | werkgever, in de loonaangifte | Wtl 2.1 |
| No-riskpolis, doelgroepregister | UWV | vanzelf | ZW 29b; Wfsv 38b |

Wat de werknemer aanvraagt, staat bij de werkgever als **taak voor de
werknemer**: uitleg, termijn, en de stand als de werknemer het heeft gedaan. De
werkgever dient het niet in.

## Per situatie

### Via de gemeente (bijstand) — volledig

De route van nu, met één verschil: de bedragen komen uit `useUitkomsten` met de
antwoorden van de oriëntatie. Gegevens: UWV (register), gemeente (bijstand),
KVK, Belastingdienst, eigen opgave. Aanvraag bij de gemeente:
loonkostensubsidie, en desgewenst jobcoach en proefplaatsing. Loonaangifte:
loonkostenvoordeel. Vanzelf: no-riskpolis. Zaak en besluit: van het college,
zoals nu.

### Wajong — volledig

- Gegevens: UWV (Wajong-recht met arbeidsondersteuning, doelgroepregister), KVK,
  Belastingdienst, eigen opgave. Geen gemeente.
- Aanvraag bij UWV: loondispensatie, met het percentage uit vraag 3 als
  schatting ("UWV stelt het percentage vast"), uren, functie, aanvang.
- Taak voor de werknemer: jobcoach of werkplek aanvragen bij UWV (Wajong 2:22).
- Loonaangifte: loonkostenvoordeel banenafspraak. Vanzelf: no-riskpolis, zonder
  einddatum.
- Zaak bij UWV: ontvangen → arbeidsdeskundig onderzoek op de werkplek →
  percentage vastgesteld → besluit van UWV (loondispensatie voor de verwachte
  periode, ten hoogste vijf jaar; aanspraak = minimumloon per uur × percentage).
  "Klopt dit niet?" zoals bij het besluit van nu.

### WIA — volledig

- Gegevens: UWV (WIA-uitkering in de maand vóór aanvang), KVK, Belastingdienst,
  eigen opgave.
- Geen aanvraag door de werkgever.
- Taak voor de werknemer: doelgroepverklaring aanvragen bij UWV binnen drie
  maanden na aanvang, nodig voor het loonkostenvoordeel arbeidsgehandicapte
  (€ 3,05 per uur, ten hoogste € 6.000, drie jaar). Daarnaast desgewenst jobcoach
  of werkplek (WIA 35).
- Loonaangifte: het loonkostenvoordeel, zodra de doelgroepverklaring er is.
  Vanzelf: no-riskpolis, vijf jaar.
- Zaak: de doelgroepverklaring. Werknemer vraagt aan → UWV verstrekt de
  verklaring → werkgever bewaart hem bij de loonadministratie. Een weigering
  krijgt alleen de werknemer (Wtl 2.7 lid 1); de werkgever ziet dan alleen dat
  er geen verklaring is.

### Alleen doelgroepregister — overzicht

Geen aanvraag. Een overzichtspagina: het loonkostenvoordeel in de loonaangifte
(hoe en wanneer), de no-riskpolis die vanzelf geldt, en de (i) van de
oriëntatie ("via de gemeente kan ook loonkostensubsidie gelden").

### Beschut werk, Wsw, geen van deze — uitlegpagina

Wat er voor deze situatie geldt en wat niet, met de (i)-teksten van de
oriëntatie. Bij beschut werk: de gemeente regelt de beschutte werkplek; neem
contact op met de gemeente. Geen aanvraag in het portaal.

### Weet ik nog niet

De stap gegevens haalt met toestemming van de kandidaat op wat UWV en de
gemeente weten. Daarna gaat de werkgever terug naar de oriëntatie, met de
vinkjes ingevuld op basis van die gegevens. In het prototype blijkt de
kandidaat via de gemeente te gaan (bijstand, in het register) *(keuze van het
ontwerp: de meest voorkomende situatie)*.

## Keuzes van het ontwerp (na de bouwerscheck)

- **Zaak en besluit rekenen mee met de oriëntatie** *(keuze van het ontwerp)*.
  Bedragen, percentages en uren in de tijdlijn en het besluit komen uit de
  engine met de antwoorden van de oriëntatie; teksten in de demo-bestanden
  worden sjablonen met plaatshouders zoals `{loonwaarde}`, `{uren}`,
  `{lksPerMaand}`. Datums en actoren blijven vast. Ook "Waarom deze uitkomst?"
  bij het besluit rekent live. Zo zegt de tijdlijn nooit iets anders dan het
  besluit.
- **Panelen volgen de uitkomst van de engine, niet alleen de situatie**
  *(keuze van het ontwerp)*. Geeft de engine geen recht (bijvoorbeeld Wajong met
  loonwaarde 100, of loondispensatie niet meegeteld bij een uurloon boven het
  minimumloon), dan is er geen paneel en geen indienen voor die regeling. Blijft
  er niets over om in te dienen, dan volgt de route het overzicht (zoals alleen
  doelgroepregister), met een zin waarom: "Bij deze antwoorden is er niets aan te
  vragen." Geen afwijzend besluit.
- **Eén zaak per situatie, ook zonder indienen door de werkgever** *(keuze van
  het ontwerp)*. Bij WIA maakt "Klaar" de zaak "Doelgroepverklaring" aan in
  Lopende zaken, met als eerste stand "wacht op de aanvraag van de werknemer";
  het blok "Voor de onderzoeker" laat de werknemer aanvragen en UWV verstrekken.
  Taken van de werknemer voor jobcoach of werkplek zijn geen eigen zaak, alleen
  een stand bij de taak. De opslag krijgt per situatie een eigen fasenreeks;
  `FASEN` in `_useAannemen.ts` wordt per situatie.
- **Werkplekaanpassing via de gemeente blijft** zoals nu, als voorziening van
  het college (Pwet 10). De opsomming bij "via de gemeente" is niet uitputtend:
  de drie keuzes van nu (jobcoaching, werkplekaanpassing, proefplaatsing)
  blijven.

## Scherm per stap

- **Gegevens** (`gegevens/_bronnen.tsx`): bronnen per situatie; alleen de
  organisaties die iets weten over deze situatie. Kandidaat kiezen en
  toestemming blijven.
- **Concept-aanvraag** (`concept-aanvraag/_aanvraag.tsx`): gegroepeerd per
  organisatie. Panelen alleen voor wat de werkgever zelf indient, met "Ik heb dit
  gecontroleerd" en "Waarom deze uitkomst?". Daaronder "Taken voor de
  werknemer" en "Gaat vanzelf / via de loonaangifte". Teller "Gecontroleerd n
  van N" telt alleen de panelen.
- **Indienen** (`indienen/_indienen.tsx`): per organisatie wat erheen gaat.
  Zonder paneel (WIA, register) is er geen indienen; de knop wordt "Klaar" en
  leidt naar het overzicht of de zaak.
- **Verstuurd**: per organisatie een bevestiging en een link naar de zaak.
- **Zaak en besluit**: per situatie eigen fasen, gebeurtenissen en besluit.
  Route `/lopendezaken/iemand-aannemen/[situatie]` met `/besluit`;
  `/lopendezaken/loonkostensubsidie-koen` verwijst naar
  `/lopendezaken/iemand-aannemen/via-gemeente`.
- De korte balans in de concept-aanvraag rekent met de situatie (niet meer
  vast met bijstand); de (i) "de aanvraag is uitgewerkt voor één kandidaat"
  vervalt.

## Gegevens per situatie

Per situatie een demo-bestand naast `src/demo/iemand-aannemen-koen.json`, met
dezelfde vorm (`DemoAannemen`): kandidaat, dienstverband, zaak, bronnen,
fasen, gebeurtenissen, komtHierna, labels. Het bestaande bestand wordt de
situatie via de gemeente. `regelingen` en `berekeningLks` vervallen voor de
nieuwe situaties; die komen uit de engine. Uitkomsten in een besluit (percentage
loondispensatie, aanspraak per uur, doelgroepverklaring ja/nee) rekent de engine
met de antwoorden van de oriëntatie; het percentage dat "UWV vaststelt" is de
waarde van vraag 3.

## Controle

- Uitbreiding van `scripts/iemand-aannemen-uitkomsten.test.mjs`: de
  situatiebepaling (tabel hierboven, inclusief Wajong + WIA en WIA + register)
  en per situatie welke panelen, taken en vanzelf-regels er zijn.
- Een browserrun per route (via de gemeente, Wajong, WIA, register, uitleg,
  weet niet) van oriëntatie tot en met besluit of eindpagina, op 1280 en 390,
  zonder consolefouten.

## Wat de bouwer zelf beslist

- De bestandsnamen van de demo-bestanden en hoe de situatie wordt doorgegeven
  (opslag, route).
- De precieze teksten, op B1, in het ambtelijk register, zonder "niet X maar
  Y"-zinnen.
- Welke bestaande componenten worden hergebruikt of opgesplitst.

## Afstempunten

- Doelgroepverklaring, voorzieningen Wajong 2:22 en WIA 35: de wet laat de
  werknemer aanvragen. Of UWV in de praktijk een aanvraag van de werkgever
  namens de werknemer aanneemt, staat niet in de wet; het prototype volgt de
  letter. Voor de jurist.
- Termijnen voor het besluit van UWV over loondispensatie staan niet in het
  corpus; de tijdlijn van de zaak gebruikt aannames, aangegeven met een (i).
