import Voortgang from "./_voortgang";

/** The heading of every step: the task itself. */
export { TAAK_TITEL } from "./_taakTitel";

/**
 * De stappen om een regeling in te dienen. De voorbeeldberekening gaat
 * eraan vooraf en is geen stap; na stap 2 volgt de bedankpagina (verstuurd).
 */
export const STAPPEN = [
  {
    name: "Kandidaat kiezen",
    href: "/personeel/iemand-aannemen/gegevens",
  },
  {
    name: "Controleren en versturen",
    href: "/personeel/iemand-aannemen/concept-aanvraag",
  },
];

/** Text of the forward button: "Verder naar" and the name of the next step. */
export const verderNaar = (stap: 1 | 2) =>
  `Verder naar ${STAPPEN[stap - 1].name}`;

/** Text of the back button: "Terug naar" and the name of the previous step. */
export const terugNaar = (stap: 1) => `Terug naar ${STAPPEN[stap - 1].name}`;

/**
 * Waar de ondernemer is in Iemand aannemen (1 of 2). Met
 * `volgendeBereikbaar={false}` is de volgende stap gewone tekst, ook als de
 * ondernemer er eerder al was: die stap kan nu nog niet.
 */
const Stappen = ({
  huidige,
  volgendeBereikbaar = true,
}: {
  huidige: 1 | 2;
  volgendeBereikbaar?: boolean;
}) => (
  <Voortgang
    steps={STAPPEN}
    huidige={huidige}
    volgendeBereikbaar={volgendeBereikbaar}
  />
);

export default Stappen;
