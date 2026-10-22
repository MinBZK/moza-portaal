import { Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemen, getDemoIemandAannemenTraces } from "@/demo";
import {
  getActieveOrganisatie,
  getActievePersona,
} from "@/app/(public)/_persona";
import Aanvraag from "./_aanvraag";
import Stappen from "../_stappen";
import { vul, werkgeverVan } from "../_werkgever";

/** Scherm 3: de vooringevulde aanvraag, per regeling een paneel. */
const ConceptAanvraagPage = async () => {
  const [aannemen, traces, persona] = await Promise.all([
    getDemoIemandAannemen(),
    getDemoIemandAannemenTraces(),
    getActievePersona(),
  ]);
  const organisatie = await getActieveOrganisatie(persona);
  const werkgever = werkgeverVan(organisatie);
  const bronnen = aannemen.bronnen.map((bron) => ({
    ...bron,
    gegevens: bron.gegevens.map((g) => ({
      ...g,
      waarde: vul(g.waarde, werkgever),
    })),
  }));
  const { kandidaat } = aannemen;
  return (
    <>
      <Heading level={1}>
        Regelingen voor het aannemen van {kandidaat.voornaam}{" "}
        {kandidaat.achternaam}
      </Heading>
      <Stappen huidige={3} />
      <Paragraph>
        We hebben zeven regelingen voor u nagelopen. Zes kunnen gelden.
        Controleer per regeling de gegevens en vul aan wat nog ontbreekt.
      </Paragraph>
      <Aanvraag
        aannemen={aannemen}
        traces={traces}
        bronnen={bronnen}
        werkgever={werkgever}
        ondernemer={
          persona
            ? `${persona.persoon.voornaam} ${persona.persoon.achternaam}`
            : "u"
        }
      />
    </>
  );
};

export default ConceptAanvraagPage;
