import { Heading, Paragraph } from "@/components/rhc";
import PostcodesBeheer from "./_postcodesBeheer";
import PublicatiesOverzicht from "./_publicatiesOverzicht";

const BerichtenInUwBuurtPage = async () => {
  return (
    <>
      <Heading level={1}>Berichten over uw buurt</Heading>

      <div className="rhc-mox-card">
        <PostcodesBeheer />
      </div>

      <div className="rhc-mox-card">
        <Heading level={2}>Berichten bij uw postcodes</Heading>
        <Paragraph>
          Hier staan berichten over de omgeving van uw vestigingsadres.
        </Paragraph>
        <PublicatiesOverzicht />
      </div>
    </>
  );
};

export default BerichtenInUwBuurtPage;
