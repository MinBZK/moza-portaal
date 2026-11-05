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
      <PageSearch />
      <Paragraph>
        <Link
          href="/personeel/iemand-aannemen/voorbeeldberekening"
          className="utrecht-link utrecht-link--html-a"
        >
          <Icon icon="chevron-left" />
          Terug naar de vragen
        </Link>
      </Paragraph>
      <div className="rhc-mox-card">
        <Stappen huidige={3} />
        <Alert type="info" closable>
          <Paragraph>
            Om de aanvragen in te vullen, halen wij gegevens op bij de
            organisaties die ze al hebben. U hoeft ze dan niet zelf op te
            zoeken.
          </Paragraph>
          <Paragraph>
            Wij versturen nog niets. De ingevulde aanvraag staat alleen in uw
            omgeving, tot u die zelf verstuurt.
          </Paragraph>
        </Alert>
        <Bronnen perSituatie={perSituatie} />
      </div>
    </>
  );
};

export default GegevensPage;
