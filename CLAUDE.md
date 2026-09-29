# MijnOverheid Zakelijk – proefportaal

React/Next.js-frontend (App Router, React 19, TypeScript) van het MOZA-portaal voor ondernemers. Pre-alpha: een prototype, geen productie.

## Repo's

- `origin` = MinBZK/moza-proefportaal. PR's gaan hierheen, naar `main`.
- `upstream` = MinBZK/moza-portaal. Alleen lezen, geen PR's.

## Stack

- Next.js 16 met Turbopack, React Query 5, TanStack Form, Zod 4
- Auth: next-auth v5 (beta) met Keycloak, zie `src/auth.ts`
- API-clients: `openapi-fetch` met types uit `openapi-typescript`
- Styling: Tailwind v4 + `tailwind-variants` (`tv`)

## Structuur

- `src/app/(private)/` – ingelogde pagina's (berichtenbox, contactgegevens, zaken, …)
- `src/app/(public)/` – publieke pagina's
- `src/network/<service>/` – per backend-service een client (`index.ts`), gegenereerde types (`generated.ts`) en hooks
  - `hooks/<actie>/action.ts` – server action (`"use server"`) die de client aanroept
  - `hooks/<actie>/use<Actie>.ts` – React Query-hook om die action heen
- `src/components/`, `src/layouts/` – gedeelde UI
- `dependencies/` – OpenAPI-specs van de backends

## API-types

`src/network/**/generated.ts` nooit met de hand aanpassen. Wijzigt een backend-API, werk dan de spec in `dependencies/` bij en draai het bijbehorende script, bijvoorbeeld `npm run generate:profiel`. Haal types uit `components["schemas"][…]` in plaats van ze zelf te definiëren.

## Styling

De keuze tussen Tailwind houden en overstappen op NL Design System / Rijkshuisstijl Community is nog open. Op de branch `test-nlds-react-componenten` loopt een experiment met RHC. Volg tot die keuze valt de stijl van het bestand waarin je werkt en meng de twee systemen niet zonder overleg.

## Omgeving

Kopieer `example.env.local` naar `.env.local`. Nodig: service-URL's (`API_URL_*`) en Keycloak-gegevens (`AUTH_*`). Commit nooit `.env.local`.

## Werkwijze

- Code, UI-teksten en commits in het Nederlands. Teksten voor gebruikers volgen de schrijfwijzer: @docs/schrijfwijzer.md
- Commits: emoji uit de lijst hieronder plus korte Nederlandse zin.
- Branchnamen: `fix/…`, `feature/…`.

### Commitberichten

- 🎉 Initial commit
- 💄 Visual fix
- ➕ Added
- ✏️ Modified – wijziging aan bestaande code, geen nieuwe feature
- ❌ Deleted
- 🧼 Hygiene
- 🐛 Bugfix – fout in het gedrag van de app
- 💾 Backup
- 🔁 Renamed
- ↩️ Revert commit
- 🔀 IDE ↔︎ Figma
- ⬆️ Update/upgrade van bv. Dependencies
- 📄 Documentatie
- 📝 Tekstwijzigingen
- 🦵 Bump – versienummer ophogen
- ⚡ Optimalisatie
- 🧪 Test
- 🔧 Fix – build- of lintfout, geen bug in de app
- ✈️ Flow – complete gebruikersflow
- ⚙️ Configuratie
- 🚀 Release
- ♿️ a11y improvement

## Klaar = alles groen

Draai vóór je iets klaar meldt:

```sh
npm run lint
npm run type-check
npm run prettier
npm run build
```

Er zijn nog geen tests; CI draait alleen lint. `check.cjs` doet een pa11y-toegankelijkheidscheck tegen `localhost:3000` en draait handmatig.

## Skills

- UI-wijziging klaar: draai `toegankelijkheid-review`.
- Nieuwe of gewijzigde UI-tekst: `rijksoverheid-copy`, maar bij tegenstrijdigheid wint docs/schrijfwijzer.md.
- Nieuwe of gewijzigde gebruikersflow, of states (laden, leeg, fout, succes) en feedback na een actie: `interaction-design`.
