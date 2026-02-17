import { z } from "zod";

// Define the schema with explicit keys
export const featureFlagsSchema = z.object({
  feature_MijnZaken: z.boolean(),
  feature_MijnTaken: z.boolean(),
  feature_MijnProducten: z.boolean(),
  feature_RegelRecht: z.boolean(),
});

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
export type FeatureFlagKey = keyof FeatureFlags;

export const defaultFlags: FeatureFlags = {
  feature_MijnZaken: false,
  feature_MijnTaken: false,
  feature_MijnProducten: false,
  feature_RegelRecht: false,
};
