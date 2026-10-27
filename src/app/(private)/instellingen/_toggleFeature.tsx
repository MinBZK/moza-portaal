"use client";

import {
  defaultFlags,
  FeatureFlagKey,
  FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import { setFeatureFlagsCookie } from "../../actions";
import { FormFieldCheckboxOption } from "@/components/rhc";

export const ToggleFeature = ({
  flags,
  featureLabel,
  featureName,
}: {
  flags: FeatureFlags;
  featureLabel: string;
  featureName: FeatureFlagKey;
}) => {
  const isToggled = flags[featureName];

  const handleToggle = async () => {
    setFeatureFlagsCookie({
      ...defaultFlags,
      ...flags,
      [featureName]: !flags[featureName], // toggle
    });
  };

  return (
    <FormFieldCheckboxOption
      label={featureLabel}
      checked={isToggled}
      onChange={handleToggle}
    />
  );
};
