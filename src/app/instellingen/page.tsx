"use client";
import Card from "@/components/card";
import {
  useFeatureFlagsStore,
  useHydratedFeatureFlags,
  type FeatureFlagKey,
} from "@/stores/featureFlags";

const Page = () => {
  return (
    <>
      <h1 className="text-4xl">Instellingen</h1>
      <Card className="space-y-5">
        <h2 className="text-3xl">Beta instellingen</h2>
        <p>
          Hieronder kun je experimentele functionaliteiten in- en uitschakelen.
          Deze beta-functies zijn nog in ontwikkeling en kunnen nog veranderen.
          Door ze te activeren help je ons deze nieuwe mogelijkheden te testen
          en te verbeteren. Je kunt de functies op elk moment weer uitschakelen.
        </p>

        <div className="space-y-5">
          <ToggleFeature
            featureLabel={"Mijn Zaken"}
            featureName="feature_MijnZaken"
          />
          <ToggleFeature
            featureLabel={"Mijn Taken"}
            featureName="feature_MijnTaken"
          />
          <ToggleFeature
            featureLabel={"Mijn Producten"}
            featureName="feature_MijnProducten"
          />
          <ToggleFeature
            featureLabel={"RegelRecht"}
            featureName="feature_RegelRecht"
          />
        </div>
      </Card>
    </>
  );
};

const ToggleFeature = ({
  featureLabel,
  featureName,
}: {
  featureLabel: string;
  featureName: FeatureFlagKey;
}) => {
  const isHydrated = useHydratedFeatureFlags();
  const isToggled = useFeatureFlagsStore((s) => s.flags[featureName]);
  console.log(isToggled);
  const toggleFlag = useFeatureFlagsStore((s) => s.toggleFlag);

  const handleToggle = () => toggleFlag(featureName);

  if (!isHydrated) return null;

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

export default Page;
