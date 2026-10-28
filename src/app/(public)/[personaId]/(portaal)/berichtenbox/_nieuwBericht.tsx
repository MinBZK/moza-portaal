"use client";

import Link from "next/link";
import { Heading, Paragraph } from "@rijkshuisstijl-community/components-react";
import type { BerichtenboxVariant } from "@/app/(private)/instellingen/_featureFlags";
import type { DemoBericht } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "./_berichtDetail";
import DemoBerichtInhoud from "./_demoBerichtInhoud";
import { useNieuweBerichten } from "./_demoSimulatie";

/** Een binnengedruppeld demo-bericht. Dat staat alleen in deze browser. */
const NieuwBericht = ({
  berichtId,
  berichten,
  variant,
}: {
  berichtId: string;
  berichten: DemoBericht[];
  variant: BerichtenboxVariant;
}) => {
  const nieuwe = useNieuweBerichten();
  if (nieuwe === null)
    return <Paragraph role="status">Wij halen uw bericht op.</Paragraph>;

  const bericht = nieuwe.find((b) => b.id === berichtId);
  if (!bericht) {
    return (
      <>
        <Heading level={1}>Bericht niet gevonden</Heading>
        <Paragraph>Dit bericht staat niet (meer) in uw berichtenbox.</Paragraph>
        <Paragraph>
          <Link
            href="/berichtenbox"
            className="utrecht-link utrecht-link--html-a"
          >
            Naar uw berichtenbox
          </Link>
        </Paragraph>
      </>
    );
  }

  return (
    <>
      <HuidigeKruimel
        pad={`/berichtenbox/${bericht.id}`}
        label={bericht.onderwerp}
      />
      {/* De lijst van de server kent dit bericht niet; zonder het nieuwe bericht
          erbij weet BerichtDetail niet of het (on)gelezen is. */}
      <BerichtDetail
        berichten={[...nieuwe, ...berichten]}
        berichtId={bericht.id}
      >
        <DemoBerichtInhoud bericht={bericht} variant={variant} />
      </BerichtDetail>
    </>
  );
};

export default NieuwBericht;
