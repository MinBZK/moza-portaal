import type { DemoVraag } from "./binnenkort";
import type { DemoGegeven } from "./onderneming";

export type DemoOrganisatie = {
  id: string;
  naam: string;
  aangesloten: boolean;
};

const contactgegevens: DemoGegeven[] = [
  { label: "E-mailadres", waarde: "info@bloombv.nl" },
  { label: "Telefoonnummer", waarde: "(+31) (0)6 12 34 56 78" },
];

const organisaties: DemoOrganisatie[] = [
  { id: "kvk", naam: "Kamer van Koophandel (KVK)", aangesloten: true },
  { id: "belastingdienst", naam: "Belastingdienst", aangesloten: true },
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
