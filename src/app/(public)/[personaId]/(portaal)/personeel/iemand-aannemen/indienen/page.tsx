import { Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemen } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Indienen from "./_indienen";
import Stappen from "../_stappen";
import { werkgeverVan } from "../_werkgever";

/** Scherm 4: wat wordt ingediend, bij wie, en de bevestiging. */
const IndienenPage = async () => {
  const [aannemen, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
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
      <Indienen aannemen={aannemen} werkgever={werkgeverVan(organisatie)} />
    </>
  );
};

export default IndienenPage;
