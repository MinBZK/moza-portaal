# Verhaallijn Koen, versie 1 (20 oktober 2026)

Eén kloppende tijdlijn voor de usecase "iemand aannemen met afstand tot de
arbeidsmarkt", als basis voor het prototype Digitale assistent 2.0 in de
MoZa-proeftuin. Elke gebeurtenis heeft een datum, een actor, een wetsgrond en
het scherm waar de ondernemer hem ziet. De bedragen komen uit de huidige
corpus (branch `traject/financieel-cv-0bc401e0`, peildatum 1 juli 2026);
de engine rekent met de wetsversies van 2026-07-01.

Bron voor het bedrijf: de proeftuin-persona `bloemenkweker`
(`_data/personas.json`). Bron voor Koen: `financieel_cv_koen.feature` in de
corpus, met de leeftijd en het loon daaruit.

## Wie

| | |
|---|---|
| Ondernemer | Robin Vogel, vennoot van Kwekerij De Bloesem (vof, KVK 62345681), Hoefweg 210, Bleiswijk, gemeente Lansingerland; 5 fulltime en 2 parttime medewerkers |
| Kandidaat | Koen de Wit, 42 jaar (geboren 15 maart 1984), woont in Bergschenhoek (gemeente Lansingerland), algemene bijstand van de gemeente, sinds 3 november 2025 in het doelgroepregister banenafspraak |
| Dienstverband | kweker-medewerker, 32 uur per week, wettelijk minimumloon (€ 14,99 per uur per 1 juli 2026), vanaf 1 oktober 2026, onbepaalde tijd |
| Organisaties | Gemeente Lansingerland (loonkostensubsidie, begeleiding op de werkplek, proefplaatsing), UWV (doelgroepregister, no-riskpolis), Belastingdienst (loonkostenvoordeel via de loonaangifte) |

## Wat vastligt vóór Robin begint

| Datum | Actor | Gebeurtenis | Soort | Grond | Bron in de cel van |
|---|---|---|---|---|---|
| 1 juli 2026 | Wetgever | Wetsversies 2026-07-01 van Participatiewet, Wfsv, Ziektewet, Wtl, Wet minimumloon gelden; WML € 2.337,00 per maand, € 14,99 per uur | lexogram | Regeling indexatie WML | corpus |
| 3 november 2025 | UWV | Koen opgenomen in het doelgroepregister banenafspraak | decretogram | Wfsv 38b lid 1 a (het college heeft vastgesteld dat Koen niet in staat is het minimumloon te verdienen) | UWV |
| doorlopend | Gemeente Lansingerland | Koen ontvangt algemene bijstand en valt onder de ondersteuning van het college | decretogram | Pwet 7 lid 1 a | gemeente |
| 12 februari 2011 | KVK | Kwekerij De Bloesem ingeschreven, vof, Bleiswijk | decretogram | Handelsregisterwet | KVK |
| augustus 2026 | Belastingdienst | Loonaangifte augustus 2026: 7 werknemers | executogram | Wet LB / Wfsv | Belastingdienst |

## De journey van Robin

