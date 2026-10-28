import StepIndicator from "@/components/StepIndicator";

const STAPPEN = [
  "U ziet wat dit voor u betekent",
  "Wij vullen de aanvraag voor u in",
  "U controleert en verstuurt zelf",
];

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <StepIndicator steps={STAPPEN} current={huidige - 1} label="Stappen" />
);

export default Stappen;
