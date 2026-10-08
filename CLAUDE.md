# Moza Portaal

## Project

Moza Portaal is een Nederlands overheidsportaal gebouwd met Next.js, React en TypeScript.

## Architectuur

- Gebruik de Next.js App Router onder `src/app/`.
- Gebruik `src/components/` voor kleine herbruikbare UI-componenten.
- Gebruik `src/layouts/` voor gedeelde onderdelen zoals header, footer, navigatie en breadcrumb.
- Gebruik `src/network/` voor API-clients, fetchers, gegenereerde types en React Query-hooks.
- Gebruik `src/utils/` voor algemene hulpfuncties.
- Gebruik `src/styles/` voor globale styling, design tokens, fonts en iconen.

## React en Next.js

- Gebruik Server Components standaard.
- Voeg `"use client"` alleen toe wanneer state, effects, event handlers of client hooks nodig zijn.
- Gebruik `next/link` voor interne links en `next/image` voor afbeeldingen wanneer passend.
- Hergebruik bestaande layouts, componenten en hooks voordat je nieuwe abstractions toevoegt.
- Houd serverdata en API-logica in de netwerklaag; plaats geen fetch-logica in presentational components.
- Gebruik TypeScript zonder `any`; gebruik bestaande gegenereerde API-types waar mogelijk.

## Design en toegankelijkheid

- Gebruik geen Tailwind-classes, ook niet in bestaande code die je aanpast. Gebruik RHC-componenten (`@/components/rhc`). Waar die niet volstaan, schrijf je een eigen `mox-`-class in `src/styles/mox.css` met RHC-tokens.
- Volg de Rijkshuisstijl, het NL Design System en de bestaande design tokens.
- Gebruik NLDS/Rijkshuisstijl Community-componenten wanneer die passen.
- Gebruik tokens voor de uitzonderingen van MOx, MOBu en MOZa in `src/styles/rhc.css` in plaats van nieuwe hardcoded ontwerp-waarden.
- Gebruik semantische HTML, correcte headings, landmarks, keyboard navigation en zichtbare focus states.
- Gebruik `aria-current="page"` voor actieve paginalinks.
- Houd iconen schaalbaar met `viewBox="0 0 24 24"` en `currentColor`.
- Schrijf zichtbare teksten helder en op B1-niveau.

## Rijkshuisstijl en NL Design System

- Gebruik Rijks Sans en bestaande Rijksoverheid-kleuren en tokens.
- Gebruik design tokens voor kleur, spacing, typografie, radius en focus.
- Gebruik NLDS/Rijkshuisstijl Community-componenten wanneer die passen bij de taak.
- Importeer NLDS-design tokens en component-CSS één keer in `src/app/layout.tsx`.
- Laat NLDS-componenten binnen de `.rhc-theme`-scope renderen.
- Vermijd nieuwe hardcoded kleuren en parallelle componenten met dezelfde verantwoordelijkheid.

## WCAG en toegankelijkheid

- Bouw volgens WCAG 2.2 AA en EN 301 549.
- Gebruik semantische HTML voordat je ARIA toevoegt.
- Zorg voor toetsenbordbediening, logische focusvolgorde en zichtbare `:focus-visible`-stijlen.
- Geef links, knoppen, formulieren, afbeeldingen en statusmeldingen een duidelijke toegankelijke naam.
- Gebruik kleur nooit als enige informatiedrager.
- Controleer loading-, error-, empty- en disabled-states.

## B1 en overheidscommunicatie

- Schrijf korte, actieve zinnen met één boodschap per zin.
- Vermijd jargon, abstracte zelfstandige naamwoorden en onnodige Engelse termen.
- Geef knoppen een concrete actie, zoals `Opslaan`, `Verder` of `Opnieuw proberen`.
- Schrijf foutmeldingen oplossingsgericht: wat ging mis en wat kan de gebruiker doen?
- Gebruik consistente termen in navigatie, breadcrumbs, pagina's en formulieren.

## Werkwijze

- Houd wijzigingen klein en gericht op de vraag.
- Wijzig geen gegenereerde bestanden handmatig tenzij dat expliciet nodig is.
- Laat bestaande wijzigingen van de gebruiker staan.
- Voeg geen dependency of abstraction toe zonder duidelijke reden.
- Gebruik ASCII waar mogelijk en voeg alleen noodzakelijke codecommentaren toe.

## Validatie

Voer na wijzigingen de kleinst passende controles uit:

- `npx prettier --check <bestand>`
- `npx eslint <bestand>`
- `npm run type-check`
- `npm run build` bij wijzigingen aan routing, layouts of Server/Client Component-grenzen

Meld bestaande, niet-gerelateerde fouten apart en wijzig daar geen code voor.
