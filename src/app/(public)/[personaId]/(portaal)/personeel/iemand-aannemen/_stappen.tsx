import StepIndicator from "@/components/StepIndicator";

const STAPPEN = [
  {
    name: "Voorbeeldberekening",
    href: "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt",
  },
  {
    name: "Gegevens delen",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "Aanvragen",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
];

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <StepIndicator
    steps={STAPPEN}
    current={huidige - 1}
    label="Stappen"
    hideCount
  />
);

export default Stappen;
