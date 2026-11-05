import StepIndicator from "@/components/StepIndicator";

/** The heading of every step: the task itself. */
export const TAAK_TITEL = "Iemand aannemen met afstand tot de arbeidsmarkt";

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
    name: "Aanvraag nakijken",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
  {
    name: "Controleren en versturen",
    href: "/personeel/iemand-aannemen/versturen",
  },
];

/** Waar de ondernemer is in Iemand aannemen (1 tot 4). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 | 4 }) => (
  <StepIndicator steps={STAPPEN} current={huidige - 1} label="Stappen" />
);

export default Stappen;