| # | Datum | Actor | Gebeurtenis | Soort | Grond | Scherm |
|---|---|---|---|---|---|---|
| 1 | 7 september 2026 | Robin | Opent Personeel → "Iemand aannemen", voert Koen in (naam, geboortedatum, BSN met toestemming van Koen), kiest 32 uur | executogram (ondernemer) | — | Iemand aannemen: kandidaat |
| 2 | 7 september 2026 | Koen | Geeft toestemming dat Kwekerij De Bloesem zijn gegevens bij UWV en gemeente mag gebruiken voor deze aanvraag | executogram (Koen) | AVG art. 6 lid 1 a | melding in de Berichtenbox van Koen (buiten beeld) |
| 3 | 7 september 2026 | MoZa | Haalt per bron op wat de wet vraagt; Robin vinkt per bron "klopt, gebruik dit": UWV (doelgroepregister: ja, sinds 3 nov 2025), gemeente (ondersteuning college: ja; loonwaarde: nog niet vastgesteld), KVK (bedrijf), Belastingdienst (loonaangifte: 7 werknemers). Eigen opgave: uren, aanvang, loon | executogram (ondernemer) | Pwet 10c, 10d; Wfsv 38b; Wtl 2.10; ZW 29b | Iemand aannemen: gegevens per bron |
| 4 | 7 september 2026 | engine | Indicatie: loonkostensubsidie mogelijk via Pwet 10d lid 2 b (aanvraag binnen zes maanden na aanvang, Koen was persoon van 7 lid 1 a), bedrag na loonwaardevaststelling (voorbeeld bij 60 procent: € 897,41 per maand); loonkostenvoordeel banenafspraak € 1,01 per verloond uur, bij 1.664 uur € 1.680,64 per jaar; no-riskpolis: ja (lid 2 e), regelt UWV; begeleiding op de werkplek: aanspraak (10da); proefplaatsing: mogelijk (8a, 2 maanden); loondispensatie: niet (geen Wajong) | indicatie, geen besluit | als boven, plus WMM 8 en 15, Regeling werkgeverslasten art. 1 | Iemand aannemen: wat het oplevert |
| 5 | 1 oktober 2026 | Robin en Koen | Dienstbetrekking begint; Robin verwerkt Koen in de loonadministratie en zet in de loonaangifte het verzoek om loonkostenvoordeel | executogram (ondernemer) | Wtl 2.10 lid 1 (verzoek in de loonaangifte) | Lopende zaken: Koen aannemen |
| 6 | 5 oktober 2026 | Robin | Dient de concept-aanvraag loonkostensubsidie in bij de gemeente Lansingerland | executogram (ondernemer) | Pwet 10d lid 2 (binnen zes maanden na aanvang) | Concept-aanvraag loonkostensubsidie → ingediend |
| 7 | 6 oktober 2026 | Gemeente Lansingerland | Ontvangstbevestiging met zaaknummer LLD-LKS-2026-0417 | executogram (gemeente) | Awb 4:3a | Berichtenbox; Lopende zaken |
| 8 | 9 oktober 2026 | Gemeente Lansingerland | Afspraak loonwaardemeting op de werkplek gepland op 13 oktober | executogram (gemeente) | Regeling loonkostensubsidie Participatiewet 2021 (uniforme loonwaardemethode) | Lopende zaken: zaak LKS |
| 9 | 12 oktober 2026 | Gemeente Lansingerland | Correctie: de afspraak is verzet naar 20 oktober; de arbeidsdeskundige is 13 oktober niet beschikbaar. De oude afspraak blijft zichtbaar als "gecorrigeerd" | executogram, herstelt 8 | — | Lopende zaken: zaak LKS |
| 10 | 20 oktober 2026 | Gemeente Lansingerland (arbeidsdeskundige) | Loonwaardemeting op de werkplek uitgevoerd | executogram (gemeente) | als 8 | Lopende zaken: zaak LKS |
| 11 | 27 oktober 2026 | College van Lansingerland | Loonwaarde vastgesteld: 60 procent van het wettelijk minimumloon | decretogram (college) | Pwet 10d lid 1 en 2; de methode is een aangeleverd feit (juristfeedback 24/25 sep: besluit en regeling loonkostensubsidie niet uitwerken) | Lopende zaken: zaak LKS; Berichtenbox |
| 12 | 3 november 2026 | College van Lansingerland | Besluit: loonkostensubsidie toegekend, € 897,41 per maand vanaf 1 oktober 2026. Onderbouwing uit de engine: WML met 8 procent vakantiebijslag € 2.523,96 min loonwaarde € 1.514,38 is € 1.009,58; onder het maximum van 70 procent van de grondslag (€ 2.208,47); naar rato 32 van 36 uur is € 897,41. Bezwaar binnen zes weken bij het college | decretogram (college) | Pwet 10d lid 4; WMM 8 en 15; Regeling werkgeverslasten art. 1 (vergoeding in de grondslag van het maximum, letter van lid 4); Awb 6:7 | Besluit; Berichtenbox |
| 13 | 3 november 2026 | Robin | Leest het besluit, opent "Waarom" (uitleg plus trace van de engine) en stelt via "Klopt dit niet?" een vraag: "Telt de vergoeding werkgeverslasten niet mee in het bedrag?" | executogram (ondernemer) | Awb 6:7 (vraag, nog geen bezwaar) | Besluit → vraag |
| 14 | 6 november 2026 | Gemeente Lansingerland | Antwoord: de vergoeding zit in de grondslag van het maximum, niet in de subsidie; het UWV is gevraagd of de uitvoering hiervan afwijkt (open punt, actieregister 1.5) | executogram (gemeente), verwijst naar 13 | Pwet 10d lid 4 | Lopende zaken: zaak LKS |
| 15 | 27 november 2026 | Gemeente Lansingerland | Betaling loonkostensubsidie oktober en november: € 1.794,82 | executogram (gemeente) | Pwet 10d | Lopende zaken: zaak LKS |
| 16 | 15 maart 2027 | Belastingdienst | Voorlopige berekening loonkostenvoordeel banenafspraak 2026: 416 verloonde uren (oktober tot en met december) × € 1,01 = € 420,16 | executogram (Belastingdienst) | Wtl 4.1 (na afloop van het kalenderjaar) | Lopende zaken: komt hierna |
| 17 | 1 augustus 2027 | Belastingdienst | Beschikking loonkostenvoordeel 2026; uitbetaling in september 2027 | decretogram (Belastingdienst) | Wtl 4.2 en 4.3 | Lopende zaken: komt hierna |
| — | bij ziekte | UWV | No-riskpolis: ziekengeld 70 procent van het dagloon, zonder aanvraag vooraf; dienstbetrekking aangevangen op of na 1 januari 2015 en Koen staat in het register | uitkomst zonder taak | ZW 29b lid 2 e en lid 5; Dagloonbesluit 12e | Iemand aannemen: dit regelt de overheid zelf |
| — | optioneel | Robin bij de gemeente | Begeleiding op de werkplek (jobcoach): aanspraak voor iedereen in de doelgroep loonkostensubsidie; aanvragen bij de gemeente | taak, optioneel | Pwet 10da (juristfeedback norm 5) | Iemand aannemen: taken |

