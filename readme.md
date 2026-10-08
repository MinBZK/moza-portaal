# Portaal

![Project Pre-Alpha Status](https://img.shields.io/badge/life_cycle-pre_alpha-red)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/MinBZK/moza-portaal/badge)](https://scorecard.dev/viewer/?uri=github.com/MinBZK/moza-portaal)

## Styling

Dit project gebruikt **geen Tailwind** meer. Dat geldt voor nieuwe code en voor bestaande code die je aanpast.

1. Gebruik eerst een component van de Rijkshuisstijl Community (NL Design System). Importeer ze via `@/components/rhc`.
2. Volstaat een RHC-component niet, schrijf dan een eigen class met het voorvoegsel `mox-` in `src/styles/mox.css`. Gebruik daarin RHC-tokens (`--rhc-space-*`, `--rhc-color-*`, `--rhc-text-*`) en geen losse waarden.
3. Afwijkingen op de RHC-tokens zelf (MOx, MOBu, MOZa) staan in `src/styles/rhc.css`.

`npm run lint` geeft een fout bij elke class in `className` die niet begint met `mox-`, `rhc-`, `utrecht-`, `nl-` of `ams-` (regel `mox/geen-tailwind` in `eslint-rules/`). Tailwind zelf is niet meer geïnstalleerd; de basisopmaak van de browser staat in `src/styles/globals.css`.

`npm run lint:css` controleert de CSS: logical properties en declaraties op alfabet. `npm run lint:css:fix` corrigeert dat automatisch.
