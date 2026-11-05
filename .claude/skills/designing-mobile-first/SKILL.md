---
name: designing-mobile-first
description: Use when designing, building, prototyping or reviewing any screen, page, component, flow, mockup or HTML artifact, especially layouts with a sidebar, sticky panel, live summary or total, step indicator, table, tiles or multiple columns.
---

# Mobile-first ontwerpen

## Overzicht

Ontwerp eerst voor het kleinste scherm (320 px breed) en bouw daarna uit
naar groter. Een desktopontwerp dat op mobiel alleen onder elkaar valt, is
niet mobile-first: de volgorde klopt dan zelden met de taak, en wat naast
elkaar werkte (een vraag en het bedrag dat ervan afhangt) raakt uit beeld.

## Werkwijze

1. **Begin bij de taak op 320 px.** Wat moet de gebruiker zien terwijl die de
   taak doet? Leg de volgorde vast voor één kolom. Pas daarna de verdeling
   over kolommen op een breed scherm.
2. **Houd terugkoppeling bij de invoer.** Verandert een bedrag, totaal of
   status door een antwoord, dan moet dat op mobiel in beeld zijn bij die
   invoer. Kies een compacte vorm: een tussenstand direct onder de vraag, of
   een smalle balk onderaan met totaal en hoofdknop. Een zijvak dat op mobiel
   onderaan belandt, is daarvoor geen oplossing.
3. **Schrijf CSS van klein naar groot.** De basisregels gelden voor mobiel;
   uitbreiden met `@media (width >= 768px)` en `(width >= 1024px)`.
   `(width < 768px)` alleen om iets ongedaan te maken. In moza-portaal: de
   RHC-grid (`rhc-grid__cell-t-*`) geldt vanaf 768 px, daaronder één kolom.
4. **Inhoud past zich aan.** Geen vaste breedtes; lange Nederlandse woorden
   breken af (`overflow-wrap: anywhere` of `hyphens: auto` met `lang="nl"`);
   tabellen worden op mobiel een lijst of een `dl`; stappenbalken tonen op
   mobiel alleen de huidige stap met "Stap 2 van 4".
5. **Bediening met de duim.** Klikdoelen minstens 24 bij 24 px (WCAG 2.5.8),
   liefst 44. Niets alleen via hover. Uitleg (i) opent met tikken. Velden
   krijgen het juiste `type`, `inputmode` en `autocomplete`. Een
   vastgezette balk mag de focus niet bedekken (WCAG 2.4.11): geef de pagina
   `scroll-padding` ter hoogte van die balk.

## Controle

Controleer op 320, 390 en 1280 px breed. Maak een schermafbeelding van elk,
en meet:

| Meting | Eis |
|---|---|
| `document.documentElement.scrollWidth` | gelijk aan de breedte van het venster (WCAG 1.4.10) |
| Hoofdknop en live totaal | in beeld, of binnen één scherm na de invoer die ze verandert |
| Klikdoelen | minstens 24 px, liefst 44 |
| Focus op een veld onder een vaste balk | niet bedekt |
| Tekst | niet afgekapt, geen woord buiten zijn vak |

Noem in je oplevering eerst hoe het op mobiel werkt, daarna wat er op een
breed scherm verandert.

## Veelgemaakte fouten

| Fout | Beter |
|---|---|
| Zijvak met totaal en knop valt op mobiel onder een lang formulier | Compacte balk of tussenstand bij de invoer |
| Alleen op 390 px getest | Ook 320 px: dat is 400 procent zoom op een laptop |
| Desktop-CSS met `max-width`-uitzonderingen | Basis = mobiel, uitbreiden met `min-width` |
| Tabel met vier kolommen op mobiel | Lijst of `dl` per rij |
| Stappenbalk met vier labels naast elkaar op 320 px | "Stap 2 van 4" met de naam van de huidige stap |
