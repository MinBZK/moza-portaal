"use client";

import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import type { DemoAannemen, DemoAannemenSituatie } from "@/demo";
import { statusTekst, useAannemen, zaakVan } from "./_useAannemen";

const SITUATIES: DemoAannemenSituatie[] = ["gemeente", "wajong", "wia"];

/** Op Personeel: de zaak van elke situatie met een ingediende aanvraag. */
const PersoneelZaak = ({
  zaken,
}: {
  zaken: Record<DemoAannemenSituatie, DemoAannemen["zaak"]>;
}) => {
  const { staat } = useAannemen();
  const lopend = staat
    ? SITUATIES.filter((situatie) => zaakVan(staat, situatie).ingediend)
    : [];
  if (!staat || lopend.length === 0) return null;
  return (
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
            {zaakVan(staat, situatie).onderwerp ?? zaken[situatie].onderwerp}
          </Link>
          <br />
          {zaken[situatie].organisatie} ·{" "}
          {statusTekst(zaakVan(staat, situatie), situatie)}
        </Paragraph>
      ))}
    </section>
  );
};

export default PersoneelZaak;
