---
name: rijkshuisstijl
description: "Gebruik bij ontwerp, styling, componenten, kleurgebruik, typografie, iconen en frontend-copy voor dit Nederlandse overheidsportaal volgens de Rijkshuisstijl."
---

# Rijkshuisstijl

Pas de Rijkshuisstijl toe op visuele en interactionele keuzes in dit project.

## Richtlijnen

- Gebruik de bestaande Rijksoverheid-kleuren en voor de uitzonderingen van MOx (MOBu en MOZa) `src/styles/rhc.css` in plaats van nieuwe hardcoded ontwerp-waarden.
- Geef voorkeur aan Rijks Sans en bestaande projecttypografie.
- Gebruik duidelijke, functionele layouts met weinig decoratie.
- Behoud herkenbare overheidsconventies voor navigatie, links, focus, formulieren en feedback.
- Gebruik bestaande iconen uit `src/styles/icons/` en houd ze schaalbaar met `viewBox="0 0 24 24"` en `currentColor`.
- Vermijd nieuwe hardcoded kleuren wanneer een bestaand token beschikbaar is.
- Controleer contrast, focus-indicatoren en responsive gedrag bij visuele wijzigingen.

## Projectlocaties

- Tokens en overrides MOx (MOBu/MOZa): `src/styles/rhc.css`
- Globale CSS: `src/styles/globals.css`
- Gedeelde layouts: `src/layouts/`
- SVG-iconen: `src/styles/icons/`
