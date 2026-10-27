import type { DemoVraag } from "./binnenkort";
import type { DemoGegeven } from "./onderneming";

export type DemoOrganisatie = {
  id: string;
  naam: string;
  aangesloten: boolean;
  /** Gebruikt altijd uw centrale contactgegevens; niet uit te zetten (zoals in moza-poc). */
  vast?: boolean;
};

/**
 * Identiteiten met een profiel in de profielservice (profiel.mijnoverheidzakelijk.nl),
 * dezelfde als in moza-poc (react-islands/.../Contactgegevens.tsx). De persona's
 * van het prototype hebben daar (nog) geen eigen profiel.
 */
export type DemoProfielIdentiteit = {
  identificatieType: "KVK" | "BSN";
  identificatieNummer: string;
};

const profielIdentiteiten: Record<"zakelijk" | "prive", DemoProfielIdentiteit> =
  {
    zakelijk: { identificatieType: "KVK", identificatieNummer: "90006623" },
    prive: { identificatieType: "BSN", identificatieNummer: "000000036" },
  };

export const getDemoProfielIdentiteit = async (
  soort: "zakelijk" | "prive",
): Promise<DemoProfielIdentiteit> => profielIdentiteiten[soort];

const contactgegevens: DemoGegeven[] = [
  { label: "E-mailadres", waarde: "info@bloombv.nl" },
  { label: "Telefoonnummer", waarde: "(+31) (0)6 12 34 56 78" },
];

const organisaties: DemoOrganisatie[] = [
  {
    id: "kvk",
    naam: "Kamer van Koophandel (KVK)",
    aangesloten: true,
    vast: true,
  },
  {
    id: "belastingdienst",
    naam: "Belastingdienst",
    aangesloten: true,
    vast: true,
  },
  { id: "om", naam: "Openbaar Ministerie (OM)", aangesloten: false },
  {
    id: "rvo",
    naam: "Rijksdienst voor Ondernemend Nederland (RVO)",
    aangesloten: true,
  },
  {
    id: "rdw",
    naam: "Rijksdienst voor het Wegverkeer (RDW)",
    aangesloten: false,
  },
  { id: "svb", naam: "Sociale Verzekeringsbank (SVB)", aangesloten: false },
  {
    id: "uwv",
    naam: "Uitvoeringsinstituut Werknemersverzekeringen (UWV)",
    aangesloten: true,
  },
];

const kanalen: DemoGegeven[] = [
  { label: "Voorkeurskanaal", waarde: "E-mail" },
  { label: "Bellen", waarde: "Ik wil niet gebeld worden" },
];

const vragen: DemoVraag[] = [
  {
    vraag: "Wat gebeurt er als ik een organisatie aanvink?",
    antwoord:
      "Die organisatie gebruikt dan uw centrale contactgegevens. Wijzigt u uw e-mailadres, dan weten alle aangesloten organisaties dat meteen.",
  },
  {
    vraag: "Waarom kan ik niet elke organisatie uitzetten?",
    antwoord:
      "Sommige organisaties moeten u kunnen bereiken, bijvoorbeeld de Belastingdienst. Zij blijven uw gegevens gebruiken.",
  },
];

export const getDemoContactgegevens = async (): Promise<DemoGegeven[]> =>
  contactgegevens;

export const getDemoContactorganisaties = async (): Promise<
  DemoOrganisatie[]
> => organisaties;

export const getDemoContactkanalen = async (): Promise<DemoGegeven[]> =>
  kanalen;

export const getDemoContactvragen = async (): Promise<DemoVraag[]> => vragen;
