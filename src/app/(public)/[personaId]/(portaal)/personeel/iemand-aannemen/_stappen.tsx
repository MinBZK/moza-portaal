import Voortgang from "./_voortgang";

/** The heading of every step: the task itself. */
export const TAAK_TITEL = "Iemand aannemen met afstand tot de arbeidsmarkt";

export const STAPPEN = [
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

/** Text of the forward button: "Verder naar" and the name of the next step. */
export const verderNaar = (stap: 2 | 3 | 4) =>
  `Verder naar ${STAPPEN[stap - 1].name}`;

/** Text of the back button: "Terug naar" and the name of the previous step. */
export const terugNaar = (stap: 1 | 2 | 3) =>
  `Terug naar ${STAPPEN[stap - 1].name}`;

/** Waar de ondernemer is in Iemand aannemen (1 tot 4). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 | 4 }) => (
  <Voortgang steps={STAPPEN} huidige={huidige} />
);

export default Stappen;
