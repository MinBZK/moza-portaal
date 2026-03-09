"use client";

import {
  defaultFlags,
  FeatureFlagKey,
  FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import { setFeatureFlagsCookie } from "../../actions";

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
    <div className="flex items-center gap-3">
      <label className="text-base font-medium">{featureLabel}</label>

      <div
        className={`flex h-6 w-12 cursor-pointer items-center rounded-full border border-gray-300 shadow-2xl transition-all duration-100 ${
          isToggled ? "bg-blue-100" : "bg-gray-100"
        }`}
        onClick={handleToggle}
        role="switch"
        aria-checked={isToggled}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleToggle();
        }}
      >
        <div
          className={`flex h-6 w-6 transform items-center justify-center rounded-full shadow-lg transition-transform duration-400 ${
            isToggled
              ? "bg-primary translate-x-[22px]"
              : "translate-x-0 bg-gray-600"
          }`}
        />
      </div>
    </div>
  );
};
