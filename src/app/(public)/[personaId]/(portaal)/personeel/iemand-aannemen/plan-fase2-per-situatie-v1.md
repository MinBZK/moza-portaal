# Fase 2 per situatie: bouwplan (v1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Na de oriëntatie volgt elke stap (gegevens, concept-aanvraag, indienen, verstuurd, zaak, besluit) de situatie uit de oriëntatie, per organisatie gebundeld, met bedragen uit de engine.

**Architecture:** Een puur bestand `_route.ts` bepaalt uit de vinkjes en de `Uitkomsten` van fase 1 de situatie en de route (panelen per organisatie, taken voor de werknemer, wat vanzelf gaat, welke zaak). Per situatie een demo-bestand met kandidaat, bronnen, fasen en gebeurtenissen als sjablonen; de pagina's laden alle situaties server-side en kiezen client-side. Zaak en besluit krijgen één generieke route per situatie.

**Tech Stack:** Next.js 16, React 19, TypeScript, RHC, regelrecht-uitleg WASM, Node 24 `node:test`.

**Spec:** `ontwerp-fase2-per-situatie-v1.md` (zelfde map). Fase 1: `ontwerp-orientatie-alle-uitkomsten-v1.md`.

## Global Constraints

- Situaties en identifiers heten naar de situatie: `gemeente`, `wajong`, `wia`, `register`, `uitleg`, `weetniet`. Geen persona-namen in koppen, tests, ids of bestandsnamen van nieuwe bestanden; een kandidaat op het scherm mag een naam hebben.
- Nooit te gunstig; aannames met een (i) (`InfoToggletip`).
- Wat de werknemer volgens de wet aanvraagt (doelgroepverklaring Wtl 2.7, voorzieningen Wajong 2:22 en WIA 35) is een taak voor de werknemer, geen paneel van de werkgever.
- Geen wijziging aan `public/regelrecht/**`. Geen nieuwe dependencies.
- Classes `mox-`/`rhc-mox-`; geen Tailwind; B1; geen "niet X maar Y"-zinnen.
- Commits als `Ravi Meijer <ravi.meijer@rijksoverheid.nl>`, zonder Co-Authored-By; niet pushen.

## Review Focus

- Wisselen van situatie na indienen (oriëntatie opnieuw): de oude zaak blijft van de oude situatie; de nieuwe route begint schoon. Test in Task 3.
- Wajong met loonwaarde 100 of uurloon boven het minimumloon: geen paneel loondispensatie; route wordt overzicht. Test in Task 1.
- WIA + register: route WIA, loonkostenvoordeel arbeidsgehandicapte in "via de loonaangifte". Test in Task 1.
- Oude link `/lopendezaken/loonkostensubsidie-koen` en oude zaak in `moza-zaken`: komen uit op de nieuwe zaakpagina. Test in Task 7.
- Persona-wissel: alle nieuwe opslag wordt gewist. Test in Task 3.

---

### Task 1: Situatie en route (puur)

**Files:** Create `_route.ts`; Test `scripts/iemand-aannemen-uitkomsten.test.mjs` (uitbreiden).

**Interfaces:**
- Consumes: `Doelgroep`, `Uitkomsten`, `Regel`, `Overig` uit `_uitkomsten.ts`.
- Produces:
  - `type Situatie = "gemeente" | "wajong" | "wia" | "register" | "uitleg" | "weetniet"`
  - `situatieVan(doelgroepen: Doelgroep[]): Situatie` — volgorde wajong > wia > bijstand (gemeente) > register > beschut/wsw/geen (uitleg) > weetniet of leeg.
  - `type PaneelId = "lks" | "jc" | "wpa" | "pp" | "ld"`; `type TaakId = "doelgroepverklaring" | "vz_wajong" | "vz_wia"`; `type VanzelfId = "lkv" | "nrp"`.
  - `type Route = { situatie: Situatie; panelen: { organisatie: "gemeente" | "uwv"; ids: PaneelId[] }[]; taken: TaakId[]; vanzelf: VanzelfId[]; zaak: Situatie | null; overzicht: boolean }`
  - `routeVoor(doelgroepen: Doelgroep[], u: Uitkomsten): Route`

