import personas from "./personas.json";

/**
 * Persona's uit moza-poc (_data/personas.json). Elke persona is een ondernemer
 * met een eigen bedrijf. De id staat in de URL als personaId.
 */
export type DemoPersona = (typeof personas)[number];

/** De persona waarmee het prototype opent. In moza-poc gemarkeerd als actief. */
export const STANDAARD_PERSONA_ID =
  personas.find((persona) => persona.actief)?.id ?? personas[0].id;

/**
 * Oude id's uit de inlogknoppen op de landingspagina. Ze blijven werken en
 * openen de standaardpersona.
 */
const ALIASSEN: Record<string, string> = {
  "1111": STANDAARD_PERSONA_ID,
  "9999": STANDAARD_PERSONA_ID,
};

export const getDemoPersonas = async (): Promise<DemoPersona[]> => personas;

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
    personas.find((persona) => persona.id === id) ??
    personas.find(
      (persona) => persona.label.toLowerCase() === sleutel.toLowerCase(),
    )
  );
};
