import { Heading } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Stappen from "../_stappen";
import { werkgeverVan } from "../_werkgever";
import Overzicht from "./_overzicht";

/** Eindpagina voor routes zonder aanvraag: wat geldt, wat de werknemer doet en wat vanzelf gaat. */
const OverzichtPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <>
      <Heading level={1}>Wat voor u geldt</Heading>
      <Stappen huidige={3} />
      <Overzicht
        labels={situaties.gemeente.labels}
        kvk={werkgeverVan(organisatie).kvkNummer}
      />
    </>
  );
};

export default OverzichtPage;
