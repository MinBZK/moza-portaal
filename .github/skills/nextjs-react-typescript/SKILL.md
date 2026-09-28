---
name: nextjs-react-typescript
description: "Gebruik bij Next.js, React, TypeScript, App Router, Server Components, Client Components, React Query, componentarchitectuur, state management en performance in dit project."
---

# Next.js, React en TypeScript

Gebruik deze skill voor frontendwerk in dit Next.js-project. Sluit aan op de bestaande architectuur voordat je nieuwe abstractions of patronen toevoegt.

## Projectarchitectuur

- Gebruik `src/app/` voor routes, `page.tsx`, layouts, routegroepen en foutpagina's.
- Gebruik `src/components/` voor kleine herbruikbare UI-componenten.
- Gebruik `src/layouts/` voor gedeelde paginaonderdelen zoals header, footer, navigatie en breadcrumb.
- Gebruik `src/network/` voor API-clients, fetchers, gegenereerde types en React Query-hooks.
- Gebruik `src/utils/` voor algemene hulpfuncties die niet aan één pagina gekoppeld zijn.
- Gebruik bestaande componenten, hooks en design tokens voordat je nieuwe varianten maakt.

## Next.js en React

- Gebruik de App Router-conventies van Next.js.
- Maak componenten standaard Server Components; voeg `"use client"` alleen toe wanneer browser-API's, state, effects, event handlers of client hooks nodig zijn.
- Houd Server en Client Component-grenzen klein en bewust.
- Gebruik `next/link` voor interne navigatie en `next/image` voor lokale of externe afbeeldingen wanneer dat passend is.
- Gebruik layouts voor gedeelde structuur; dupliceer geen header, navigatie of breadcrumb in pagina's.
- Houd route-specifieke data en presentatie dicht bij de route, maar verplaats hergebruikte logica naar een passende component of hook.

## TypeScript

- Geef publieke componentprops expliciete types.
- Vermijd `any`; gebruik bestaande gegenereerde API-types of maak een gerichte typeguard.
- Laat discriminated unions en type narrowing de control flow beschrijven.
- Gebruik type-only imports waar passend.
- Houd nullability expliciet en los ontbrekende data op met een duidelijke loading-, empty- of error-state.

## Data en state

- Gebruik de bestaande netwerklaag en React Query-hooks voor serverdata.
- Vermijd fetch-logica rechtstreeks in presentational components.
- Gebruik lokale React-state alleen voor tijdelijke UI-state, zoals open/closed, selectie of formulierinteractie.
- Voeg geen `useMemo` of `useCallback` toe zonder aantoonbare reden; volg bestaande React Compiler- en projectconventies.
- Houd mutation-feedback, fouten en invalidatie dicht bij de mutation-hook of de feature die deze gebruikt.

## Componenten en styling

- Gebruik NL Design System- en Rijkshuisstijl-componenten wanneer die passen bij de taak.
- Gebruik tokens voor de uitzonderingen van MOx, MOBu en MOZa in `src/styles/rhc.css` in plaats van nieuwe hardcoded ontwerp-waarden.
- Houd iconen schaalbaar met `viewBox="0 0 24 24"` en `currentColor`.
- Bouw toegankelijke HTML: correcte landmarks, headings, links, knoppen, focus states en `aria-current="page"`.
- Schrijf zichtbare tekst volgens B1 en gebruik consistente labels in navigatie en breadcrumbs.

## Validatie

Voer na wijzigingen de kleinst passende controle uit:

- formattering: `npx prettier --check <bestand>`;
- linting: `npx eslint <bestand>`;
- types: `npm run type-check`;
- productiegedrag: `npm run build` wanneer routing, layouts of server/client-grenzen wijzigen.

Behandel bestaande, niet-gerelateerde fouten afzonderlijk en wijzig daarvoor geen code buiten de taak.
