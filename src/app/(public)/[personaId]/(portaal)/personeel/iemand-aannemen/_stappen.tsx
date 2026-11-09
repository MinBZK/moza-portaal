import Voortgang from "./_voortgang";

/** The heading of every step: the task itself. */
export { TAAK_TITEL } from "./_taakTitel";

/**
 * De stappen om een regeling in te dienen. De voorbeeldberekening gaat
 * eraan vooraf en is geen stap; na stap 2 volgt de bedankpagina (verstuurd).
 */
export const STAPPEN = [
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
export const verderNaar = (stap: 2) => `Verder naar ${STAPPEN[stap - 1].name}`;

/** Text of the back button: "Terug naar" and the name of the previous step. */
export const terugNaar = (stap: 1) => `Terug naar ${STAPPEN[stap - 1].name}`;

/** Waar de ondernemer is in Iemand aannemen (1 of 2). */
const Stappen = ({ huidige }: { huidige: 1 | 2 }) => (
  <Voortgang steps={STAPPEN} huidige={huidige} />
);

export default Stappen;
