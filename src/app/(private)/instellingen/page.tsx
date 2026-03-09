import Card from "@/components/card";
import { getFlagsFromServerCookie } from "../../actions";
import { ToggleFeature } from "./_toggleFeature";

const Page = async () => {
  const flags = await getFlagsFromServerCookie();

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
            flags={flags}
            featureLabel={"Mijn Zaken"}
            featureName="feature_MijnZaken"
          />
          <ToggleFeature
            flags={flags}
            featureLabel={"Mijn Taken"}
            featureName="feature_MijnTaken"
          />
          <ToggleFeature
            flags={flags}
            featureLabel={"Mijn Producten"}
            featureName="feature_MijnProducten"
          />
          <ToggleFeature
            flags={flags}
            featureLabel={"RegelRecht"}
            featureName="feature_RegelRecht"
          />
        </div>
      </Card>
    </>
  );
};

export default Page;
