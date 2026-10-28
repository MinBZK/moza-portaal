"use client";

import { useState } from "react";
import { DataSummary, DataSummaryItem, Paragraph } from "@/components/rhc";
import NumberInput from "@/components/NumberInput";

/*
 * Indicatieve berekening voor het prototype. De bedragen zijn aannames, geen
 * officiele tarieven:
 * - werkgeverslasten: ongeveer 30% bovenop het brutoloon;
 * - loonkostenvoordeel doelgroep banenafspraak: € 3,05 per verloond uur,
 *   hoogstens € 6.100 per jaar.
 */
const WEKEN_PER_MAAND = 52 / 12;
const WERKGEVERSLASTEN = 0.3;
const LKV_PER_UUR = 3.05;
const LKV_PER_JAAR = 6100;

/** Bedrag zoals de schrijfwijzer het wil: euroteken direct voor het getal, €1.234. */
const euro = {
  format: (n: number) =>
    `€${n.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`,
};

/** "Wat kost het?": rekent mee als de gebruiker de uren aanpast. */
const KostenBerekening = ({
  urenPerWeek: startUren,
  brutoPerMaand: startBruto,
}: {
  urenPerWeek: number;
  brutoPerMaand: number;
}) => {
  const [uren, setUren] = useState(startUren);
  const uurloon = startBruto / (startUren * WEKEN_PER_MAAND);

  const urenPerMaand = uren * WEKEN_PER_MAAND;
  const bruto = uurloon * urenPerMaand;
  const lasten = bruto * WERKGEVERSLASTEN;
  const voordeel = Math.min(LKV_PER_UUR * urenPerMaand, LKV_PER_JAAR / 12);
  const kosten = bruto + lasten - voordeel;

  return (
    <>
      <NumberInput
        label="Uren per week"
        min={8}
        max={40}
        value={uren}
        onChange={(event) => {
          const getal = Number(event.target.value);
          if (event.target.value !== "" && !Number.isNaN(getal)) setUren(getal);
        }}
      />
      {/* Schermlezers horen de nieuwe uitkomst na elke wijziging. */}
      <div aria-live="polite">
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Brutoloon per maand"
            itemValue={euro.format(bruto)}
          />
          <DataSummaryItem
            itemKey="Werkgeverslasten (ongeveer 30%)"
            itemValue={euro.format(lasten)}
          />
          <DataSummaryItem
            itemKey="Loonkostenvoordeel"
            itemValue={`−${euro.format(voordeel)}`}
          />
          <DataSummaryItem
            itemKey="Kosten per maand"
            itemValue={euro.format(kosten)}
          />
        </DataSummary>
      </div>
      <Paragraph>
        Dit is een schatting. De echte bedragen hangen af van de kandidaat en
        van de regelingen die u aanvraagt.
      </Paragraph>
    </>
  );
};

export default KostenBerekening;
