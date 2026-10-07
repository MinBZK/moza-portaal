import type { DemoVraag } from "./binnenkort";
import type { DemoPersona } from "./personas";
import logboek from "./proef-activiteitenlog.json";

export type DemoVerwerking = {
  id: string;
  organisatie: string;
  /** Tijdstip als ISO-datum. */
  tijdstip: string;
  gegevens: { soort: string; waarde: string }[];
};

const SOORTEN: Record<string, string> = {
  telephone: "Telefoonnummer",
  email: "E-mailadres",
  postalAddress: "Postadres",
};

const slug = (tekst: string) =>
  tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);

/**
 * De contactgegevens in het logboek, voor het bedrijf van de persona. moza-poc
 * gebruikt voor iedereen dezelfde. Persona's hebben geen e-mailadres of
 * telefoonnummer: het e-mailadres volgt uit de website of de handelsnaam.
 */
const waardeVoor = (
  soort: string,
  origineel: string,
  bedrijf?: DemoPersona["bedrijf"],
) => {
  if (!bedrijf) return origineel;
  if (soort === "postalAddress") return bedrijf.postadres ?? origineel;
  if (soort === "email") {
    const website = "website" in bedrijf ? bedrijf.website : undefined;
    const domein = website
      ? new URL(website).hostname.replace(/^www\./, "")
      : `${slug(bedrijf.handelsnaam)}.nl`;
    return `info@${domein}`;
  }
  return origineel;
};

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

/**
 * Het activiteitenlogboek uit moza-poc (_data/activiteitenLogData.json),
 * nieuwste eerst.
 */
export const getDemoVerwerkingen = async (
  bedrijf?: DemoPersona["bedrijf"],
): Promise<DemoVerwerking[]> =>
  logboek
    .map((regel) => ({
      id: regel.id,
      organisatie: regel.source,
      tijdstip: regel.datetime,
      gegevens: regel.data.map(({ request, response }) => ({
        soort: SOORTEN[request] ?? request,
        waarde: waardeVoor(request, response, bedrijf),
      })),
    }))
    .sort((a, b) => b.tijdstip.localeCompare(a.tijdstip));

export const getDemoVerwerkingVerwachtingen = async (): Promise<string[]> =>
  verwachtingen;

export const getDemoVerwerkingVragen = async (): Promise<DemoVraag[]> => vragen;
