"use client";

import Link from "next/link";
import { Heading, Paragraph } from "@rijkshuisstijl-community/components-react";
import type { DemoBericht } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "./_berichtDetail";
import DemoBerichtInhoud from "./_demoBerichtInhoud";
import { useNieuweBerichten } from "./_demoSimulatie";

/** Een binnengedruppeld demo-bericht. Dat staat alleen in deze browser. */
const NieuwBericht = ({
  berichtId,
  berichten,
}: {
  berichtId: string;
  berichten: DemoBericht[];
}) => {
  const nieuwe = useNieuweBerichten();
  if (nieuwe === null)
    return <Paragraph role="status">Uw bericht wordt geladen.</Paragraph>;

  const bericht = nieuwe.find((b) => b.id === berichtId);
  if (!bericht) {
    return (
      <>
        <Heading level={1}>Bericht niet gevonden</Heading>
        <Paragraph>Dit bericht staat niet (meer) in uw Berichtenbox.</Paragraph>
        <Paragraph>
          <Link
            href="/berichtenbox"
            className="utrecht-link utrecht-link--html-a"
          >
            Ga naar uw inbox
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
      <BerichtDetail berichten={berichten} berichtId={bericht.id}>
        <DemoBerichtInhoud bericht={bericht} />
      </BerichtDetail>
    </>
  );
};

export default NieuwBericht;
