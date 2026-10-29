import StepIndicator from "@/components/StepIndicator";

const STAPPEN = ["Voorbeeldberekening", "Gegevens delen", "Aanvragen"];

/** Waar elke stap begint; een afgeronde stap is zo terug te openen. */
const PADEN = [
  "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt",
  "/personeel/iemand-aannemen/gegevens",
  "/personeel/iemand-aannemen/concept-aanvraag",
];

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <StepIndicator
    steps={STAPPEN}
    current={huidige - 1}
    label="Stappen"
    hideCount
    hrefs={PADEN}
  />
);

export default Stappen;
