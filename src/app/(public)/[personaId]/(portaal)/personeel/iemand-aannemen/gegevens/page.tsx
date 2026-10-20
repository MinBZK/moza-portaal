import { Alert, Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemen } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Bronnen from "./_bronnen";
import Stappen from "../_stappen";
import { vul, werkgeverVan } from "../_werkgever";

/** Stap 2: per bron wat de overheid al weet, met een vinkje per bron. */
const GegevensPage = async () => {
  const [aannemen, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getActieveOrganisatie(),
  ]);
  const werkgever = werkgeverVan(organisatie);
  const bronnen = aannemen.bronnen.map((bron) => ({
    ...bron,
    gegevens: bron.gegevens.map((g) => ({
      ...g,
      waarde: vul(g.waarde, werkgever),
    })),
  }));
  return (
    <>
      <Heading level={1}>Gegevens per bron</Heading>
      <Stappen huidige={2} />
      <Alert type="info">
        <Paragraph>
          Dit weet de overheid al over {aannemen.kandidaat.voornaam}{" "}
          {aannemen.kandidaat.achternaam} en over uw bedrijf. Per gegeven ziet u
          de bron, de datum en de vraag van de wet waarvoor het nodig is. Vink
          per bron aan dat de gegevens kloppen en gebruikt mogen worden; pas dan
          wordt er gerekend.
        </Paragraph>
      </Alert>
      <Bronnen bronnen={bronnen} />
    </>
  );
};

export default GegevensPage;
