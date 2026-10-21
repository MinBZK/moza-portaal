"use client";

// Tijdelijke voorbeeldpagina om RangeSlider te bekijken. Niet committen.
import { useState } from "react";
import { Heading, Paragraph } from "@/components/rhc";
import RangeSlider from "@/components/RangeSlider";

const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const VoorbeeldRangeSlider = () => {
  const [loon, setLoon] = useState(2250);

  return (
    <>
      <Heading level={1}>Voorbeeld RangeSlider</Heading>
      <div className="mox-card rhc-row-gap">
        <Heading level={2}>Met defaultValue</Heading>
        <RangeSlider
          label="Uren per week"
          min={8}
          max={40}
          defaultValue={32}
          formatWaarde={(uren) => `${uren} uur`}
        />

        <Heading level={2}>Met value en onChange</Heading>
        <RangeSlider
          label="Bruto loon per maand"
          min={1500}
          max={4000}
          step={50}
          value={loon}
          onChange={setLoon}
          formatWaarde={euro.format}
          gevuld
        />
        <Paragraph>Per jaar: {euro.format(loon * 12)}</Paragraph>
      </div>
    </>
  );
};

export default VoorbeeldRangeSlider;
