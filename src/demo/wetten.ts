import type { DemoOnderdeel } from "./types";
import proefRegelgeving from "./proef-regelgeving.json";

export type DemoWet = DemoOnderdeel & {
  bron: string;
  ingangsdatum: string;
  voorWie: string;
  alinea: string[];
  /** Eigen vraag voor de digitale assistent, alleen bij enkele regels. */
  assistentVraag?: string;
  websiteLabel: string;
  href: string;
};

// Uit moza-poc (_data/regelgevingData.json). Welke regels een gebruiker ziet,
// hangt af van de persona (persona.regelgeving).
const wetten: DemoWet[] = proefRegelgeving.map((regel) => ({
  id: regel.id,
  titel: regel.titel,
  samenvatting: regel.beschrijving,
  bron: regel.bron,
  ingangsdatum: regel.inwerkingtreding,
  voorWie: regel.geldtVoor,
  alinea: regel.inhoud,
  assistentVraag: regel.assistentVraag ?? undefined,
  websiteLabel: "Bekijk op de website van wetten.overheid.nl",
  href: regel.externUrl,
}));

/**
 * Fictieve wetten en regels voor demo-doeleinden. Zie ./README.md
 * @param ids Selectie en volgorde, zoals persona.regelgeving. Zonder ids: alles.
 */
export const getDemoWetten = async (ids?: string[]): Promise<DemoWet[]> =>
  ids ? ids.flatMap((id) => wetten.find((wet) => wet.id === id) ?? []) : wetten;

export const getDemoWetById = async (
  id: string,
): Promise<DemoWet | undefined> => wetten.find((wet) => wet.id === id);