- [ ] Tests (RED eerst), met `reken()` uit de bestaande tabel:
  - `situatieVan`: `["bijstand"]`→gemeente; `["register","wajong"]`→wajong; `["register","wajong","wia"]`→wajong; `["register","wia"]`→wia; `["register"]`→register; `["beschut"]`, `["wsw"]`, `["geen"]`→uitleg; `["weetniet"]` en `[]`→weetniet.
  - gemeente, 60: panelen `[{gemeente,[lks,jc,wpa,pp]}]`, taken `[]`, vanzelf `[lkv,nrp]`, zaak gemeente, overzicht false.
  - gemeente, 100: geen `lks` (de engine geeft geen recht); jc/pp blijven als de engine ze geeft; zaak gemeente.
  - wajong, 70: panelen `[{uwv,[ld]}]`, taken `[vz_wajong]`, vanzelf `[lkv,nrp]`, zaak wajong.
  - wajong, 100: panelen `[]`, taken `[vz_wajong]`, overzicht true, zaak null.
  - wajong, 70, uurloon 2000: panelen `[]`, overzicht true.
  - wia, 100: panelen `[]`, taken `[doelgroepverklaring, vz_wia]`, vanzelf `[lkv,nrp]`, zaak wia, overzicht false.
  - register: panelen `[]`, taken `[]`, vanzelf `[lkv,nrp]`, zaak null, overzicht true.
  - uitleg en weetniet: overzicht true, zaak null.
- [ ] Implementeer. Gemeente-panelen: `lks` alleen bij regel lks; `jc` bij overig begeleiding; `pp` bij overig pp_pwet; `wpa` altijd bij gemeente (Pwet 10, keuze van de werkgever). Wajong: `ld` bij regel ld. WIA: doelgroepverklaring bij regel lkv met categorie `arbeidsgehandicapte_werknemer`; `vz_wia` bij overig vz_wia. `lkv` in vanzelf bij regel lkv; `nrp` bij overig nrp.
- [ ] `node --test …` PASS; commit `feat: route na de oriëntatie per situatie`.

### Task 2: Demo per situatie

**Files:** Create `src/demo/iemand-aannemen-wajong.json`, `src/demo/iemand-aannemen-wia.json`; Modify `src/demo/iemandAannemen.ts`, `src/demo/index.ts`; Test (uitbreiden).

**Interfaces:**
- Produces: `getDemoIemandAannemenSituaties(): Promise<Record<"gemeente" | "wajong" | "wia", DemoAannemen>>` (gemeente = het bestaande `iemand-aannemen-koen.json`). `DemoAannemenFase.id` en `DemoAannemenGebeurtenis.stap` worden `string`; `DemoAannemen.zaak.url` wordt `/lopendezaken/iemand-aannemen/<situatie>`. Nieuw optioneel veld `DemoAannemen.besluit: { organisatie: string; datum: string; bezwaar: string }`.
- Sjabloon-plaatshouders (naast `{onderneming}` en `{iban}`): `{uren}`, `{loonwaarde}`, `{lksPerMaand}`, `{lksTweeMaanden}`, `{aanspraakPerUur}`, `{lkvPerJaar}`.

- [ ] Test: voor elke situatie: fasen-ids uniek; elke `gebeurtenis.stap` is `vooraf` of een fase-id; elke `{…}` in teksten zit in de lijst hierboven; `zaak.url` eindigt op de situatie; bronnen-ids ⊂ `uwv|gemeente|kvk|belastingdienst|eigen` (Wajong en WIA zonder gemeente).
- [ ] Gemeente-bestand: vaste bedragen en percentages in gebeurtenissen en `komtHierna` vervangen door plaatshouders; `zaak.url` → `/lopendezaken/iemand-aannemen/gemeente`; `besluit` toevoegen (college, 2026-11-03, "zes weken, Awb 6:7").
- [ ] Wajong: kandidaat (andere naam en woonplaats dan gemeente), bronnen UWV (Wajong met arbeidsondersteuning, doelgroepregister grond c), KVK, Belastingdienst, eigen; zaak UWV "Loondispensatie voor {kandidaat}"; fasen `ontvangst`, `onderzoek` (arbeidsdeskundige op de werkplek), `percentage`, `besluit`; gebeurtenissen met grond Wajong 2:20 en Besluit loondispensatie Wajong 1, 2, 3, 5; besluit UWV met "ten hoogste vijf jaar". Termijnen die niet in het corpus staan krijgen in de tekst "(aanname)".
- [ ] WIA: kandidaat, bronnen UWV (WIA-uitkering in de maand vóór aanvang), KVK, Belastingdienst, eigen; zaak UWV "Doelgroepverklaring voor {kandidaat}"; fasen `wacht` (wacht op de aanvraag van de werknemer), `aangevraagd`, `verstrekt`; gebeurtenissen met grond Wtl 2.6, 2.7 lid 1 en 3; geen `besluit` voor de werkgever (een weigering krijgt alleen de werknemer).
- [ ] PASS; commit `feat: demo-gegevens per situatie`.

