import { z } from "zod";

/**
 * Flags uit het Flags-paneel van moza-poc. `werkt: false` betekent dat de flag
 * in het paneel staat, maar dat de functie in dit prototype nog niet bestaat.
 */
export const MOX_FLAGS = [
  // Pagina's: verbergt het menu-item in de zijnavigatie.
  {
    key: "mox_pagina_berichtenbox",
    label: "Berichtenbox",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_lopendeZaken",
    label: "Lopende zaken",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_digitaleAssistent",
    label: "Digitale assistent",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_belastingen",
    label: "Belastingen",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_zakelijkVervoer",
    label: "Zakelijk vervoer",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_personeel",
    label: "Personeel en rollen",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_ziekteVerlof",
    label: "Ziekte en verlof",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_pagina_dataverwerking",
    label: "Gegevensdeling en dataverwerking",
    groep: "pagina",
    standaard: true,
    werkt: true,
  },
  // Huisstijl: aan = mox.css uit, zodat alleen RHC en rhc.css overblijven.
  {
    key: "mox_nieuweHuisstijl",
    label: "Nieuwe MijnOverheid huisstijl (in ontwikkeling)",
    groep: "huisstijl",
    standaard: false,
    werkt: true,
  },
  // Functionaliteit.
  {
    key: "mox_delen",
    label: "Delen",
    groep: "functionaliteit",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_berichtenboxUnhappyFlow",
    label: "Berichtenbox unhappy flow",
    groep: "functionaliteit",
    standaard: false,
    werkt: true,
  },
  {
    key: "mox_dynamischeBerichten",
    label: "Dynamische berichten",
    groep: "functionaliteit",
    standaard: false,
    werkt: true,
  },
  {
    key: "mox_statusBronnenAssistent",
    label: "Status van bronnen in de Digitale assistent",
    groep: "functionaliteit",
    standaard: false,
    werkt: true,
  },
] as const;

export type MoxFlagKey = (typeof MOX_FLAGS)[number]["key"];

const moxFlagsShape = Object.fromEntries(
  MOX_FLAGS.map((flag) => [flag.key, z.boolean()]),
) as Record<MoxFlagKey, z.ZodBoolean>;

// Define the schema with explicit keys
export const featureFlagsSchema = z.object({
  feature_MijnZaken: z.boolean(),
  feature_MijnTaken: z.boolean(),
  feature_MijnProducten: z.boolean(),
  feature_RegelRecht: z.boolean(),
  ...moxFlagsShape,
});

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
export type FeatureFlagKey = keyof FeatureFlags;

export const defaultFlags: FeatureFlags = {
  feature_MijnZaken: false,
  feature_MijnTaken: false,
  feature_MijnProducten: false,
  feature_RegelRecht: false,
  ...(Object.fromEntries(
    MOX_FLAGS.map((flag) => [flag.key, flag.standaard]),
  ) as Record<MoxFlagKey, boolean>),
};

/**
 * Berichtenbox A/B/C-test uit moza-poc. Eén variant tegelijk, bewaard in een
 * cookie. Met ?variant=b in de URL kies je er een voor een onderzoek.
 */
export const BERICHTENBOX_VARIANTEN = [
  { waarde: "a", label: "A: Huidige berichtenbox" },
  { waarde: "b", label: "B: Bericht met pdf-voorbeeld" },
  { waarde: "c", label: "C: Bericht met directe acties" },
] as const;

export type BerichtenboxVariant =
  (typeof BERICHTENBOX_VARIANTEN)[number]["waarde"];

export const BERICHTENBOX_VARIANT_COOKIE = "berichtenboxVariant";

export const isBerichtenboxVariant = (
  waarde: string | undefined | null,
): waarde is BerichtenboxVariant =>
  BERICHTENBOX_VARIANTEN.some((variant) => variant.waarde === waarde);
