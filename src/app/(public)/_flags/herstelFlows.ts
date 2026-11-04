import { wisAannemen } from "@/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_useAannemen";

/**
 * Zet de interactie-flows terug naar het begin, voor een nieuwe sessie in een
 * onderzoek. Flags en persona blijven staan; daarvoor is "Alles wissen".
 */
const FLOWS: (() => void)[] = [wisAannemen];

export const herstelFlows = () => FLOWS.forEach((herstel) => herstel());
