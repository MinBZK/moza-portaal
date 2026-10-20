"use client";

import { Paragraph } from "@/components/rhc";
import type { DemoAannemenTrace } from "@/demo";
import { useAannemen } from "../_useAannemen";
import { euro, waarde } from "../_werkgever";
import { useBerekening, useManifest, type Invoer } from "../_useRegelrecht";

/**
 * Rekent een regeling live uit met de regelrecht-engine in de browser, op de
 * gegevens van de bevestigde bronnen en het aantal uren uit het formulier.
 * Lukt dat niet, dan blijft de vooraf berekende waarde staan (de trace).
 */

const PARAMETER_UREN: Record<string, string[]> = {
  participatiewet: ["overeengekomen_arbeidsduur_uren_per_week"],
  wet_tegemoetkomingen_loondomein: [
    "verloonde_uren",
    "verloonde_uren_voorwaarden_2_10",
  ],
};

/** De invoer van de engine: de gegevens van de trace, met de uren van het formulier. */
export const invoerVan = (
  trace: DemoAannemenTrace,
  uren: number | undefined,
  uitleggen: string[],
): Invoer => {
  const parameters: Record<string, unknown> = { ...trace.gegevens };
  if (uren) {
    for (const naam of PARAMETER_UREN[trace.wet] ?? []) {
      if (naam in parameters)
        parameters[naam] = naam.startsWith("verloonde") ? uren * 52 : uren;
    }
  }
  return {
    wet: trace.wet,
    output: trace.uitkomst,
    peildatum: trace.peildatum,
    parameters,
    uitleggen,
  };
};

const LiveBedrag = ({
  trace,
  bedragOutput,
  perTekst,
  labels,
}: {
  trace: DemoAannemenTrace;
  /** De output met het bedrag in eurocent. */
  bedragOutput: string;
  perTekst: string;
  labels: Record<string, string>;
}) => {
  const { staat } = useAannemen();
  const uren = staat?.uren;
  const stand = useBerekening(
    staat ? invoerVan(trace, uren, [bedragOutput]) : null,
  );
  const manifest = useManifest();

  if (stand.status === "laden")
    return <Paragraph>De regelrecht-engine rekent in uw browser…</Paragraph>;
  if (stand.status === "fout")
    return (
      <Paragraph>
        Vooraf berekend (de engine in de browser is niet beschikbaar:{" "}
        {stand.fout}).
      </Paragraph>
    );
  const b = stand.waarde;
  const bedrag = b.outputs[bedragOutput];
  const recht = b.outputs[trace.uitkomst];
  return (
    <>
      <Paragraph>
        <strong>
          {bedrag === null || bedrag === undefined
            ? "geen bedrag"
            : euro(bedrag)}{" "}
          {perTekst}
        </strong>{" "}
        bij {uren ?? 32} uur per week;{" "}
        {labels[trace.uitkomst] ?? trace.uitkomst}:{" "}
        {waarde(trace.uitkomst, recht)}.
      </Paragraph>
      <Paragraph>
        Zojuist berekend in uw browser door de regelrecht-engine
        {manifest.status === "klaar" &&
          ` (engine ${manifest.waarde.regelrecht.slice(0, 8)}, corpus ${manifest.waarde.corpus.revisie.slice(0, 8)})`}
        , wetsversie van 1 juli 2026.
      </Paragraph>
    </>
  );
};

export default LiveBedrag;
