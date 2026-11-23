# Portaal

![Project Pre-Alpha Status](https://img.shields.io/badge/life_cycle-pre_alpha-red)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/MinBZK/moza-portaal/badge)](https://scorecard.dev/viewer/?uri=github.com/MinBZK/moza-portaal)

## Styling

Dit project gebruikt **geen Tailwind** meer. Dat geldt voor nieuwe code en voor bestaande code die je aanpast.

1. Gebruik eerst een component van de Rijkshuisstijl Community (NL Design System). Importeer ze via `@/components/rhc`.
2. Volstaat een RHC-component niet, schrijf dan een eigen class. Layout en functionele opmaak die in elke huisstijl geldt, krijgt het voorvoegsel `rhc-mox-` in `src/styles/rhc.css` (de basis); zo is hij te onderscheiden van de classes van RHC zelf. Opmaak van het MOx-thema krijgt het voorvoegsel `mox-` in `src/styles/mox.css` (bovenop de basis). Opmaak die alleen voor het prototype is, zoals het Flags- en persona-paneel en de PoC-banner, staat in `src/styles/utils.css`, met het voorvoegsel `prototype-`. Gebruik overal RHC-tokens (`--rhc-space-*`, `--rhc-color-*`, `--rhc-text-*`) en geen losse waarden.
3. Afwijkingen op de RHC-tokens zelf (MOx, MOBu, MOZa) staan in `src/styles/rhc.css`.

`npm run lint` geeft een fout bij elke class in `className` die niet begint met `mox-`, `rhc-`, `prototype-`, `utrecht-`, `nl-` of `ams-` (regel `mox/geen-tailwind` in `eslint-rules/`). Tailwind zelf is niet meer geïnstalleerd; de basisopmaak van de browser staat in `src/styles/globals.css`.

`npm run lint:css` controleert de CSS: logical properties en declaraties op alfabet. `npm run lint:css:fix` corrigeert dat automatisch.

## Deployment

Deployments lopen via het ZAD platform. Zie: https://zad.rijksapp.nl/dashboard. Indien je geen toegang hebt tot deze pagina, neem dan contact op met Robert Uittenbroek en vraag aan je project-lead voor toegang tot het project `MOZa demo` (code: `md-a8y`).

### Previews

Zodra er een PR in Github geopend wordt, wordt er een preview-deployment afgetrapt die gezien kan worden op een URL zoals. Zie de PR URL in Github om te zien wat de URL is. Deze URLs zijn niet bedoeld om naar te verwijzen voor de lange termijn. Zodra er een nieuwe preview-deployment uitgevoerd wordt, worden de oude opgeruimd.

### Main

De main branch kan gedeployed worden door naar het project in Github te gaan, naar de tab 'actions'.
Klik links op 'deploy to zad' en dan op de button 'Run workflow' (selecteer de correcte branch: `main`). Na een korte tijd is de site gedeployed op https://proef.mijnoverheidzakelijk.nl.

### Oude proef-URL 1. proef.moza.rijksapp.nl

Er is nog een oude URL in de lucht waar de proef-site eerder naar gedeployed werd: https://proef.moza.rijksapp.nl/
Deze site redirect naar de nieuwe hoofd URL (zie **main deployment** hierboven) met behoud van pathnames.
Om iets te deployen op deze oude URL, gebruik je de branch-name `proef-moza-rijksapp-nl`. Zodra je iets pushed op deze branch wordt dit automatisch gedeployed naar https://proef.moza.rijksapp.nl/

### Oude proef-URL 2. moza.mijnoverheidzakelijk.nl

We hanteren voor de proef site nu `proef` als prefix, in plaats van het verwarrende `moza`.
Deze site wordt niet door ZAD gedeployed, maar via een pipeline in een infra-project in Gitlab. Dit is een oud overblijfsel van onze initiele werkwijze voor de MOZa-portaal.
Zo lang het infra-project nog live is, worden updates op de `main` branch nog gedeployed naar de URL https://moza.mijnoverheidzakelijk.nl.
Deze site redirect naar de nieuwe hoofd URL (zie **main deployment** hierboven) met behoud van pathnames.
