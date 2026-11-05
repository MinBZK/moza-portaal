import Voortgang from "./_voortgang";

/** The heading of every step: the task itself. */
export { TAAK_TITEL } from "./_taakTitel";

/**
 * De stappen naar het voorbeeld van het concept-prototype. Stap 4 beslaat
 * twee schermen: de ingevulde aanvraag controleren en die versturen.
 */
export const STAPPEN = [
  {
    name: "Lees wat er kan",
    href: "/personeel/iemand-aannemen",
  },
  {
    name: "Voorbeeldberekening",
    href: "/personeel/iemand-aannemen/voorbeeldberekening",
  },
  {
    name: "Laat de aanvraag invullen",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "Controleren en versturen",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
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
