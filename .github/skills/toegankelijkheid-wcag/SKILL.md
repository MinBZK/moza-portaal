---
name: toegankelijkheid-wcag
description: "Gebruik bij toegankelijkheidsreviews, WCAG, EN 301 549, toetsenbordbediening, schermlezers, focus, contrast, formulieren en semantische HTML in dit project."
---

# Toegankelijkheid en WCAG

Beoordeel en bouw UI volgens WCAG 2.2 niveau AA en EN 301 549.

## Richtlijnen

- Gebruik semantische HTML voordat ARIA wordt toegevoegd.
- Zorg dat alle interactieve elementen met toetsenbord bedienbaar zijn.
- Gebruik zichtbare `:focus-visible`-stijlen en behoud een logische focusvolgorde.
- Geef links, knoppen, formulieren en statusmeldingen een duidelijke toegankelijke naam.
- Gebruik `aria-current="page"` voor de actieve paginalink; plaats het bij voorkeur op de link.
- Gebruik correcte heading-niveaus, landmarks en lijststructuren.
- Zorg voor voldoende kleurcontrast en gebruik kleur nooit als enige informatiedrager.
- Geef afbeeldingen passende `alt`-tekst; decoratieve afbeeldingen krijgen `alt=""`.
- Test loading-, error-, empty- en disabled-states met toetsenbord en schermlezer.

## Controle

Gebruik waar passend de bestaande linting en `pa11y`. Controleer wijzigingen minimaal met een toetsenbordflow en een gerichte toegankelijkheidscheck.
