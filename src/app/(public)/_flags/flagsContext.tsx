"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultFlags,
  type FeatureFlagKey,
  type FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";

const FlagsContext = createContext<FeatureFlags>(defaultFlags);

/** Geeft de flags uit het cookie door aan clientcomponenten. */
export const FlagsProvider = ({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: ReactNode;
}) => <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;

export const useFlag = (key: FeatureFlagKey) => useContext(FlagsContext)[key];
