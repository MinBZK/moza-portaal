import proefZaken from "./proef-zaken.json";
import type { DemoVraag } from "./binnenkort";

/** Stap in de voortgang van een zaak, zoals in moza-poc. */
export type DemoZaakStap = {
  titel: string;
  /** Afgerond = laatste stap van een afgehandelde zaak. */
  soort: "voltooid" | "huidig" | "volgende" | "later" | "afgerond";
  /** Datum als tekst, soms met "sinds" of "verwacht voor". */
  datum?: string;
  /** Standaard uitgeklapt. */
  open?: boolean;
  tekst?: string[];
  /** Er wordt iets van de ondernemer verwacht. */
  waarschuwing?: string;
  /** Gegevens die de ondernemer nog moet aanleveren. */
  aanleveren?: { intro: string; items: string[]; knop: string };
};

export type DemoZaak = {
  id: string;
  soort: "lopend" | "afgehandeld";
  titel: string;
  organisatie: string;
  /** Laatste wijziging, of de datum van afhandeling. */
  datum: string;
  /** Status in het overzicht. Alleen bij lopende zaken. */
  status?: string;
  /** Toon een waarschuwing als er iets van u wordt verwacht. */
  actieNodig?: boolean;
  /** Toon "Over deze zaak" boven de voortgang (zoals bij de subsidie). */
  gegevensBovenaan?: boolean;
  gegevens: { label: string; waarde: string }[];
  stappen: DemoZaakStap[];
};

// Uit moza-poc (moza/lopende-zaken/*.html). Zaaknummers en data zijn fictief.
const zaken = proefZaken as DemoZaak[];

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

export const getDemoZaken = async (
  soort: DemoZaak["soort"] = "lopend",
): Promise<DemoZaak[]> => zaken.filter((zaak) => zaak.soort === soort);

export const getDemoZaakById = async (
  id: string,
): Promise<DemoZaak | undefined> => zaken.find((zaak) => zaak.id === id);

export const getDemoZakenVragen = async (): Promise<DemoVraag[]> => vragen;
