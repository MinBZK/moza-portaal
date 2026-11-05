import type { Metadata } from "next";
import { Alert, Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import type { DemoAannemen } from "@/demo";
import Bronnen from "./_bronnen";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import { vul, werkgeverVan } from "../_werkgever";

export const metadata: Metadata = {
  title: "Laat de aanvraag invullen - Iemand aannemen - Personeel en rollen",
};

/** Scherm 2: aanvraag invullen. De kandidaat, en per bron bevestigen. Wie invult weten we al uit de inlog. */
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
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card">
        <Stappen huidige={3} />
        <Alert type="info" closable>
          <Paragraph>
            Wij halen gegevens over uw onderneming op. UWV en de gemeente
            bekijken zelf de gegevens over de kandidaat.
          </Paragraph>
          <Paragraph>
            De aanvraag versturen wij pas als u dat zelf doet.
          </Paragraph>
        </Alert>
        <Bronnen perSituatie={perSituatie} />
      </div>
    </>
  );
};

export default GegevensPage;
