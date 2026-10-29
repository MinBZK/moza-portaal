"use client";

import Link from "next/link";
import { Button, Heading, Paragraph } from "@/components/rhc";
import type { DemoAannemen, DemoAannemenSituatie } from "@/demo";
import { statusTekst, useAannemen, wisAannemen, zaakVan } from "./_useAannemen";

const SITUATIES: DemoAannemenSituatie[] = ["gemeente", "wajong", "wia"];

/**
 * Op Personeel: de zaak van elke situatie met een ingediende aanvraag, en het blok
 * voor de onderzoeker (opnieuw beginnen; persona's wisselt u in het
 * Flags-paneel, dat wist dit scenario mee).
 */
const PersoneelZaak = ({
  zaken,
}: {
  zaken: Record<DemoAannemenSituatie, DemoAannemen["zaak"]>;
}) => {
  const { staat } = useAannemen();
  const lopend = staat
    ? SITUATIES.filter((situatie) => zaakVan(staat, situatie).ingediend)
    : [];
  return (
    <>
      {staat && lopend.length > 0 && (
        <section className="rhc-mox-card" aria-labelledby="personeel-zaken">
          <Heading level={2} id="personeel-zaken">
            Lopende zaken over personeel
          </Heading>
          {lopend.map((situatie) => (
            <Paragraph key={situatie}>
              <Link
                href={zaken[situatie].url}
                className="utrecht-link utrecht-link--html-a"
              >
                {zaakVan(staat, situatie).onderwerp ??
                  zaken[situatie].onderwerp}
              </Link>
              <br />
              {zaken[situatie].organisatie} ·{" "}
              {statusTekst(zaakVan(staat, situatie), situatie)}
            </Paragraph>
          ))}
        </section>
      )}
      <section
        className="rhc-mox-card rhc-mox-row-gap prototype-research-card"
        aria-labelledby="onderzoeker"
      >
        <Heading level={2} id="onderzoeker">
          Voor de onderzoeker
        </Heading>
        <Paragraph>
          Een andere ondernemer kiest u in het Flags-paneel (persona). De
          kandidaat blijft Koen de Wit; bij een wissel begint het scenario
          opnieuw.
        </Paragraph>
        <Button appearance="secondary-action-button" onClick={wisAannemen}>
          Begin het scenario opnieuw
        </Button>
      </section>
    </>
  );
};

export default PersoneelZaak;
