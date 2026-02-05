import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export type FeatureFlagKey =
  | "feature_MijnZaken"
  | "feature_MijnTaken"
  | "feature_MijnProducten"
  | "feature_RegelRecht";

type FeatureFlagsState = {
  flags: Record<FeatureFlagKey, boolean>;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
  toggleFlag: (key: FeatureFlagKey) => void;
  isEnabled: (key: FeatureFlagKey) => boolean;
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      flags: {
        feature_MijnZaken: false,
        feature_MijnTaken: false,
        feature_MijnProducten: false,
        feature_RegelRecht: false,
      },

      setFlag: (key, value) =>
        set((state) => ({
          flags: { ...state.flags, [key]: value },
        })),

      toggleFlag: (key) =>
        set((state) => ({
          flags: { ...state.flags, [key]: !state.flags[key] },
        })),

      isEnabled: (key) => get().flags[key],
    }),
    {
      name: "feature-flags", // localStorage key
      partialize: (state) => ({ flags: state.flags }), // only persist flags
      skipHydration: true,
    },
  ),
);

export const useHydratedFeatureFlags = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useFeatureFlagsStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
};
