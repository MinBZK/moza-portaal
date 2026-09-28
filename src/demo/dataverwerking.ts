import type { DemoVraag } from "./binnenkort";

export type DemoVerwerking = {
  id: string;
  organisatie: string;
  datum: string;
  gegevens: { soort: string; waarde: string }[];
};

const verwerkingen: DemoVerwerking[] = [
  {
    id: "kvk-14-juni",
    organisatie: "KVK",
    datum: "14 juni 2026, 14:23",
    gegevens: [
      { soort: "Telefoonnummer", waarde: "(+31) (0)6 12 34 56 78" },
      { soort: "E-mailadres", waarde: "info@bloombv.nl" },
    ],
  },
  {
    id: "belastingdienst-13-juni",
    organisatie: "Belastingdienst",
    datum: "13 juni 2026, 09:12",
    gegevens: [{ soort: "E-mailadres", waarde: "info@bloombv.nl" }],
  },
  {
    id: "uwv-2-juni",
    organisatie: "UWV",
    datum: "2 juni 2026, 11:47",
    gegevens: [
      { soort: "Loonheffingennummer", waarde: "062345681L01" },
      { soort: "Aantal werknemers", waarde: "7" },
    ],
  },
  {
    id: "rvo-28-mei",
    organisatie: "RVO",
    datum: "28 mei 2026, 16:05",
    gegevens: [
      { soort: "KVK-nummer", waarde: "62345681" },
      { soort: "Zakelijke IBAN", waarde: "NL62 RABO 0006 2345 68" },
    ],
  },
];

const verwachtingen = [
  "Bekijk welke overheidsorganisaties gegevens van uw bedrijf verwerken",
  "Zie welke gegevens zijn uitgewisseld en wanneer",
  "Beheer wie uw bedrijfsgegevens mag gebruiken",
];

const vragen: DemoVraag[] = [
  {
    vraag: "Welke gegevensverwerkingen zie ik hier?",
    antwoord:
      "Uitwisselingen van uw bedrijfsgegevens tussen overheidsorganisaties. Per regel ziet u wie de gegevens opvroeg, wanneer en welke gegevens het waren.",
  },
  {
    vraag: "Kan ik een verwerking tegenhouden?",
    antwoord:
      "Niet altijd. Veel organisaties mogen uw gegevens opvragen omdat de wet dat toestaat. Deelt u gegevens vrijwillig, dan kunt u die toestemming hier intrekken.",
  },
  {
    vraag: "Ik zie een verwerking die ik niet herken. Wat nu?",
    antwoord:
      "Neem contact op met de organisatie die in de regel staat. Komt u er niet uit, dan kunt u een melding doen bij de Autoriteit Persoonsgegevens.",
  },
];

export const getDemoVerwerkingen = async (): Promise<DemoVerwerking[]> =>
  verwerkingen;

export const getDemoVerwerkingVerwachtingen = async (): Promise<string[]> =>
  verwachtingen;

export const getDemoVerwerkingVragen = async (): Promise<DemoVraag[]> => vragen;
