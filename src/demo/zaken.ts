import type { DemoVraag } from "./binnenkort";

export type DemoZaak = {
  id: string;
  organisatie: string;
  onderwerp: string;
  gewijzigd: string;
  status: string;
  /** Toon een waarschuwing als er iets van u wordt verwacht */
  actieNodig?: boolean;
};

const zaken: DemoZaak[] = [
  {
    id: "omgevingsvergunning",
    organisatie: "Gemeente Lansingerland",
    onderwerp: "Omgevingsvergunning verbouwing bedrijfspand",
    gewijzigd: "21 mei 2026",
    status: "In behandeling genomen",
  },
  {
    id: "melding-openbare-ruimte",
    organisatie: "Gemeente Lansingerland",
    onderwerp: "Melding openbare ruimte",
    gewijzigd: "6 mei 2026",
    status: "Extra informatie opgevraagd",
    actieNodig: true,
  },
  {
    id: "subsidie-verduurzaming",
    organisatie: "Rijksdienst voor Ondernemend Nederland",
    onderwerp: "Subsidie aangevraagd",
    gewijzigd: "19 maart 2026",
    status: "Volledigheid gecontroleerd",
  },
  {
    id: "informatieplicht-energie",
    organisatie: "Rijksdienst voor Ondernemend Nederland",
    onderwerp: "Informatieplicht energiebesparing",
    gewijzigd: "2 maart 2026",
    status: "Afgehandeld",
  },
];

const vragen: DemoVraag[] = [
  {
    vraag: "Wat zijn lopende zaken?",
    antwoord:
      "Aanvragen, vergunningen en meldingen die u indiende bij de overheid en die nog in behandeling zijn. Per zaak ziet u hoe ver het staat.",
  },
  {
    vraag: "Hoe lang duurt de behandeling van mijn zaak?",
    antwoord:
      "Dat verschilt per zaak en per organisatie. Bij elke zaak ziet u de verwachte tijd en de huidige status. Duurt het langer dan wettelijk mag, dan krijgt u vanzelf bericht.",
  },
  {
    vraag: "Kan ik documenten toevoegen aan een lopende zaak?",
    antwoord:
      "Soms. Kan het bij uw zaak, dan ziet u daar een knop om bestanden toe te voegen. Staat die er niet, neem dan contact op met de organisatie die uw zaak behandelt.",
  },
];

export const getDemoZaken = async (): Promise<DemoZaak[]> => zaken;

export const getDemoZakenVragen = async (): Promise<DemoVraag[]> => vragen;
