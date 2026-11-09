import InfoToggletip from "@/components/InfoToggletip";
import { Paragraph } from "@/components/rhc";

/**
 * Begrippen van Iemand aannemen, met een korte uitleg. Een begrip krijgt een
 * (i) naast de naam of titel waar het in een stap voorkomt.
 */
export const BEGRIPPEN = {
  loonkostensubsidie: {
    vraag: "Wat is loonkostensubsidie?",
    uitleg:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon.",
    door: "de gemeente",
  },
  loondispensatie: {
    vraag: "Wat is loondispensatie?",
    uitleg:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan.",
    door: "UWV",
  },
  loonkostenvoordeel: {
    vraag: "Wat is loonkostenvoordeel?",
    uitleg:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring.",
    door: "de Belastingdienst",
  },
  noRiskpolis: {
    vraag: "Wat is de no-riskpolis?",
    uitleg:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. U hoeft niets aan te vragen.",
    door: "UWV",
  },
  jobcoaching: {
    vraag: "Wat is jobcoaching?",
    uitleg: "Begeleiding op de werkplek door een jobcoach.",
    door: "de gemeente of UWV",
  },
  werkplekaanpassing: {
    vraag: "Wat is een werkplekaanpassing?",
    uitleg: "Een aangepaste werkplek of een hulpmiddel voor uw werknemer.",
    door: "de gemeente of UWV",
  },
  proefplaatsing: {
    vraag: "Wat is een proefplaatsing?",
    uitleg:
      "De kandidaat werkt eerst op proef bij u, zonder dat u loon betaalt.",
    door: "de gemeente of UWV",
  },
  doelgroepregister: {
    vraag: "Wat is het doelgroepregister?",
    uitleg:
      "UWV houdt een lijst bij van mensen die door een ziekte of beperking niet zelfstandig het minimumloon kunnen verdienen. Staat uw werknemer op deze lijst? Dan kunt u loonkostenvoordeel krijgen.",
    door: "UWV",
  },
  doelgroepverklaring: {
    vraag: "Wat is een doelgroepverklaring?",
    uitleg:
      "Een verklaring dat de werknemer bij een doelgroep hoort, bijvoorbeeld omdat die een uitkering had. De werknemer vraagt die zelf aan. Met de verklaring kunt u loonkostenvoordeel krijgen.",
    door: "UWV",
  },
} as const;

export type BegripId = keyof typeof BEGRIPPEN;

/** De (i) met de uitleg van een begrip. */
export const BegripInfo = ({ id }: { id: BegripId }) => {
  const { vraag, uitleg, door } = BEGRIPPEN[id];
  return (
    <InfoToggletip label={vraag}>
      <Paragraph>{uitleg}</Paragraph>
      <Paragraph>Uitgevoerd door {door}.</Paragraph>
    </InfoToggletip>
  );
};
