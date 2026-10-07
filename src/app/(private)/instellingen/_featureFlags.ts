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
  // Functionaliteit.
  {
    key: "mox_delen",
    label: "Delen",
    groep: "functionaliteit",
    standaard: true,
    werkt: true,
  },
  {
    key: "mox_accountwisselaar",
    label: "Accountwisselaar",
    groep: "functionaliteit",
    standaard: false,
    werkt: false,
  },
  {
    key: "mox_berichtenboxUnhappyFlow",
    label: "Berichtenbox unhappy flow",
    groep: "functionaliteit",
    standaard: false,
    werkt: false,
  },
  {
    key: "mox_dynamischeBerichten",
    label: "Dynamische berichten",
    groep: "functionaliteit",
    standaard: false,
    werkt: false,
  },
  {
    key: "mox_inlogflow",
    label: "Inlogflow",
    groep: "functionaliteit",
    standaard: false,
    werkt: false,
  },
  {
    key: "mox_inloggenBewindvoerder",
    label: "Inloggen als bewindvoerder, curator of mentor",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
  },
  {
    key: "mox_inloggenKind",
    label: "Inloggen voor een kind onder de 12",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
  },
  {
    key: "mox_inloggenMachtiging",
    label: "Inloggen met een machtiging",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
  },
  {
    key: "mox_inloggenMezelf",
    label: "Inloggen voor mezelf",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
  },
  {
    key: "mox_inloggenOnderneming",
    label: "Inloggen voor mijn onderneming",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
  },
  {
    key: "mox_statusBronnenAssistent",
    label: "Status van bronnen in de Digitale assistent",
    groep: "functionaliteit",
    standaard: false,
    werkt: false,
  },
  {
    key: "mox_zakelijkPostvak",
    label: "Zakelijk postvak",
    groep: "functionaliteit",
    standaard: true,
    werkt: false,
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
