# Oriëntatie "iemand aannemen": wat er nu in staat (v1)

Stand 27 oktober 2026, branch `feat/iemand-aannemen-vervolg` (op `ux-fork`
`a633acc`, na merge van PR #117). Beschrijft de code zoals hij is, als
nulmeting voor een generieke oriëntatie. Het ontwerp en het bouwplan staan in
`ontwerp-orientatie-alle-uitkomsten-v1.md` en `plan-orientatie-alle-uitkomsten-v1.md`.

## Wat de oriëntatie is

De oriëntatie vertaalt vier antwoorden van de werkgever naar feiten voor de
regelrecht-engine, laat de engine rekenen in de browser, en vertaalt de
uitkomsten naar wat het scherm toont. De uitkomst is een verkenning, geen
besluit. In de aanvraag hoort niets van deze laag (notitie "Wat de oriëntatie
bovenop RegelRecht doet", regelrecht-corpus-FCV, 26 oktober 2026).

Bestanden:

| Bestand              | Rol                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `_uitkomsten.ts`     | De oriëntatie zelf: vraag 1, feiten per antwoord, welke uitkomsten, vertaling naar het scherm, balans |
| `_basisfeiten.json`  | De vaste uitgangssituatie (141 feiten)                                                                |
| `_useAannemen.ts`    | Antwoorden en `registerVast` voor het scherm                                                          |
| `_vragen.tsx`        | De vier vragen met hun grenzen                                                                        |
| `_balans.tsx`        | Balans, toelichtingen en voorbehouden op het scherm                                                   |
| `_engine.ts`         | `loonkostenPerJaar`, en de oudere `invoerVan` (alleen nog voor `_waarom.tsx`)                         |
| `public/regelrecht/` | De kern: regelrecht-uitleg met engine `0a1a76c8` en corpus `MinBZK/regelrecht-corpus` `42054d7d`      |

Elk onderdeel hieronder heeft een soort:

- **feit**: een gegeven dat de engine als invoer krijgt;
- **aanname**: een keuze die in werkelijkheid anders kan liggen;
- **wetlogica**: een regel die uit het corpus zou moeten komen;
- **schatting**: rekenwerk buiten de engine.

## 1. De vier vragen

| Vraag                                 | Invoer                                                                | Grenzen op het scherm                                                 |
| ------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Uit welke situatie komt de werknemer? | meerkeuze: `register`, `wajong`, `wia`, `bijstand`, `beschut`, `geen` |                                                                       |
| Hoeveel uur per week?                 | `uren`                                                                | 8 tot en met 40, stap 1                                               |
| Wat is de loonwaarde?                 | `loonwaarde` in procenten                                             | 30 tot en met 100, stap 5                                             |
| Wat is het uurloon?                   | `uurloon` in eurocent                                                 | het minimumloon (€ 14,99), of "anders": van het minimumloon tot € 200 |

Samenhang in vraag 1 (`kiesDoelgroep`, `registerVast`):

- Wajong vinkt ook het register aan, behalve met beschut werk. _Wetlogica (Wfsv 38b lid 1 c)._
- Beschut werk haalt het register weg, en het register haalt beschut werk weg. _Wetlogica (aanhef 38b lid 1)._ Wajong en beschut werk kunnen samen; dan is er geen register.
- "Geen van deze" sluit de rest uit.

## 2. Vaste data en de uitgangssituatie

- `PEILDATUM` = `AANVANG` = 1 oktober 2026 (eerste werkdag). De engine kiest daarmee de wetsversies van 1 juli 2026.
- `AANVRAAG` = 5 oktober 2026.
- `WML_UUR_EUROCENT` = 1499. _Hardgecodeerd; staat ook in het corpus (WML art. 8)._

`_basisfeiten.json` (141 feiten):

- **Neutraal:** 98 booleans op `false`, 22 getallen op `0`, 2 op `null`.
- **Vaste casuskeuzes** (_aanname_):
  - `bsn` 999990101
  - geboortedatum 15 maart 1984 (houdt Pwet 7 lid 3 a en het jeugdminimumloon buiten beeld)
  - aanvang dienstbetrekking, en eerste dienstbetrekking Wtl 2.6, op 1 oktober 2026
  - `is_verzekerde_wia` waar
  - verdiencapaciteit WIA en Wajong 100%
- **15 sentineldatums** `1900-01-01` ("nooit"). In het gereviewde FCV-corpus zijn de meeste van die gegevens nullable; daar hoort `null`.

## 3. Altijd gezet, ongeacht vraag 1

- **Zes feiten waar** (_aanname_): loonaangifteverzoek ingediend, voornemen dienstbetrekking, dienstbetrekking tot stand gekomen, arbeid in dienstbetrekking, arbeidsverhouding of voorbereiding, aangevangen na het begin van de referteperiode.
- **Data:** aanvang dienstbetrekking en eerste dienstbetrekking (2.6) op `AANVANG`.
- **Uit de antwoorden:** arbeidsduur = `uren`, loonwaarde = `loonwaarde`.
- **Verloonde uren** = uren × 52, ook voor de LKV-categorieën 2.6, 2.10 en 2.14. _Aanname: een vol jaar, en alle categorievoorwaarden gelden het hele jaar._

## 4. Wat elk antwoord toevoegt

| Antwoord                                  | Feiten                                                                                                                                                                                                                                           | Soort                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **register**                              | `was_arbeidsbeperkte_lid_1_of_2`, `registratie_nog_niet_geeindigd`, opname 3 november 2025                                                                                                                                                       | aanname (blijfgrond 38b lid 6; de datum stuurt de Wtl-periodes)                                                                      |
| **bijstand**, alleen zonder Wajong en WIA | `was_persoon_7_lid_1_a_of_7a_in_zes_maanden_voorafgaand`, doelgroep Pwet 7 lid 1 a, algemene bijstand, **college stemt in met proefplaatsing**, toegeleid naar dienstbetrekking (twee feiten)                                                    | aanname. Dat Wajong of WIA dit uitzet, is _wetlogica_ (Pwet 7 lid 3 c), en staat niet in het corpus                                  |
| bijstand en **loonwaarde < 100**          | behoort tot doelgroep LKS, **kan het minimumloon niet verdienen**, college heeft de loonwaarde vastgesteld, aanvraag LKS op `AANVRAAG`                                                                                                           | aanname (vervangt het oordeel van het college)                                                                                       |
| **wajong**                                | arbeidsondersteuning of uitkering, **recht op arbeidsondersteuning**, had of heeft een arbeidsongeschiktheidsuitkering, aanvraag loondispensatie ingediend                                                                                       | aanname. Het recht op arbeidsondersteuning leidt het corpus zelf af (ZW via Wajong); het aangeleverde gegeven wint van die afleiding |
|                                           | arbeidsprestatie duidelijk minder = loonwaarde < 100                                                                                                                                                                                             | aanname (vervangt het oordeel van UWV)                                                                                               |
|                                           | gebruikelijke beloning = minimumloon                                                                                                                                                                                                             | aanname                                                                                                                              |
|                                           | **gerechtvaardigde beloning = minimumloon × loonwaarde ÷ 100**                                                                                                                                                                                   | _schatting_. Met de drempel van 25% in het corpus wordt "loonwaarde ≤ 75" de feitelijke toegangsregel                                |
|                                           | aanspraakpercentage = loonwaarde; verwachte duur 12 maanden                                                                                                                                                                                      | aanname                                                                                                                              |
| **wia**                                   | tien feiten waar: WIA-recht de maand vóór aanvang, uitkering hoofdstuk 6, ziek geworden (twee), doelgroepverklaring 2.7, structurele beperking, aanvraag jobcoaching en werkplekaanpassing, voorziening noodzakelijk, meeneembaar en individueel | aanname                                                                                                                              |
|                                           | wachttijd vanaf 2 januari 2023 (twee), verdiencapaciteit 50%, kosten voorziening € 1.000                                                                                                                                                         | aanname (gekozen als WGA, boven het drempelbedrag)                                                                                   |
| **beschut**                               | college heeft "uitsluitend beschut werk" vastgesteld, doelgroep 10b lid 1, dienstbetrekking beschut werk, Wsw of beschut werk                                                                                                                    | aanname                                                                                                                              |
|                                           | **uitgesloten wegens beschut werk (Pwet 10b)**                                                                                                                                                                                                   | aanname. Ook dit leidt het corpus zelf af; het aangeleverde gegeven wint                                                             |
| **geen**                                  | niets                                                                                                                                                                                                                                            |                                                                                                                                      |

## 5. Welke uitkomsten worden gerekend (`DOELEN`)

Een aanroep die wordt overgeslagen, toont op het scherm "geldt niet". _Wetlogica: de engine zou dat zelf beslissen._

| Uitkomst                                             | Gerekend als                    |
| ---------------------------------------------------- | ------------------------------- |
| Loonkostensubsidie, met bedrag per maand             | bijstand, en geen Wajong of WIA |
| Loondispensatie, met aanspraak per uur               | Wajong                          |
| Loonkostenvoordeel, met bedrag per jaar en categorie | iets aangevinkt, en niet "geen" |
| No-riskpolis, met duur                               | idem                            |
| Proefplaatsing Pwet                                  | bijstand, en geen Wajong of WIA |
| Begeleiding op de werkplek                           | idem                            |
| Jobcoaching, met werkplekaanpassing                  | WIA                             |

De proefplaatsing van de WW (76a) wordt nooit gerekend, maar het scherm leest hem wel. Hij staat dus altijd op "geldt niet".

## 6. Wat het scherm krijgt (`uitkomstenUit`)

**Regels met een bedrag per jaar**

| Regel | Bedrag                                                                                                                | Wat erbij komt                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lks` | bedrag per maand van de engine × 12                                                                                   | aanname `lks_lid4`                                                                                                                                                                                     |
| `ld`  | **(minimumloon − aanspraak per uur) × uren × 52 × 1,08 × 1,2**, alleen als het uurloon ten hoogste het minimumloon is | _schatting_. Boven het minimumloon wordt hij weggelaten met aanname `ld_cao` (_wetlogica zonder corpusregel_). Met beschut werk: aanname `ld_beschut` (samen met LKS bij Pwet 10b lid 9 niet getoetst) |
| `lkv` | bedrag per jaar van de engine, als dat groter is dan 0                                                                | categorie; aanname `wia_nieuw` bij een arbeidsgehandicapte werknemer                                                                                                                                   |

**Overige (geldt ja of nee)**

- `nrp`: no-riskpolis, met de duur (−1 = zolang de dienstbetrekking loopt);
- `pp_pwet`, `pp_ww` (altijd nee), `begeleiding`;
- `vz_wia`: jobcoaching of werkplekaanpassing;
- `vz_wajong`: **waar zodra Wajong is aangevinkt, zonder engine-aanroep** (_wetlogica_; Wajong 2:22 staat niet in het corpus).

**Aannames op het geheel:** `ld_cao`, `beschut_lks` (beschut werk zonder bijstand), `geen`.

**Voorbehoud loonkostenvoordeel** (`lkvVoorbehoud`): `zes_maanden` alleen bij de arbeidsgehandicapte werknemer, `samenloop` altijd. _Wetlogica die botst met het corpus._ De markering bij Wtl 2.1 noemt zes maanden en samenloop voor elke categorie.

## 7. Balans en schermteksten (`_balans.tsx`, `_engine.ts`)

- **Loonkosten** = uurloon × uren × 52 × 1,08 × 1,2 (`loonkostenPerJaar`). _Schatting_, en zo benoemd.
- **Balans** (`balansRegels`): LKS, loondispensatie en LKV, in die volgorde, elk afgetopt op wat van de loonkosten over is. _Rekenwerk_: een samenloopregel die het corpus uitdrukkelijk niet modelleert.
- **Looptijd LKV** (`lkvDuurTekst`): "ten hoogste drie jaar" bij de arbeidsgehandicapte werknemer (Wtl 2.8), anders zolang de dienstbetrekking loopt (Wtl 2.12). _Wetlogica in tekst._
- **Toelichtingen** bij `ld_cao`, `wia_nieuw`, `ld_beschut`, `beschut_lks` en `geen`, en twee voorbehoudteksten. Ze noemen regels uit de wet in eigen woorden.

## 8. Wat niet klopt met het uitgangspunt

| Onderdeel                                              | Probleem                                                           | Richting                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `kiesDoelgroep`, `viaGemeente`, `DOELEN.nodig`         | Wetlogica in de oriëntatie                                         | Elke uitkomst rekenen; Pwet 7 lid 3 c in het corpus                                      |
| `vz_wajong`, `ld_cao`, `balansRegels`                  | Uitkomst zonder corpusregel                                        | Wajong 2:22, een cao-regel (beleid of open term) en een stelselregel (RFC) in het corpus |
| `lkvVoorbehoud`, `lkvDuurTekst`, toelichtingen         | Wet in eigen tekst; het voorbehoud botst met het corpus            | De markeringen en de vindplaats uit het corpus tonen                                     |
| Recht op arbeidsondersteuning, uitsluiting 10b         | Aangeleverd gegeven wint van de afleiding in het corpus            | Alleen de onderliggende feiten aanleveren                                                |
| `gerechtvaardigde_beloning`, verloonde uren, sentinels | Schattingen en restanten zonder markering                          | Als aanname tonen; sentinels naar `null`                                                 |
| Bundel                                                 | Oud corpus (`42054d7d`), met de boolean die het FCV-corpus verving | Overstappen op `regelrecht-corpus-FCV`                                                   |

## 9. Verschil met de kopie in de DA-repo

`moza-poc-digitale-assistent` (PR #78, `services/rekenkern/src/aannemen.rs`) heeft een overgenomen versie die al afwijkt:

|                            | Portaal                       | DA-kopie                                                                 |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Peildatum                  | 1 oktober 2026                | 1 juli 2026; de allowlist weigert een andere datum                       |
| Aanvang, aanvraag LKS      | 1 oktober en 5 oktober 2026   | 1 januari en 1 februari 2026                                             |
| Beschut werk in vraag 1    | haalt alleen het register weg | haalt register en Wajong weg                                             |
| Aanname `ld_beschut`       | ja                            | nee                                                                      |
| Feiten voor het FCV-corpus | nee (oude boolean)            | ja (datum en `ondersteuning_is_in_overwegende_mate_op_individu_gericht`) |

Twee kopieën van de oriëntatie lopen dus al uit elkaar. Volgens de
koerswijziging van 27 oktober 2026 hoort de oriëntatie bij de afnemer: deze
versie is de bron.