### Task 3: Opslag per situatie

**Files:** Modify `_useAannemen.ts`, `src/app/(public)/_flags/personaPaneel.tsx` (alleen als er een nieuwe sleutel komt); Test (uitbreiden; pure delen in `_route.ts`).

**Interfaces:**
- Produces: `AannemenStaat.zaken: Partial<Record<Situatie, { ingediend: boolean; verstuurdOp?: string; fase: string; vraag?: string }>>` en `AannemenStaat.taken: Partial<Record<TaakId, "open" | "aangevraagd" | "verstrekt">>`; migratie: oude `ingediend/verstuurdOp/fase/vraag` → `zaken.gemeente`. Pure helper in `_route.ts`: `migreerZaken(oud: { ingediend?: boolean; verstuurdOp?: string; fase?: string; vraag?: string; zaken?: … }): AannemenStaat["zaken"]`. `faseIndex(fase: string, fasen: { id: string }[]): number`.
- [ ] Tests: migratie van oude opslag (ingediend true, fase "besluit") → `{ gemeente: { ingediend: true, fase: "besluit", … } }`; nieuwe opslag ongewijzigd; `faseIndex` onbekend → 0.
- [ ] Alle lezers van `ingediend`, `fase`, `vraag` gaan via `zaken[situatie]` (zie de kaart in de bouwerscheck: `_personeelZaak.tsx`, `_zaakKoen.tsx`, `_besluit.tsx`, `_indienen.tsx`). Sleutel blijft `moza-iemand-aannemen`, dus de persona-wissel wist alles al.
- [ ] PASS, tsc; commit `refactor: zaken per situatie in de opslag`.

### Task 4: Gegevens per situatie

**Files:** Modify `gegevens/page.tsx`, `gegevens/_bronnen.tsx`, `_vragen.tsx` (link "Aanvraag laten invullen").

- [ ] De page laadt `getDemoIemandAannemenSituaties()` en geeft alle gevulde bronnen door; `_bronnen.tsx` kiest op `situatieVan(antwoorden.doelgroepen)` (weetniet → gemeente-bronnen).
- [ ] Weet niet: onder de bronnen de knop "Terug naar de oriëntatie" die `doelgroepen` zet op `["register", "bijstand"]` en naar de oriëntatie gaat; geen concept-aanvraag. Tekst: "Volgens deze gegevens staat de kandidaat in het doelgroepregister en krijgt die bijstand. De berekening gebruikt nu die gegevens."
- [ ] `_vragen.tsx`: "Aanvraag laten invullen" gaat bij `route.overzicht && situatie !== "weetniet"` naar `/personeel/iemand-aannemen/overzicht`; anders naar gegevens. De (i) "uitgewerkt voor één kandidaat" vervalt.
- [ ] Browsercheck gegevens voor gemeente, wajong, wia, weetniet: juiste bronnen, geen consolefouten. Commit.

### Task 5: Concept-aanvraag per route

**Files:** Modify `concept-aanvraag/page.tsx`, `concept-aanvraag/_aanvraag.tsx`, `_waarom.tsx`, `_balans.tsx` (`KorteBalans`).

**Interfaces:** `Waarom` krijgt naast `trace` een optionele prop `invoer: Invoer` (uit `invoerVoor`); met `invoer` rekent hij die, zonder trace-basis.

