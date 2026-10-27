import { Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Indienen from "./_indienen";
import Stappen from "../_stappen";
import { werkgeverVan } from "../_werkgever";

/** Scherm 4: wat wordt ingediend, bij wie, en de bevestiging. */
const IndienenPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <>
      <Heading level={1}>Controleren en indienen</Heading>
      <Stappen huidige={3} />
      <Paragraph>
        Dit is wat u indient, en bij wie. Klopt er iets niet? Ga terug naar de
        aanvraag om het aan te passen.
      </Paragraph>
      <Indienen
        perSituatie={{ gemeente: situaties.gemeente, wajong: situaties.wajong }}
        werkgever={werkgeverVan(organisatie)}
      />
    </>
  );
};

export default IndienenPage;
