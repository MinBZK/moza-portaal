import Voortgang from "./_voortgang";

/** The heading of every step: the task itself. */
export { TAAK_TITEL } from "./_taakTitel";

/**
 * De drie stappen van Iemand aannemen. Na stap 3 volgt de bedankpagina
 * (verstuurd), buiten de stappen.
 */
export const STAPPEN = [
  {
    name: "Voorbeeldberekening",
    href: "/personeel/iemand-aannemen/voorbeeldberekening",
  },
  {
    name: "Kandidaat selecteren",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "Controleren en dossier indienen",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
];

/** Text of the forward button: "Verder naar" and the name of the next step. */
export const verderNaar = (stap: 2 | 3) =>
  `Verder naar ${STAPPEN[stap - 1].name}`;

/** Text of the back button: "Terug naar" and the name of the previous step. */
export const terugNaar = (stap: 1 | 2) =>
  `Terug naar ${STAPPEN[stap - 1].name}`;

/** Waar de ondernemer is in Iemand aannemen (1 tot 3). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <Voortgang steps={STAPPEN} huidige={huidige} />
);

export default Stappen;