## Wat de ondernemer niet ziet

- De BSN van Koen en het KVK-nummer gaan naar de engine en staan nergens op het scherm (verborgen feiten, zoals in de engine-bundel).
- De loonwaardemethode zelf: alleen de uitkomst (60 procent) en wie hem vaststelde.
- Interne doorlooptijden van de gemeente; wel elke vastlegging met datum en afzender.

## Aannames en open punten

| Aanname | Waarom | Open bij |
|---|---|---|
| Vergoeding werkgeverslasten zit in de grondslag van het 70-procentmaximum, niet bovenop de subsidie (Koen € 897,41) | Letter van Pwet 10d lid 4; afstempunt J4 | UWV, actieregister 1.5 |
| Loonwaarde 60 procent is een aangeleverd feit van het college | Juristfeedback 24/25 sep: Besluit loonkostensubsidie niet uitwerken | — |
| Route lid 2 b (aanvraag binnen zes maanden, Koen was persoon van 7 lid 1 a); geen loonwaarde vooraf (lid 1 a) en geen forfait (lid 1 b met lid 5) | Zelfde route als het corpus-scenario van Koen; past bij een ondernemer die start en daarna aanvraagt | — |
| Geen doelgroepverklaring voor loonkostenvoordeel banenafspraak | Vervallen sinds 2025; verzoek in de loonaangifte volstaat (Wtl 2.10) | — |
| Toestemming van Koen als grondslag voor het gebruik van zijn gegevens door de werkgever | Prototype; echte grondslag per bron nog te bepalen | privacy-officer, bij #1322 hoort dit niet |
| Dagloon bij de no-riskpolis niet in beeld zolang Koen niet ziek is | ZW 29b lid 5 geeft pas een bedrag bij ziekte | — |

## Verschil met prototype v1 (Platformland-basis)

- Geen Google, Start of nagebootste eHerkenning: de journey begint ingelogd in MoZa.
- Geen situaties ("Wat als ik …"), geen takenlijst over organisaties heen, geen verslag, geen Koen/Sadee-wissel.
- Besluit vóór de aanvraag en vóór de meting is rechtgezet: aanvraag (5 okt) → meting (20 okt) → loonwaarde (27 okt) → besluit (3 nov).
- "Genomen door: automatisch, engine" vervalt: het college besluit, de engine onderbouwt.
- Bedragen uit de huidige corpus (€ 897,41, € 1.680,64), niet uit fd1634e (€ 766,22).
- Termen van de proeftuin: Lopende zaken (niet Dossiers), Berichtenbox (niet Meldingen), Bedrijfsgegevens (niet Organisatie of Profiel).