- [ ] Panelen uit `routeVoor`: per organisatie een kop ("Naar de gemeente", "Naar UWV") met de panelen; nieuw paneel `ld` (Gegevens: percentage "uw schatting, UWV stelt dit vast", aanspraak per uur, uren, aanvang; Waarom met `invoer` loondispensatie). Bestaande panelen blijven, met Waarom via `invoer`.
- [ ] Sectie "Taken voor de werknemer" (doelgroepverklaring: "binnen drie maanden na de start, bij UWV; u bewaart de verklaring bij de loonadministratie"; vz_wajong/vz_wia) en "Gaat vanzelf of via de loonaangifte" (lkv met bedrag uit de engine, nrp met duur).
- [ ] Teller "Gecontroleerd n van N" over de panelen; geen panelen (WIA) → geen teller, knop "Klaar".
- [ ] Intro: "zeven regelingen nagelopen" wordt per route ("{n} regelingen gelden voor deze situatie").
- [ ] `KorteBalans` rekent met de echte antwoorden (geen vaste bijstand).
- [ ] Browsercheck gemeente/wajong/wia, 1280 en 390; commit.

### Task 6: Indienen, verstuurd, overzicht

**Files:** Modify `indienen/_indienen.tsx`, `indienen/page.tsx`, `verstuurd/page.tsx`; Create `overzicht/page.tsx` + `overzicht/_overzicht.tsx`; Modify `src/layouts/breadcrumb/index.tsx` (labels "overzicht", "iemand-aannemen" onder Lopende zaken).

- [ ] Indienen: blokken per organisatie uit de route, "Taken voor de werknemer", "Gaat vanzelf". `indienen()` zet `zaken[situatie] = { ingediend: true, verstuurdOp: "2026-10-05", fase: <eerste fase> }` en `voegZaakToe` met de zaak van de situatie.
- [ ] WIA: geen indienen; "Klaar" zet `zaken.wia = { ingediend: true, fase: "wacht" }`, `taken.doelgroepverklaring = "open"`, voegt de zaak toe en gaat naar de zaak.
- [ ] Verstuurd: organisatie en datum uit de zaak van de situatie.
- [ ] Overzicht: register (loonaangifte met bedrag, no-riskpolis), uitleg (beschut/wsw/geen met de (i)-teksten uit fase 1 als lopende tekst), en "Bij deze antwoorden is er niets aan te vragen." als de route door de engine leeg werd.
- [ ] Browsercheck; commit.

### Task 7: Zaak en besluit per situatie

**Files:** Create `lopendezaken/iemand-aannemen/[situatie]/page.tsx`, `…/[situatie]/_zaak.tsx`, `…/[situatie]/besluit/page.tsx`, `…/[situatie]/besluit/_besluit.tsx`; Modify `lopendezaken/loonkostensubsidie-koen/page.tsx` en `besluit/page.tsx` (redirect naar `…/iemand-aannemen/gemeente[/besluit]`), `lopendezaken/_assistentZaken.ts` (`zaakRoute`), `_personeelZaak.tsx`; Create pure `vulSjabloon(tekst: string, w: Record<string, string>): string` in `_route.ts`.

- [ ] Test `vulSjabloon` (onbekende plaatshouder blijft staan) en `waardenVoor(a: Antwoorden, u: Uitkomsten): Record<string, string>` in `_route.ts` (gemeente 60/32: `lksPerMaand` "€ 897,41"; wajong 70: `aanspraakPerUur` "€ 10,49"; wia: `lkvPerJaar` "€ 5.075,20").
- [ ] `_zaak.tsx`: voortgang en tijdlijn uit `fasen` en `gebeurtenissen` van de situatie (geen vaste titels of bedragen in de component), gevuld met `vulSjabloon` en `waardenVoor` via `useUitkomsten`; "Voor de onderzoeker" met de fasen van de situatie; bij WIA ook de taakstand (werknemer vraagt aan → UWV verstrekt).
- [ ] `_besluit.tsx`: gemeente (zoals nu, getallen uit de engine), wajong (UWV, percentage, aanspraak per uur, ten hoogste vijf jaar, "Klopt dit niet?"); WIA heeft geen besluitpagina voor de werkgever (de verklaring staat in de zaak).
- [ ] Oude route en oude `moza-zaken`-regels komen uit op de nieuwe zaak.
- [ ] Browsercheck per situatie tot en met besluit; commit.

### Task 8: Afronden

- [ ] README bijwerken (route per situatie, demo-bestanden, sjablonen, testtabel).
- [ ] Browserrun van alle routes (gemeente, wajong, wia, register, uitleg, weetniet) op 1280 en 390, zonder consolefouten; `next build`.
- [ ] Review van de branch door een frisse reviewer; fixes; commit.
