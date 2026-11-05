import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Versturen from "./_versturen";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import { werkgeverVan } from "../_werkgever";

export const metadata: Metadata = {
  title: "Controleren en versturen - Iemand aannemen - Personeel en rollen",
};

/** Scherm 4: wat wordt verstuurd, bij wie, en de bevestiging. */
const VersturenPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card">
        <Stappen huidige={4} />
        <Paragraph>
          Dit verstuurt u, en naar wie. Klopt er iets niet? Ga terug naar de
          aanvraag om het aan te passen.
        </Paragraph>
        <Versturen
          perSituatie={{
            gemeente: situaties.gemeente,
            wajong: situaties.wajong,
          }}
          werkgever={werkgeverVan(organisatie)}
        />
      </div>
    </>
  );
};

export default VersturenPage;
