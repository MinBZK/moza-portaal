import { wisAannemen } from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_useAannemen";
import { verwijderZakenVan } from "@/app/(public)/[personaId]/(portaal)/lopendezaken/_assistentZaken";

/**
 * Zet de interactie-flows terug naar het begin, voor een nieuwe sessie in een
 * onderzoek: de antwoorden en de zaken die de flow in Lopende zaken zette.
 * Flags en persona blijven staan; daarvoor is "Alles wissen".
 */
const FLOWS: (() => void)[] = [
  wisAannemen,
  () => verwijderZakenVan("iemand-aannemen"),
];

export const herstelFlows = () => FLOWS.forEach((herstel) => herstel());
