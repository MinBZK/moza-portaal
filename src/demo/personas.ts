import personas from "./personas.json";

/**
 * Organisatiegegevens die bij een persona horen. Relaties met andere
 * organisaties hebben soms alleen een naam en rol.
 */
export type DemoBedrijfsorganisatie = {
  handelsnaam: string;
  functies?: string;
  website?: string;
  kvkNummer?: string;
  rsinNummer?: string;
  btwNummer?: string;
  omzetbelastingnummer?: string;
  startdatum?: string;
  rechtsvorm?: string;
  branche?: string;
  vestigingsadres?: string;
  gemeente?: string;
  rol?: string;
  vestigingsnummer?: string;
  iban?: string;
  loonheffingennummer?: string;
  werkzamePersonenFulltime?: number;
  werkzamePersonenParttime?: number;
  sbi?: { code: string; omschrijving: string }[];
  vestigingsadresVolledig?: string;
  postadres?: string;
  vestigingen?: { nummer: string; type: string; adres: string }[];
  ubo?: { naam: string; aardVanBelang: string; groottevanBelang: string }[];
  jaarrekeningen?: { jaar: string; gedeponeerd: string }[];
  energie?: { elektriciteitKwh: number; gasM3: number };
};

/** Persona's uit moza-poc. De id staat in de URL als personaId. */
export type DemoPersona = Omit<(typeof personas)[number], "organisaties"> & {
  organisaties: DemoBedrijfsorganisatie[];
};

const demoPersonas: DemoPersona[] = personas;

export const getDemoOrganisatieId = (organisatie: DemoBedrijfsorganisatie) =>
  organisatie.kvkNummer ?? organisatie.handelsnaam;

/** De persona waarmee het prototype opent. In moza-poc gemarkeerd als actief. */
export const STANDAARD_PERSONA_ID =
  demoPersonas.find((persona) => persona.actief)?.id ?? demoPersonas[0].id;

/**
 * Oude id's uit de inlogknoppen op de landingspagina. Ze blijven werken en
 * openen de standaardpersona.
 */
const ALIASSEN: Record<string, string> = {
  "1111": STANDAARD_PERSONA_ID,
  "9999": STANDAARD_PERSONA_ID,
};

export const getDemoPersonas = async (): Promise<DemoPersona[]> => demoPersonas;

/**
 * Zoekt een persona op id, alias of label (zoals in moza-poc: ?persona=Adviseur).
 * Geeft undefined als er geen persona bij hoort.
 */
export const getDemoPersona = async (
  idOfLabel: string | undefined,
): Promise<DemoPersona | undefined> => {
  if (!idOfLabel) return undefined;
  const sleutel = decodeURIComponent(idOfLabel);
  const id = ALIASSEN[sleutel] ?? sleutel;
  return (
    demoPersonas.find((persona) => persona.id === id) ??
    demoPersonas.find(
      (persona) => persona.label.toLowerCase() === sleutel.toLowerCase(),
    )
  );
};
