import { getDemoIemandAannemenSituaties } from "@/demo";
import type { DemoAannemen } from "@/demo";
import {
  getActieveOrganisatie,
  getActievePersona,
} from "@/app/(public)/_persona";
import Aanvraag from "./_aanvraag";
import { vul, werkgeverVan } from "../_werkgever";

/** Scherm 3: de vooringevulde aanvraag, per organisatie de panelen van de situatie. */
const ConceptAanvraagPage = async () => {
  const [situaties, persona] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActievePersona(),
  ]);
  const organisatie = await getActieveOrganisatie(persona);
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
  return (
    <Aanvraag
      perSituatie={{
        gemeente: gevuld(situaties.gemeente),
        wajong: gevuld(situaties.wajong),
        wia: gevuld(situaties.wia),
      }}
      werkgever={werkgever}
      ondernemer={
        persona
          ? `${persona.persoon.voornaam} ${persona.persoon.achternaam}`
          : "u"
      }
    />
  );
};

export default ConceptAanvraagPage;
