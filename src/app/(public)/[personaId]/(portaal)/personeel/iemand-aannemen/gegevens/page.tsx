import { Alert, Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import type { DemoAannemen } from "@/demo";
import Bronnen from "./_bronnen";
import Stappen from "../_stappen";
import { vul, werkgeverVan } from "../_werkgever";

/** Scherm 2: aanvraag laten invullen. Namens wie, de kandidaat, en per bron bevestigen. */
const GegevensPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  const werkgever = werkgeverVan(organisatie);
  const gevuld = (aannemen: DemoAannemen): DemoAannemen => ({
    ...aannemen,
    bronnen: aannemen.bronnen.map((bron) => ({
      ...bron,
      gegevens: bron.gegevens.map((g) => ({
        ...g,
        waarde: vul(g.waarde, werkgever),
      })),
    })),
  });
  const perSituatie = {
    gemeente: gevuld(situaties.gemeente),
    wajong: gevuld(situaties.wajong),
    wia: gevuld(situaties.wia),
  };
  return (
    <>
      <Heading level={1}>Aanvraag laten invullen</Heading>
      <Stappen huidige={2} />
      <Paragraph>
        Om de aanvragen in te vullen, halen we gegevens op bij de organisaties
        die ze al hebben. U hoeft ze dan niet zelf op te zoeken.
      </Paragraph>
      <Alert type="info">
        <Paragraph>
          Er wordt nog niets ingediend. De ingevulde aanvraag staat alleen in uw
          omgeving, tot u zelf besluit om in te dienen.
        </Paragraph>
      </Alert>
      <Bronnen perSituatie={perSituatie} werkgever={werkgever} />
    </>
  );
};

export default GegevensPage;
