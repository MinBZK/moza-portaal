import type { DemoOnderdeel } from "./types";
import proefSubsidies from "./proef-subsidies.json";

export type DemoSubsidie = DemoOnderdeel & {
  verstrekker: string;
  type: string;
  aanvraagperiode: string;
  maximaalBedrag?: string;
  /** Deel van het budget dat al is toegekend, in procenten. */
  budgetVergeven?: number;
  alinea: string[];
  websiteLabel: string;
  href: string;
};

// Uit moza-poc (_data/subsidiesData.json). Welke subsidies een gebruiker ziet,
// hangt af van de persona (persona.subsidies).
const subsidies: DemoSubsidie[] = proefSubsidies.map((subsidie) => ({
  id: subsidie.id,
  titel: subsidie.titel,
  samenvatting: subsidie.beschrijving,
  verstrekker: subsidie.verstrekker,
  type: subsidie.type,
  aanvraagperiode: subsidie.aanvraagperiode,
  maximaalBedrag: subsidie.maximaalBedrag ?? undefined,
  budgetVergeven: subsidie.budgetVergeven ?? undefined,
  alinea: subsidie.inhoud,
  websiteLabel: `Bekijk op de website van ${subsidie.verstrekker}`,
  href: subsidie.externUrl,
}));

/**
 * Fictieve subsidies voor demo-doeleinden. Zie ./README.md
 * @param ids Selectie en volgorde, zoals persona.subsidies. Zonder ids: alles.
 */
export const getDemoSubsidies = async (
  ids?: string[],
): Promise<DemoSubsidie[]> =>
  ids
    ? ids.flatMap(
        (id) => subsidies.find((subsidie) => subsidie.id === id) ?? [],
      )
    : subsidies;

export const getDemoSubsidieById = async (
  id: string,
): Promise<DemoSubsidie | undefined> =>
  subsidies.find((subsidie) => subsidie.id === id);
