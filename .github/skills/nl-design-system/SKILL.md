---
name: nl-design-system
description: "Gebruik bij NL Design System, Rijkshuisstijl Community-componenten, design tokens, componentkeuze, frontend-architectuur en consistente overheids-UI in dit project."
---

# NL Design System

Gebruik NL Design System-principes en de geïnstalleerde Rijkshuisstijl Community-pakketten waar die de bestaande UI kunnen vervangen of verbeteren.

## Richtlijnen

- Gebruik design tokens in plaats van losse waarden voor kleur, spacing, typografie, radius en focus.
- Importeer NLDS-design tokens en component-CSS één keer in `src/app/layout.tsx`.
- Gebruik React-componenten uit `@rijkshuisstijl-community/components-react` in pagina's of gedeelde componenten.
- Plaats herbruikbare projectwrappers in `src/components/` en grotere composities in `src/layouts/`.
- Controleer de actuele API van een component voordat props worden toegevoegd.
- Behoud bestaande projectconventies en vermijd parallelle componenten met dezelfde verantwoordelijkheid.
- Zorg dat NLDS-componenten binnen de bestaande `.rhc-theme`-scope renderen.
- Controleer responsive gedrag, toegankelijkheid en visuele aansluiting op de Rijkshuisstijl.

## Projectlocaties

- Root scope en globale imports: `src/app/layout.tsx`
- Gedeelde componenten: `src/components/`
- Layouts: `src/layouts/`
- Tokens en overrides MOx (MOBu/MOZa): `src/styles/rhc.css`
