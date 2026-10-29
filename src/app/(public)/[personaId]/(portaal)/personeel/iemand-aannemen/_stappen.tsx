import StepIndicator from "@/components/StepIndicator";

const STAPPEN = [
  {
    name: "U ziet wat dit voor u betekent",
    href: "/personeel/iemand-aannemen",
  },
  {
    name: "Wij vullen de aanvraag voor u in",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "U controleert en verstuurt zelf",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
];

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <StepIndicator steps={STAPPEN} current={huidige - 1} label="Stappen" />
);

export default Stappen;
