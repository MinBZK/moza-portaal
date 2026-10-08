import { Heading, Paragraph } from "@/components/rhc";
import { getFlagsFromServerCookie } from "../../actions";
import { ToggleFeature } from "./_toggleFeature";

const Page = async () => {
  const flags = await getFlagsFromServerCookie();

  return (
    <>
      <Heading level={1}>Instellingen</Heading>
      <div className="mox-card">
        <Heading level={2}>Beta instellingen</Heading>
        <Paragraph>
          Hieronder kun je experimentele functionaliteiten in- en uitschakelen.
          Deze beta-functies zijn nog in ontwikkeling en kunnen nog veranderen.
          Door ze te activeren help je ons deze nieuwe mogelijkheden te testen
          en te verbeteren. Je kunt de functies op elk moment weer uitschakelen.
        </Paragraph>

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
    </>
  );
};

export default Page;
