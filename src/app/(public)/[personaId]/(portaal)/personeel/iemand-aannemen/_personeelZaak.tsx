"use client";

import Link from "next/link";
import { Button, Heading, Paragraph } from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { statusTekst, useAannemen, wisAannemen } from "./_useAannemen";

/**
 * Op Personeel: de zaak van Koen zodra de aanvraag is verstuurd, en het blok
 * voor de onderzoeker (opnieuw beginnen; persona's wisselt u in het
 * Flags-paneel, dat wist dit scenario mee).
 */
const PersoneelZaak = ({ zaak }: { zaak: DemoAannemen["zaak"] }) => {
  const { staat } = useAannemen();
  return (
    <>
      {staat?.ingediend && (
        <section className="rhc-mox-card" aria-labelledby="personeel-zaken">
          <Heading level={2} id="personeel-zaken">
            Lopende zaken over personeel
          </Heading>
          <Paragraph>
            <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
              {zaak.onderwerp}
            </Link>
            <br />
            {zaak.organisatie} · {statusTekst(staat)}
          </Paragraph>
        </section>
      )}
      <section
        className="rhc-mox-card mox-hiring-research"
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
