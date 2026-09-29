# Demo-data

Hier staat fictieve inhoud voor pagina's waarvoor nog geen API bestaat. Zo kun
je een pagina bouwen en laten zien zonder op een koppeling te wachten.

## Het profiel achter de demo-data

De inhoud is geschreven voor een ondernemer waarin veel gebruikers zich kunnen
herkennen:

- Een mkb-bedrijf met 5 tot 20 medewerkers.
- Een gehuurd bedrijfspand en een paar bedrijfsauto's.
- Personeel dat bijgeschoold moet worden.
- Vragen over digitale veiligheid.

Dat profiel is expres breed. Een adviesbureau, een installatiebedrijf en een
winkel moeten er alle drie iets in herkennen. Voeg je data toe, houd dan
hetzelfde profiel aan.

## Wat hier hoort

- Verzonnen inhoud voor een pagina: subsidies, wetten, berichten.
- Een functie per onderwerp die die inhoud teruggeeft.

## Wat hier niet hoort

- Echte gegevens van gebruikers of organisaties.
- API-clients, fetchers en React Query-hooks. Die horen in `src/network/`.
- Nagebootste API-endpoints. Daarvoor is `src/network/mock/`.

## Hoe gebruik je het

Importeer altijd uit `@/demo`, nooit uit een los bestand in deze map:

```tsx
import { getDemoSubsidies } from "@/demo";

const SubsidiesPage = async () => {
  const subsidies = await getDemoSubsidies();
  // ...
};
```

De functies zijn `async`, ook al halen ze niets op. Vervang je ze later door een
echte fetcher, dan hoeft de pagina niet te veranderen.

## Afscherming

Een eslint-regel verbiedt imports uit `@/demo` buiten `src/app/`. Demo-data kan
dus niet in componenten, layouts of de netwerklaag terechtkomen. Wil je demo-data
in een component gebruiken, geef die dan als prop mee vanuit de pagina.
