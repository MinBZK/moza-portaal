import type { Metadata } from "next";
import { Heading } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Stappen from "../_stappen";
import { werkgeverVan } from "../_werkgever";
import Overzicht from "./_overzicht";

export const metadata: Metadata = {
  title: "Wat voor u geldt - Personeel en rollen",
};

/** Eindpagina voor routes zonder aanvraag: wat geldt, wat de werknemer doet en wat vanzelf gaat. */
const OverzichtPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <>
      <Heading level={1}>Wat voor u geldt</Heading>
      <div className="rhc-mox-card">
        <Stappen huidige={4} />
        <Overzicht
          labels={situaties.gemeente.labels}
          kvk={werkgeverVan(organisatie).kvkNummer}
        />
      </div>
    </>
  );
};

export default OverzichtPage;
