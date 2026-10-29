import StepIndicator from "@/components/StepIndicator";

const STAPPEN = ["Voorbeeldberekening", "Gegevens delen", "Aanvragen"];

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <StepIndicator steps={STAPPEN} current={huidige - 1} label="Stappen" />
);

export default Stappen;
