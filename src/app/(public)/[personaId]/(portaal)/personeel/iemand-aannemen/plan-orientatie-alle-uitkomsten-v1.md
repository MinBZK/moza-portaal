# Oriëntatie alle uitkomsten: bouwplan (v1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De oriëntatie van "Iemand aannemen" rekent voor elke uitgangssituatie van de Uitkomstenkaart alle acht regelingen live met de regelrecht-engine, nooit te gunstig, met (i) bij aannames.

**Architecture:** Eén zuiver TypeScript-bestand `_uitkomsten.ts` (geen React, alleen `import type`) zet de antwoorden om in engine-invoer (neutrale basis + feiten per vinkje) en de engine-uitkomsten in een schermmodel. Node 24 laadt dat bestand direct (type stripping), zodat een `node:test`-tabel het tegen de echte WASM-kern draait. `_balans.tsx` en `_vragen.tsx` tonen het model; de worker en `useBerekening` blijven.

**Tech Stack:** Next.js 16, React 19, TypeScript, RHC-componenten, regelrecht-uitleg WASM (`public/regelrecht/`), Node 24 `node:test`.

**Spec:** `ontwerp-orientatie-alle-uitkomsten-v1.md` (zelfde map).

## Global Constraints

- Vier vragen; vraag 1 acht opties: register, Wajong, "Iemand met een WIA-uitkering", bijstand, Wsw, beschut werk, geen, weet niet.
- Nooit te gunstig: bij twijfel de zuinige lezing plus een (i).
- Peildatum van de oriëntatie `2026-07-01`; aanvang dienstbetrekking `2026-01-01` (zoals de traces).
- Geen wijziging aan `public/regelrecht/**` of regelrecht zelf.
- Classes: `mox-` in `mox.css`, `rhc-mox-` in `rhc.css`; geen Tailwind; B1; geen "niet X maar Y"-zinnen.
- Commits als `Ravi Meijer <ravi.meijer@rijksoverheid.nl>`, zonder Co-Authored-By-trailer; niet pushen.

## Review Focus

- Combinatie Wajong of WIA + bijstand: geen loonkostensubsidie (Pwet 7 lid 3 c). Test in Task 3.
- Beschut werk + register tegelijk aanvinken: kan niet; het register gaat uit. Test in Task 2.
- Loonwaarde 100 bij register: loonkostenvoordeel blijft (blijfgrond). Test in Task 3.
- Oude opslag met `doelgroepen: ["wia"]` of zonder `uurloon`: laadt zonder fout. Test in Task 2.
- Engine-fout voor één wet (ontbrekende parameter): de balans valt terug met melding, geen witte pagina. Task 4 (bestaande foutstand van `useBerekening`).

---

### Task 1: Engine in Node en de neutrale basis

**Files:**
- Create: `scripts/regelrecht-node.mjs` — laadt `public/regelrecht/pkg` met `initSync`, exporteert `bereken(invoer): Berekening` en `gegevens(wet, output, peildatum)`.
- Create: `scripts/iemand-aannemen-basisfeiten.mjs` — schrijft `_basisfeiten.json`.
- Create: `src/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_basisfeiten.json` (gegenereerd, gecommit).

**Interfaces:**
- Produces: `_basisfeiten.json`: `Record<string, boolean | number | string | null>` met elke parameter die een van de doelen hieronder transitief vraagt (via `gegevens`, `respondent.soort === "andere_regeling"` volgen).
- Doelen (wet → output, plus `uitleggen`): `participatiewet` → `heeft_recht_op_lks` (+`hoogte_lks_eurocent_per_maand`), `mag_proefplaatsing_aangaan`, `heeft_aanspraak_op_begeleiding_op_de_werkplek`; `wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten` → `heeft_recht_op_loondispensatie` (+`aanspraak_beloning_per_uur_eurocent`); `wet_tegemoetkomingen_loondomein` → `heeft_recht_op_lkv` (+`hoogte_lkv_per_jaar_eurocent`, `categorie_lkv`); `ziektewet` → `heeft_recht_op_no_risk_polis` (+`duur_no_risk_polis_jaren`); `werkloosheidswet` → `uwv_mag_toestemming_verlenen`; `wet_werk_en_inkomen_naar_arbeidsvermogen` → `mag_jobcoaching_toekennen` (+`mag_werkplekaanpassing_toekennen`).

