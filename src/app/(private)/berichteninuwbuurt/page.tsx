import Card from "@/components/card";
import PostcodesBeheer from "./_postcodesBeheer";
import PublicatiesOverzicht from "./_publicatiesOverzicht";

const BerichtenInUwBuurtPage = async () => {
  return (
    <>
      <h1 className="text-4xl">Berichten over uw buurt</h1>

      <Card>
        <PostcodesBeheer />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-2xl font-bold">Berichten over uw buurt</h2>
        <p className="text-sm text-neutral-600">
          Berichten die betrekking hebben op de omgeving van uw bedrijfsadres.
        </p>
        <PublicatiesOverzicht />
      </Card>
    </>
  );
};

export default BerichtenInUwBuurtPage;
