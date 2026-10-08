import { Heading, Paragraph } from "@/components/rhc";
import PostcodesBeheer from "./_postcodesBeheer";
import PublicatiesOverzicht from "./_publicatiesOverzicht";

const BerichtenInUwBuurtPage = async () => {
  return (
    <>
      <Heading level={1}>Berichten over uw buurt</Heading>

      <div className="mox-card">
        <PostcodesBeheer />
      </div>

      <div className="mox-card">
        <Heading level={2}>Berichten over uw buurt</Heading>
        <Paragraph>
          Berichten die betrekking hebben op de omgeving van uw bedrijfsadres.
        </Paragraph>
        <PublicatiesOverzicht />
      </div>
    </>
  );
};

export default BerichtenInUwBuurtPage;