- [ ] Script: standaard boolean `false`, number/amount `0`, date `null`, string `"999990101"`; daarna een vaste lijst neutrale uitzonderingen in het script zelf: `verdiencapaciteit_percentage_maatmaninkomen` en `verdiencapaciteit_wajong_percentage_maatmaninkomen` `100`, `is_verzekerde_wia` `true`, `geboortedatum` `"1984-03-15"`, `datum_aanvang_dienstbetrekking` en `datum_aanvang_eerste_dienstbetrekking_2_6` `"2026-01-01"`, en de `1900-01-01`-datums uit de Koen-trace van `ziektewet`.
- [ ] Run: `node scripts/iemand-aannemen-basisfeiten.mjs` → JSON geschreven; elk doel met alleen de basis rekent zonder fout en geeft voor elke `heeft_recht_*`/`mag_*`/`uwv_mag_*` `false` en bedragen `0`.
- [ ] Commit `chore: neutrale basisfeiten voor de oriëntatie`.

### Task 2: Vraag 1 met acht opties

**Files:**
- Modify: `_useAannemen.ts` (DOELGROEPEN, `kiesDoelgroep`, `registerVast`, migratie in `lees`)
- Test: `scripts/iemand-aannemen-uitkomsten.test.mjs` (nieuw; `node --test`)

**Interfaces:**
- Produces: `Doelgroep = "register" | "wajong" | "wia" | "bijstand" | "wsw" | "beschut" | "geen" | "weetniet"`; `kiesDoelgroep(huidig, waarde, aan): Doelgroep[]`.

Omdat `_useAannemen.ts` React importeert, gaat de pure keuzelogica naar `_uitkomsten.ts` (`kiesDoelgroep`, `DOELGROEPEN`, `type Doelgroep`), en `_useAannemen.ts` exporteert die door.

- [ ] Tests: `wajong` aan → bevat `register`; `beschut` aan → `register` en `wajong` eruit; `register` aan bij `beschut` → `beschut` eruit; `geen` aan → `["geen"]`; volgorde volgt DOELGROEPEN.
- [ ] Label WIA: "Iemand met een WIA-uitkering"; nieuw: "Heeft een Wsw-indicatie of werkt in de sociale werkvoorziening", "Is door de gemeente aangewezen op beschut werk".
- [ ] Migratie: oude opslag met onbekende waarden (bijv. leeg) laadt; ontbrekend `uurloon` krijgt het minimumloon (bestaat al).
- [ ] Run `node --test scripts/iemand-aannemen-uitkomsten.test.mjs` → PASS; `tsc --noEmit` schoon. Commit.

### Task 3: Van antwoorden naar engine-invoer en uitkomsten

**Files:**
- Create/extend: `_uitkomsten.ts`
- Test: `scripts/iemand-aannemen-uitkomsten.test.mjs`

**Interfaces:**
- Consumes: `Antwoorden` (type), `Invoer`/`Berekening` (types uit `_useRegelrecht.ts`), basis uit Task 1 als argument.
- Produces:
  - `invoerVoor(a: Antwoorden, basis: Feiten): Invoer[]` — één `Invoer` per doel uit Task 1, gedeelde `parameters` = basis + feiten per vinkje.
  - `uitkomstenUit(a: Antwoorden, uit: Record<string, Berekening["outputs"]>): Uitkomsten` met sleutel `"<wet>:<output>"`.
  - `type Uitkomsten = { regels: Regel[]; overige: Overig[]; aannames: Aanname[] }`, `Regel = { id: "lks" | "ld" | "lkv"; bedragPerJaar: number; categorie?: string; aanname?: AannameId }`, `Overig = { id: "nrp" | "pp_pwet" | "pp_ww" | "begeleiding" | "vz_wia" | "vz_wajong"; geldt: boolean; duurJaren?: number }`, `AannameId = "lks_lid4" | "wia_nieuw" | "wsw_zuinig" | "beschut_lks" | "weetniet" | "geen"`.

