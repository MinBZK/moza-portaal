import type { DemoOnderdeel } from "./types";

/** Onderwerp over personeel; alleen een onderwerp met href is al uitgewerkt. */
export type DemoPersoneelsonderwerp = DemoOnderdeel & { href?: string };

const onderwerpen: DemoPersoneelsonderwerp[] = [
  {
    id: "iemand-aannemen",
    titel: "Iemand aannemen met afstand tot de arbeidsmarkt",
    samenvatting: "U ziet vooraf welke regelingen voor u kunnen gelden.",
    href: "/personeel/iemand-aannemen",
  },
  {
    id: "personeel-aannemen",
    titel: "Personeel aannemen",
    samenvatting: "Dit regelt u als u een nieuwe werknemer in dienst neemt.",
  },
  {
    id: "loonheffingen",
    titel: "Loonadministratie en loonheffingen",
    samenvatting:
      "Over het loon van uw werknemers betaalt u loonheffingen aan de Belastingdienst.",
  },
  {
    id: "ziekte-en-verzuim",
    titel: "Ziekte en verzuim",
    samenvatting:
      "Als een werknemer ziek is, betaalt u het loon meestal 2 jaar door.",
  },
  {
    id: "arbeidsvoorwaarden",
    titel: "Arbeidsvoorwaarden en cao",
    samenvatting:
      "Afspraken over loon, werktijden en verlof staan in het contract of de cao.",
  },
  {
    id: "scholing",
    titel: "Scholing en ontwikkeling",
    samenvatting:
      "Voor de opleiding van uw werknemers kunt u soms subsidie krijgen.",
  },
  {
    id: "buitenlandse-werknemers",
    titel: "Werknemers uit het buitenland",
    samenvatting:
      "Voor werknemers van buiten de Europese Unie hebt u soms een vergunning nodig.",
  },
  {
    id: "ontslag",
    titel: "Ontslag",
    samenvatting:
      "Een werknemer ontslaan mag alleen met een goede reden en volgens vaste regels.",
  },
];

/** Fictieve onderwerpen voor Personeel en de zoekresultaten. Zie ./README.md */
export const getDemoPersoneelsonderwerpen = async (): Promise<
  DemoPersoneelsonderwerp[]
> => onderwerpen;