Feiten per vinkje (volgens het ontwerp; afstemmen op de engine tot de tabel klopt, zonder te gunstig te worden):
- bijstand (alleen als geen Wajong en geen WIA): Pwet-doelgroep 7 lid 1 a, `ontvangt_algemene_bijstand`, toestemming proefplaatsing, `is_pwet_toegeleid_of_lks_lid_2`; bij loonwaarde < 100 ook `behoort_tot_doelgroep_lks`, `kan_minimumloon_niet_verdienen`, `college_heeft_loonwaarde_vastgesteld_conform_10d`, `datum_aanvraag_lks` `2026-02-01`.
- register en weetniet: `was_arbeidsbeperkte_lid_1_of_2`, `registratie_nog_niet_geeindigd`, `datum_eerste_opname_doelgroepregister` `2025-11-03`.
- wajong: Wajong-recht voor Wfsv/ZW/WIA 35 en voor loondispensatie; `vastgesteld_aanspraakpercentage_minimumloon` = loonwaarde; `gebruikelijke_beloning_per_uur_eurocent` = 1499; `gerechtvaardigde_beloning_per_uur_eurocent` = 1499 × loonwaarde / 100; `aanvraag_loondispensatie_ingediend`; verwachte duur 12.
- wia: `had_wia_recht_maand_voor_aanvang`, `heeft_wia_uitkering_hoofdstuk_6`, `heeft_geldige_doelgroepverklaring_2_7`, WIA-recht voor ZW lid 1 a; WIA 35: structurele beperking, aanvraag, noodzakelijk, kosten boven de drempel (aanname: "kan gelden").
- wsw: indicatie én Wsw-dienstbetrekking art. 2 zonder detachering (zuinig).
- beschut: vaststelling uitsluitend beschut werk, doelgroep 10b, dienstbetrekking beschut werk.
- Alle: `heeft_loonaangifte_verzoek_ingediend`, verloonde uren = uren × 52, uren per week, loonwaarde.
- Loondispensatie per jaar = `(1499 − aanspraak_beloning_per_uur_eurocent) × uren × 52 × 1,08 × 1,2`, afgerond op hele centen (zelfde vuistregel als de loonkosten).

- [ ] Testtabel (32 uur, uurloon 1499, peildatum 2026-07-01), elk geval draait `invoerVoor` → `bereken` (Task 1) → `uitkomstenUit`:

| geval | vinkjes, loonwaarde | verwacht |
|---|---|---|
| Koen | bijstand, 60 | lks 89741 × 12; lkv 168064 banenafspraak; nrp ja, duur −1; pp_pwet ja; begeleiding ja; geen ld |
| register 100 | register, 100 | geen lks; lkv 168064; nrp ja |
| register 60 | register, 60 | geen lks; lkv 168064 |
| Sadee | wajong, 70 | ld: aanspraak 1049,3 ct/uur; lkv 168064; nrp ja (−1); geen lks; vz_wajong; geen vz_wia |
| Wajong 80 | wajong, 80 | geen ld (minder dan 25 procent lager) |
| WIA | wia, 100 | lkv 507520 arbeidsgehandicapte; nrp ja, duur 5; vz_wia ja; geen lks |
| Wsw | wsw, 60 | geen lks, geen lkv, geen nrp |
| beschut | beschut, 60 | geen lks (aanname beschut_lks), geen lkv; nrp ja (−1) |
| beschut + bijstand | beschut, bijstand, 60 | lks 89741 × 12; geen lkv |
| register + bijstand | register, bijstand, 60 | als Koen |
| WIA + register | wia, register, 100 | lkv 507520 arbeidsgehandicapte |
| Wajong + bijstand | wajong, bijstand, 60 | geen lks |
| geen | geen, 60 | alles nee/0 |
| weet niet | weetniet, 60 | geen lks; lkv 168064; nrp ja; aanname weetniet |

- [ ] Run `node --test …` → FAIL eerst, na implementatie PASS. Afwijking van de kaart zonder gedocumenteerde aanname = fout in de feiten, niet in de test.
- [ ] Commit `feat: oriëntatie rekent elke uitgangssituatie`.

### Task 4: Scherm

**Files:**
- Modify: `_vragen.tsx` (vraag 1 uit DOELGROEPEN; uitleg vraag 3 per situatie: Wajong → "percentage van het minimumloon dat de kandidaat verdient (loondispensatie)", anders loonwaarde; (i) bij "Geen van deze" en "Aanvraag laten invullen" als de keuze niet bijstand of register is)
- Modify: `_balans.tsx` (volle balans uit `Uitkomsten`: één `useBerekening` per `Invoer`; regels lks/ld/lkv met (i); onderschrift "De bedragen gelden als u de regelingen aanvraagt."; kort-variant blijft rekenen met `{ ...a, doelgroepen: ["bijstand"] }`)
- Modify: `_vragen.tsx` "Regelingen die verder kunnen gelden" uit `Uitkomsten.overige` met teksten per id (no-riskpolis met duur "vijf jaar" of "zonder einddatum")
- Modify: `_engine.ts` (oude `invoerVan` alleen nog voor `_waarom.tsx`; `loonkostenPerJaar` blijft)
- Modify: `mox.css` alleen als RHC niet volstaat (de (i) met `Toggletip` uit RHC)

- [ ] Teksten (i), B1:
  - lks_lid4: "Gerekend met een loonwaarde die de gemeente vooraf vaststelt. Stelt de gemeente die pas na de start vast, dan krijgt u de eerste zes maanden 50 procent: € 1.577,48 per maand bij 36 uur, naar rato van de uren."
  - wia_nieuw: "Gerekend alsof de kandidaat bij u nieuw in dienst komt. Gaat iemand met een WIA-uitkering bij u weer aan het werk, dan geldt het loonkostenvoordeel één jaar."
  - wsw_zuinig: "Gerekend met werk in de sociale werkvoorziening. Heeft de kandidaat alleen een Wsw-indicatie, dan kunnen het loonkostenvoordeel en de no-riskpolis wel gelden."
  - beschut_lks: "De gemeente kan bij beschut werk loonkostensubsidie geven. Dat staat er niet in, omdat het van de gemeente afhangt."
  - weetniet: "Gerekend alsof de kandidaat in het doelgroepregister staat. Helpt de gemeente de kandidaat aan werk, dan kan er ook loonkostensubsidie gelden."
  - geen: "Is de kandidaat gekeurd voor de WIA, heeft de kandidaat een WAO- of een WW-uitkering? Dan kunnen een no-riskpolis, loonkostenvoordeel of een proefplaatsing gelden."
- [ ] Browsercheck: uitbreiding van `scripts/iemand-aannemen-schermen.mjs` niet nodig; eigen run met Playwright op 1280 en 390: per geval Koen, Sadee, WIA, beschut de balansbedragen gelijk aan de testtabel, geen consolefouten, geen horizontale scroll.
- [ ] `tsc`, eslint (map), stylelint, prettier schoon. Commit.

### Task 5: Afronden

- [ ] README van de map bijwerken (vier vragen, acht opties, alles live, testtabel `node --test scripts/iemand-aannemen-uitkomsten.test.mjs`).
- [ ] Ontwerp: open punten bijwerken met wat de engine anders deed dan verwacht.
- [ ] Review van de branch door een frisse reviewer; bevindingen verwerken. Commit.
